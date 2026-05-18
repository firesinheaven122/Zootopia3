from pydantic import BaseModel, EmailStr
from typing import Optional

class ClientCreateSchema(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None

class ClientUpdateSchema(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None

class ClientResponseSchema(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    is_active: bool

    class Config:
        from_attributes = True