from pydantic import BaseModel, EmailStr
from typing import Optional

class RegisterSchema(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class TokenSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponseSchema(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str

    class Config:
        from_attributes = True