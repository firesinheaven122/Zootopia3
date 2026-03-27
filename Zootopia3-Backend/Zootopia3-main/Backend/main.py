from fastapi import FastAPI
from database import engine
from models import Base
from auth.router import router as auth_router
from products.router import router as products_router
from categories.router import router as categories_router
from clients.router import router as clients_router
from pets.router import router as pets_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Зоомагазин API")

app.include_router(auth_router)
app.include_router(products_router)
app.include_router(categories_router)
app.include_router(clients_router)
app.include_router(pets_router)

@app.get("/")
def root():
    return {"message": "Зоомагазин API работает"}