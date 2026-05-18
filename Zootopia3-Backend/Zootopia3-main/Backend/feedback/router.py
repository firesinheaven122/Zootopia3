from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Feedback
from feedback.schemas import FeedbackCreateSchema, FeedbackResponseSchema
from auth.dependencies import require_admin, get_current_user

router = APIRouter(prefix="/feedback", tags=["Обратная связь"])

# Отправить обращение — все включая гостей
@router.post("/", response_model=FeedbackResponseSchema)
def create_feedback(
    data: FeedbackCreateSchema,
    db: Session = Depends(get_db)
):
    fb = Feedback(
        name=data.name,
        email=data.email,
        subject=data.subject,
        message=data.message
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return fb

# Список всех обращений — только админ
@router.get("/", response_model=List[FeedbackResponseSchema])
def get_feedbacks(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    return db.query(Feedback).order_by(Feedback.created_at.desc()).all()

# Изменить статус обращения — только админ
@router.put("/{feedback_id}/status")
def update_status(
    feedback_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    fb = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if fb:
        fb.status = status
        db.commit()
    return {"message": "Статус обновлён"}