from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from auth.schemas import RegisterSchema, LoginSchema, TokenSchema, UserResponseSchema
from auth.service import register_user, login_user
from auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Аутентификация"])

@router.post("/register", response_model=UserResponseSchema)
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    user = register_user(db, data.email, data.password, data.full_name, data.phone)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email уже зарегистрирован"
        )
    return user

@router.post("/login", response_model=TokenSchema)
def login(data: LoginSchema, db: Session = Depends(get_db)):
    token = login_user(db, data.email, data.password)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль"
        )
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponseSchema)
def get_me(current_user=Depends(get_current_user)):
    return current_user