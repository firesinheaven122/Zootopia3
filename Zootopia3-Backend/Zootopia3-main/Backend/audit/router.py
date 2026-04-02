from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import AuditLog
from audit.schemas import AuditLogResponseSchema
from auth.dependencies import require_admin

router = APIRouter(prefix="/audit", tags=["Журнал действий"])

# Журнал действий пользователей (клиентов)
@router.get("/users", response_model=List[AuditLogResponseSchema])
def get_user_logs(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    return db.query(AuditLog).filter(
        AuditLog.log_type == "user"
    ).order_by(AuditLog.created_at.desc()).all()

# Журнал действий операторов (продавцов и админов)
@router.get("/operators", response_model=List[AuditLogResponseSchema])
def get_operator_logs(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    return db.query(AuditLog).filter(
        AuditLog.log_type == "operator"
    ).order_by(AuditLog.created_at.desc()).all()

# Все логи вместе
@router.get("/all", response_model=List[AuditLogResponseSchema])
def get_all_logs(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    return db.query(AuditLog).order_by(
        AuditLog.created_at.desc()
    ).all()

def write_log(
    db: Session,
    user_id: int,
    action: str,
    entity: str,
    log_type: str,
    entity_id: int = None,
    details: dict = None
):
    log = AuditLog(
        user_id=user_id,
        action=action,
        entity=entity,
        entity_id=entity_id,
        details=details,
        log_type=log_type
    )
    db.add(log)
    db.commit()