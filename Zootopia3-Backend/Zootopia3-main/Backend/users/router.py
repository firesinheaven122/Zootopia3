from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, UserRole
from users.schemas import UserCreateSchema, UserResponseSchema
from auth.dependencies import require_admin
from auth.service import hash_password
from audit.router import write_log

router = APIRouter(prefix="/users", tags=["Пользователи"])

@router.get("/", response_model=List[UserResponseSchema])
def get_users(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    return db.query(User).all()

@router.post("/", response_model=UserResponseSchema)
def create_user(
    data: UserCreateSchema,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email уже занят")
    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        phone=data.phone,
        role=UserRole[data.role]
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    write_log(
        db=db,
        user_id=current_user.id,
        action="CREATE",
        entity="users",
        entity_id=user.id,
        log_type="operator",
        details={"email": user.email, "role": data.role}
    )

    return user

@router.put("/{user_id}/block")
def block_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    user.is_active = False
    db.commit()

    write_log(
        db=db,
        user_id=current_user.id,
        action="BLOCK",
        entity="users",
        entity_id=user_id,
        log_type="operator",
        details={"email": user.email}
    )

    return {"message": "Пользователь заблокирован"}

@router.put("/{user_id}/unblock")
def unblock_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    user.is_active = True
    db.commit()

    write_log(
        db=db,
        user_id=current_user.id,
        action="UNBLOCK",
        entity="users",
        entity_id=user_id,
        log_type="operator",
        details={"email": user.email}
    )

    return {"message": "Пользователь разблокирован"}