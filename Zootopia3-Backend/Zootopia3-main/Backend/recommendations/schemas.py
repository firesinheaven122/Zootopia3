from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime

class RecommendationResponseSchema(BaseModel):
    id: int
    client_id: int
    pet_id: Optional[int] = None
    product_id: int
    score: Decimal
    reason: Optional[str] = None
    is_shown: bool
    created_at: datetime

    class Config:
        from_attributes = True