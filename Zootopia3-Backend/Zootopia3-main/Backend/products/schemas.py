from pydantic import BaseModel
from typing import Optional
from decimal import Decimal

class ProductCreateSchema(BaseModel):
    category_id: int
    name: str
    article: Optional[str] = None
    description: Optional[str] = None
    price: Decimal
    quantity: int = 0
    unit: str = "шт"
    image_url: Optional[str] = None

class ProductUpdateSchema(BaseModel):
    name: Optional[str] = None
    article: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    quantity: Optional[int] = None
    unit: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

class ProductResponseSchema(BaseModel):
    id: int
    category_id: int
    name: str
    article: Optional[str] = None
    description: Optional[str] = None
    price: Decimal
    quantity: int
    unit: str
    image_url: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True