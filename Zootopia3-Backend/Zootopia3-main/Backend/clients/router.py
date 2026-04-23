from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, UserRole
from clients.schemas import ClientCreateSchema, ClientResponseSchema
from auth.dependencies import require_admin, require_seller
from auth.service import hash_password

router = APIRouter(prefix="/clients", tags=["Клиенты"])

@router.get("/", response_model=List[ClientResponseSchema])
def get_clients(
    db: Session = Depends(get_db),
    current_user=Depends(require_seller)
):
    return db.query(User).filter(User.role == UserRole.client).all()

@router.get("/{client_id}", response_model=ClientResponseSchema)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_seller)
):
    client = db.query(User).filter(
        User.id == client_id,
        User.role == UserRole.client
    ).first()
    if not client:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    return client


@router.put("/{client_id}/block")
def block_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    client = db.query(User).filter(
        User.id == client_id,
        User.role == UserRole.client
    ).first()
    if not client:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    client.is_active = False
    db.commit()
    return {"message": "Клиент заблокирован"}

@router.put("/{client_id}/unblock")
def unblock_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    client = db.query(User).filter(
        User.id == client_id,
        User.role == UserRole.client
    ).first()
    if not client:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    client.is_active = True
    db.commit()
    return {"message": "Клиент разблокирован"}