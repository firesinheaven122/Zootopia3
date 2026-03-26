from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Category
from categories.schemas import CategoryCreateSchema, CategoryUpdateSchema, CategoryResponseSchema
from auth.dependencies import require_admin

router = APIRouter(prefix="/categories", tags=["Категории"])

@router.get("/", response_model=List[CategoryResponseSchema])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.get("/{category_id}", response_model=CategoryResponseSchema)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    return category

@router.post("/", response_model=CategoryResponseSchema)
def create_category(
    data: CategoryCreateSchema,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    category = Category(**data.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.put("/{category_id}", response_model=CategoryResponseSchema)
def update_category(
    category_id: int,
    data: CategoryUpdateSchema,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(category, key, value)
    db.commit()
    db.refresh(category)
    return category

@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    db.delete(category)
    db.commit()
    return {"message": "Категория удалена"}