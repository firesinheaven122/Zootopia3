from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Pet, UserRole
from pets.schemas import PetCreateSchema, PetUpdateSchema, PetResponseSchema
from auth.dependencies import require_admin, require_client, get_current_user

router = APIRouter(prefix="/pets", tags=["Питомцы"])

# Получить питомцев текущего клиента
@router.get("/my", response_model=List[PetResponseSchema])
def get_my_pets(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Pet).filter(Pet.owner_id == current_user.id).all()

# Получить всех питомцев
@router.get("/", response_model=List[PetResponseSchema])
def get_all_pets(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Pet).all()

# Получить питомцев конкретного клиента
@router.get("/client/{client_id}", response_model=List[PetResponseSchema])
def get_client_pets(
    client_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    return db.query(Pet).filter(Pet.owner_id == client_id).all()

# Добавить питомца
@router.post("/", response_model=PetResponseSchema)
def create_pet(
    data: PetCreateSchema,
    db: Session = Depends(get_db),
    current_user=Depends(require_client)
):
    pet = Pet(**data.model_dump(), owner_id=current_user.id)
    db.add(pet)
    db.commit()
    db.refresh(pet)
    return pet

# Обновить питомца
@router.put("/{pet_id}", response_model=PetResponseSchema)
def update_pet(
    pet_id: int,
    data: PetUpdateSchema,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Питомец не найден")
    if pet.owner_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Нет доступа")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(pet, key, value)
    db.commit()
    db.refresh(pet)
    return pet

# Удалить питомца
@router.delete("/{pet_id}")
def delete_pet(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Питомец не найден")
    db.delete(pet)
    db.commit()
    return {"message": "Питомец удалён"}