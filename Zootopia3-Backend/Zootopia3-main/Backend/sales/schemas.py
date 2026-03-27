from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal
from datetime import datetime

class SaleItemCreateSchema(BaseModel):
    product_id: int
    quantity: int

class SaleCreateSchema(BaseModel):
    client_id: Optional[int] = None
    payment_type: str
    items: List[SaleItemCreateSchema]

class SaleItemResponseSchema(BaseModel):
    id: int
    product_id: int
    quantity: int
    price_at_sale: Decimal
    subtotal: Decimal

    class Config:
        from_attributes = True

class SaleResponseSchema(BaseModel):
    id: int
    seller_id: int
    client_id: Optional[int] = None
    total_amount: Decimal
    payment_type: str
    created_at: datetime
    items: List[SaleItemResponseSchema] = []

    class Config:
        from_attributes = True