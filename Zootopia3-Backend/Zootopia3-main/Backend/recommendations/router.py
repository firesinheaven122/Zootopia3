from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Recommendation, Pet, Product, ProductSpecies
from recommendations.schemas import RecommendationResponseSchema
from recommendations.ml_model import train_model, get_recommendations
from recommendations.train_data import get_training_data
from auth.dependencies import require_client, require_admin, get_current_user
from audit.router import write_log
from surprise.model_selection import cross_validate

router = APIRouter(prefix="/recommendations", tags=["Рекомендации"])


@router.post("/train")
def train(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    data = get_training_data()
    if not data:
        raise HTTPException(status_code=400, detail="Недостаточно данных для обучения")
    success = train_model(data)
    if not success:
        raise HTTPException(status_code=500, detail="Ошибка обучения модели")
    return {"message": f"Модель обучена на {len(data)} записях"}


@router.post("/generate")
def generate(
    db: Session = Depends(get_db),
    current_user=Depends(require_client)
):
    pets = db.query(Pet).filter(Pet.owner_id == current_user.id).all()
    if not pets:
        raise HTTPException(status_code=404, detail="У вас нет питомцев")

    all_products = db.query(Product).filter(
        Product.is_active == True,
        Product.quantity > 0
    ).all()
    product_ids = [p.id for p in all_products]

    created = 0
    for pet in pets:
        ml_results = get_recommendations(
            client_id=current_user.id,
            product_ids=product_ids,
            pet=pet,
            top_n=5
        )

        for result in ml_results:
            existing = db.query(Recommendation).filter(
                Recommendation.client_id == current_user.id,
                Recommendation.pet_id == pet.id,
                Recommendation.product_id == result["product_id"]
            ).first()
            if existing:
                continue

            reason = "Рекомендовано AI на основе истории покупок"
            if pet.weight:
                reason += f" и веса питомца {pet.weight} кг"
            if pet.body_girth:
                reason += f", обхват тела {pet.body_girth} см"
            if pet.back_length:
                reason += f", длина спины {pet.back_length} см"

            rec = Recommendation(
                client_id=current_user.id,
                pet_id=pet.id,
                product_id=result["product_id"],
                score=round(result["score"] / 10, 2),
                reason=reason
            )
            db.add(rec)
            created += 1

    db.commit()

    write_log(
        db=db,
        user_id=current_user.id,
        action="GENERATE",
        entity="recommendations",
        log_type="user",
        details={"created": created}
    )

    return {"message": f"Создано рекомендаций: {created}"}


@router.get("/my", response_model=List[RecommendationResponseSchema])
def get_my_recommendations(
    db: Session = Depends(get_db),
    current_user=Depends(require_client)
):
    return db.query(Recommendation).filter(
        Recommendation.client_id == current_user.id
    ).all()

@router.get("/accuracy")
def get_accuracy(current_user=Depends(require_admin)):
    data = get_training_data()
    if not data:
        raise HTTPException(status_code=400, detail="Недостаточно данных")
    
    import pandas as pd
    from surprise import Dataset, Reader, SVD
    
    df = pd.DataFrame(data)
    reader = Reader(rating_scale=(1, 10))
    dataset = Dataset.load_from_df(
        df[["client_id", "product_id", "rating"]],
        reader
    )
    
    algo = SVD()
    results = cross_validate(algo, dataset, measures=["RMSE", "MAE"], cv=3, verbose=False)
    
    rmse = float(results["test_rmse"].mean())
    mae = float(results["test_mae"].mean())
    accuracy = round((1 - rmse / 10) * 100, 2)
    
    return {
        "rmse": round(rmse, 4),
        "mae": round(mae, 4),
        "accuracy_percent": f"{accuracy}%",
        "records_used": len(data)
    }