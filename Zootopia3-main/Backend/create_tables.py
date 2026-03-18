from sqlalchemy import create_engine
from models import Base


DATABASE_URL = "postgresql://localhost/pet_shop_db"


engine = create_engine(DATABASE_URL)

print(" Создаем таблицы в базе данных...")
Base.metadata.create_all(engine)
print(" Таблицы успешно созданы!")
print(" База данных pet_shop_db готова к работе")