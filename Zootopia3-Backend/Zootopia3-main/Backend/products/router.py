from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Product
from products.schemas import ProductCreateSchema, ProductUpdateSchema, ProductResponseSchema
from auth.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/products", tags=["Товары"])

# Получить все товары для всех
@router.get("/", response_model=List[ProductResponseSchema])
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).filter(Product.is_active == True).all()

# Получить один товар по id
@router.get("/{product_id}", response_model=ProductResponseSchema)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return product

# Создать товар
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

# Обновить товар
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

# Удалить товар
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