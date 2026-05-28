from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, UserRole
from clients.schemas import ClientCreateSchema, ClientUpdateSchema, ClientResponseSchema
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

@router.post("/", response_model=ClientResponseSchema)
def create_client(
    data: ClientCreateSchema,
    db: Session = Depends(get_db),
    current_user=Depends(require_seller)
):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email уже зарегистрирован")
    client = User(
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        phone=data.phone,
        role=UserRole.client
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    return client

@router.put("/{client_id}", response_model=ClientResponseSchema)
def update_client(
    client_id: int,
    data: ClientUpdateSchema,
    db: Session = Depends(get_db),
    current_user=Depends(require_seller)
):
    client = db.query(User).filter(
        User.id == client_id,
        User.role == UserRole.client
    ).first()
    if not client:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(client, key, value)
    db.commit()
    db.refresh(client)
    return client

@router.put("/{client_id}/block")
def block_client(
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
    client.is_active = False
    db.commit()
    return {"message": "Клиент заблокирован"}

@router.put("/{client_id}/unblock")
def unblock_client(
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
    client.is_active = True
    db.commit()
    return {"message": "Клиент разблокирован"}