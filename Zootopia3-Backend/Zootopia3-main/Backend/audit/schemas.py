from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AuditLogResponseSchema(BaseModel):
    id: int
    user_id: int
    action: str
    entity: str
    entity_id: Optional[int] = None
    details: Optional[dict] = None
    log_type: str
    created_at: datetime

    class Config:
        from_attributes = True
        