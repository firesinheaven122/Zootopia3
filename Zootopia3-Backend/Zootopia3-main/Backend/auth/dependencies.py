from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from database import get_db
from models import User
from auth.service import SECRET_KEY, ALGORITHM

bearer_scheme = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
    except (JWTError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный токен"
        )
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден"
        )
    return user

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только для администратора"
        )
    return current_user

def require_seller(current_user: User = Depends(get_current_user)):
    if current_user.role.value not in ("admin", "seller"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только для продавца или администратора"
        )
    return current_user

def require_client(current_user: User = Depends(get_current_user)):
    if current_user.role.value not in ("admin", "client"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только для клиента или администратора"
        )
    return current_user

def require_any(current_user: User = Depends(get_current_user)):
    return current_user