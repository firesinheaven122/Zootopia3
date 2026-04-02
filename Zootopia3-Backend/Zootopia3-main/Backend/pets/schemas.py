from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PetCreateSchema(BaseModel):
    owner_id: Optional[int] = None
    name: str
    species: str
    breed: Optional[str] = None
    birth_date: Optional[datetime] = None

class PetUpdateSchema(BaseModel):
    name: Optional[str] = None
    species: Optional[str] = None
    breed: Optional[str] = None
    birth_date: Optional[datetime] = None

class PetResponseSchema(BaseModel):
    id: int
    owner_id: int
    name: str
    species: str
    breed: Optional[str] = None
    birth_date: Optional[datetime] = None

    class Config:
        from_attributes = True