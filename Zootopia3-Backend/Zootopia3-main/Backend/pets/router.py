from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Pet, User, UserRole
from pets.schemas import PetCreateSchema, PetUpdateSchema, PetResponseSchema
from auth.dependencies import require_admin, require_client, get_current_user
from audit.router import write_log

router = APIRouter(prefix="/pets", tags=["Питомцы"])

@router.get("/my", response_model=List[PetResponseSchema])
def get_my_pets(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Pet).filter(Pet.owner_id == current_user.id).all()

@router.get("/", response_model=List[PetResponseSchema])
def get_all_pets(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    return db.query(Pet).all()

@router.get("/client/{client_id}", response_model=List[PetResponseSchema])
def get_client_pets(
    client_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    return db.query(Pet).filter(Pet.owner_id == client_id).all()

@router.post("/", response_model=PetResponseSchema)
def create_pet(
    data: PetCreateSchema,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    if current_user.role.value == "admin" and data.owner_id:
        owner_id = data.owner_id
    else:
        owner_id = current_user.id

    pet_data = data.model_dump(exclude={"owner_id"})
    pet = Pet(**pet_data, owner_id=owner_id)
    db.add(pet)
    db.commit()
    db.refresh(pet)

    write_log(
        db=db,
        user_id=current_user.id,
        action="CREATE",
        entity="pets",
        entity_id=pet.id,
        log_type="user",
        details={"name": pet.name, "owner_id": owner_id}
    )

    return pet

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

    write_log(
        db=db,
        user_id=current_user.id,
        action="UPDATE",
        entity="pets",
        entity_id=pet.id,
        log_type="user",
        details={"name": pet.name}
    )

    return pet

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

    write_log(
        db=db,
        user_id=current_user.id,
        action="DELETE",
        entity="pets",
        entity_id=pet_id,
        log_type="operator",
        details={"pet_id": pet_id}
    )

    return {"message": "Питомец удалён"}

@router.post("/admin/add", response_model=PetResponseSchema)
def admin_create_pet(
    client_id: int,
    data: PetCreateSchema,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):

    client = db.query(User).filter(
        User.id == client_id,
        User.role == UserRole.client
    ).first()
    if not client:
        raise HTTPException(status_code=404, detail="Клиент не найден")

    pet = Pet(**data.model_dump(), owner_id=client_id)
    db.add(pet)
    db.commit()
    db.refresh(pet)

    write_log(
        db=db,
        user_id=current_user.id,
        action="CREATE",
        entity="pets",
        entity_id=pet.id,
        log_type="operator",
        details={"name": pet.name, "owner_id": client_id}
    )

    return pet