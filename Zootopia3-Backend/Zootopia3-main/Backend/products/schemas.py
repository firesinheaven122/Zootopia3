from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal

class ProductCreateSchema(BaseModel):
    category_id: int
    name: str
    article: Optional[str] = None
    description: Optional[str] = None
    price: Decimal = Field(..., gt=0, description="Цена должна быть больше 0")
    quantity: int = Field(0, ge=0, description="Количество не может быть отрицательным")
    unit: str = "шт"
    image_url: Optional[str] = None

class ProductUpdateSchema(BaseModel):
    name: Optional[str] = None
    article: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, gt=0)
    quantity: Optional[int] = Field(None, ge=0)
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