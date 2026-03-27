from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Sale, SaleItem, Product, User, UserRole
from sales.schemas import SaleCreateSchema, SaleResponseSchema
from auth.dependencies import require_seller, require_client, get_current_user

router = APIRouter(prefix="/sales", tags=["Продажи"])

# Получить все продажи — только админ и продавец
@router.get("/", response_model=List[SaleResponseSchema])
def get_sales(
    db: Session = Depends(get_db),
    current_user=Depends(require_seller)
):
    return db.query(Sale).all()

# История покупок клиента — клиент видит только свои
@router.get("/my", response_model=List[SaleResponseSchema])
def get_my_sales(
    db: Session = Depends(get_db),
    current_user=Depends(require_client)
):
    return db.query(Sale).filter(Sale.client_id == current_user.id).all()

# Получить одну продажу
@router.get("/{sale_id}", response_model=SaleResponseSchema)
def get_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Продажа не найдена")
    return sale

# Оформить продажу — админ и продавец
@router.post("/", response_model=SaleResponseSchema)
def create_sale(
    data: SaleCreateSchema,
    db: Session = Depends(get_db),
    current_user=Depends(require_seller)
):
    total = 0
    sale_items = []

    # Проверяем каждый товар
    for item in data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Товар {item.product_id} не найден"
            )
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Недостаточно товара '{product.name}' на складе. Остаток: {product.quantity}"
            )
        subtotal = product.price * item.quantity
        total += subtotal
        sale_items.append({
            "product": product,
            "quantity": item.quantity,
            "price_at_sale": product.price,
            "subtotal": subtotal
        })

    # Создаём чек
    sale = Sale(
        seller_id=current_user.id,
        client_id=data.client_id,
        total_amount=total,
        payment_type=data.payment_type
    )
    db.add(sale)
    db.flush()

    # Добавляем строки чека и списываем товар
    for item in sale_items:
        sale_item = SaleItem(
            sale_id=sale.id,
            product_id=item["product"].id,
            quantity=item["quantity"],
            price_at_sale=item["price_at_sale"],
            subtotal=item["subtotal"]
        )
        db.add(sale_item)
        item["product"].quantity -= item["quantity"]

    db.commit()
    db.refresh(sale)
    return sale