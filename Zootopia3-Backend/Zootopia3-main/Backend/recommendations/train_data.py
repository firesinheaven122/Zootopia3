from database import SessionLocal
from models import SaleItem, Sale

def get_training_data():
    db = SessionLocal()
    
    # Берём все покупки из базы
    sale_items = db.query(SaleItem).join(Sale).filter(
        Sale.client_id != None
    ).all()
    
    data = []
    for item in sale_items:
        data.append({
            "client_id": item.sale.client_id,
            "product_id": item.product_id,
            "rating": float(item.quantity) 
        })
    
    db.close()
    return data