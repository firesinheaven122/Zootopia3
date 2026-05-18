from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class FeedbackCreateSchema(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class FeedbackResponseSchema(BaseModel):
    id: int
    name: str
    email: str
    subject: str
    message: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True