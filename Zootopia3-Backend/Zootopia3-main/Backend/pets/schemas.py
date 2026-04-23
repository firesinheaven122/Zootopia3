from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

class PetCreateSchema(BaseModel):
    owner_id: Optional[int] = None
    name: str
    species: str
    breed: Optional[str] = None
    birth_date: Optional[datetime] = None
    body_girth: Optional[Decimal] = None  
    back_length: Optional[Decimal] = None
    weight: Optional[Decimal] = None

class PetUpdateSchema(BaseModel):
    name: Optional[str] = None
    species: Optional[str] = None
    breed: Optional[str] = None
    birth_date: Optional[datetime] = None
    body_girth: Optional[Decimal] = None
    back_length: Optional[Decimal] = None
    weight: Optional[Decimal] = None

class PetResponseSchema(BaseModel):
    id: int
    owner_id: int
    name: str
    species: Optional[str] = None
    breed: Optional[str] = None
    birth_date: Optional[datetime] = None
    body_girth: Optional[Decimal] = None
    back_length: Optional[Decimal] = None
    weight: Optional[Decimal] = None

    class Config:
        from_attributes = True