from fastapi import FastAPI
from database import engine
from models import Base
from auth.router import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Зоомагазин API")

app.include_router(auth_router)

@app.get("/")
def root():
    return {"message": "Зоомагазин API работает"}