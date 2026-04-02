from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from database import engine
from models import Base
from auth.router import router as auth_router
from products.router import router as products_router
from categories.router import router as categories_router
from clients.router import router as clients_router
from pets.router import router as pets_router
from sales.router import router as sales_router
from users.router import router as users_router
from recommendations.router import router as recommendations_router
from audit.router import router as audit_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Зоомагазин API",
    swagger_ui_parameters={"persistAuthorization": True}
)

app.include_router(auth_router)
app.include_router(products_router)
app.include_router(categories_router)
app.include_router(clients_router)
app.include_router(pets_router)
app.include_router(sales_router)
app.include_router(users_router)
app.include_router(recommendations_router)
app.include_router(audit_router)

@app.get("/")
def root():
    return {"message": "Зоомагазин API работает"}

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(
        title="Зоомагазин API",
        version="0.1.0",
        routes=app.routes,
    )
    schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    for path in schema["paths"].values():
        for method in path.values():
            method["security"] = [{"BearerAuth": []}]
    app.openapi_schema = schema
    return schema

app.openapi = custom_openapi