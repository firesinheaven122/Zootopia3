from pydantic import BaseModel, EmailStr, Field, model_validator, field_validator
from typing import Optional

class RegisterSchema(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Пароль не может быть пустым')
        if len(v) < 6:
            raise ValueError('Пароль должен содержать минимум 6 символов')
        return v

    @model_validator(mode='after')
    def resolve_name(self):
        if not self.full_name and self.name:
            self.full_name = self.name
        if not self.full_name:
            raise ValueError('Необходимо указать full_name или name')
        return self

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