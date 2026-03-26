from pydantic import BaseModel
from typing import Optional

class CategoryCreateSchema(BaseModel):
    name: str
    parent_id: Optional[int] = None

class CategoryUpdateSchema(BaseModel):
    name: Optional[str] = None
    parent_id: Optional[int] = None

class CategoryResponseSchema(BaseModel):
    id: int
    name: str
    parent_id: Optional[int] = None

    class Config:
        from_attributes = True