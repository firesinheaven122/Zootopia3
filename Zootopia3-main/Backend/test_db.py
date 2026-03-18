from sqlalchemy import create_engine, text
from sqlalchemy import inspect

engine = create_engine("postgresql://localhost/pet_shop_db")

print(" Проверка подключения...")
with engine.connect() as conn:
    result = conn.execute(text("SELECT 1"))
    print(" Подключение к базе работает!")

print("\n Список созданных таблиц:")
inspector = inspect(engine)
tables = inspector.get_table_names()
for table in tables:
    print(f"   - {table}")

print(f"\n Всего создано {len(tables)} таблиц")