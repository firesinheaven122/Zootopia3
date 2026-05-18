import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Product
from products.schemas import ProductCreateSchema, ProductUpdateSchema, ProductResponseSchema
from auth.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/products", tags=["Товары"])

# Папка для хранения загруженных картинок
UPLOAD_DIR = "static/images"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/", response_model=List[ProductResponseSchema])
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).filter(Product.is_active == True).all()


@router.get("/{product_id}", response_model=ProductResponseSchema)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return product


@router.post("/", response_model=ProductResponseSchema)
def create_product(
    data: ProductCreateSchema,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    product = Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductResponseSchema)
def update_product(
    product_id: int,
    data: ProductUpdateSchema,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    product.is_active = False
    db.commit()
    return {"message": "Товар удалён"}


# Загрузка картинки товара — только для администратора
@router.post("/{product_id}/upload-image")
def upload_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")

    ext = file.filename.split(".")[-1].lower()
    allowed = {"jpg", "jpeg", "png", "webp", "gif"}
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="Недопустимый формат файла")

    filename = f"product_{product_id}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    image_url = f"/static/images/{filename}"
    product.image_url = image_url
    db.commit()
    db.refresh(product)

    return {"image_url": image_url}