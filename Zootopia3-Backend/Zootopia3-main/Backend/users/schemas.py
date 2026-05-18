from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum

class StaffRole(str, Enum):
    seller = "seller"

class UserCreateSchema(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role: StaffRole = StaffRole.seller

class UserResponseSchema(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    is_active: bool

    class Config:
        from_attributes = True