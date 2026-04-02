from database import SessionLocal
from models import User, Pet, Category, Product, ProductSpecies, Sale, SaleItem, Recommendation
from datetime import datetime, timedelta
import random
from auth.service import hash_password

# Создаем сессию подключения к БД
db = SessionLocal()

print("🔄 Начинаем заполнение базы данных...")
print("=" * 50)

# 1. СОЗДАЕМ ПОЛЬЗОВАТЕЛЕЙ
print("1. Добавляем пользователей...")

users = [
    User(
        email="nastya_danilova2006@mail.ru",
        password_hash=hash_password("AdmInSALD"),
        full_name="Анастасия Данилова",
        phone="+7(925)205-36-35",
        role="admin",
        is_active=True
    ),
    User(
        email="seller1@zoo.com",
        password_hash="Sell1er",
        full_name="Иван Петров",
        phone="+7(999)222-22-22",
        role="client",
        is_active=True
    ),
    User(
        email="ArsVerh_maloletka@lox.com",
        password_hash="Sel2",
        full_name="Арсений Верхов",
        phone="+7(999)333-33-33",
        role="client",
        is_active=True
    ),
    User(
        email="anna@mail.com",
        password_hash="rtidjlof",
        full_name="Анна Фёдорова",
        phone="+7(999)444-44-44",
        role="seller",
        is_active=True
    ),
    User(
        email="petr@mail.com",
        password_hash="petrhoqj",
        full_name="Петр Петров",
        phone="+7(999)555-55-55",
        role="seller",
        is_active=True
    )
]

db.add_all(users)
db.commit()
print(f"   ✅ Добавлено {len(users)} пользователей")

# 2. ПОЛУЧАЕМ ID ПОЛЬЗОВАТЕЛЕЙ ИЗ БАЗЫ
clients = db.query(User).filter(User.role == "client").all()
sellers = db.query(User).filter(User.role == "seller").all()
admin = db.query(User).filter(User.role == "admin").first()

# 3. ДОБАВЛЯЕМ ПИТОМЦЕВ
print("2. Добавляем питомцев...")

pets = [
    Pet(
        owner_id=clients[1].id,  
        name="Пепса",
        species="dog",
        breed="JackRussel",
        birth_date=datetime.now() - timedelta(days=365*3)
    ),
    Pet(
        owner_id=clients[0].id,  
        name="Тихон",
        species="cat",
        breed="Bengal",
        birth_date=datetime.now() - timedelta(days=365*2)
    ),
    Pet(
        owner_id=clients[1].id,  # Петр
        name="Кеша",
        species="bird",
        breed="Волнистый попугай",
        birth_date=datetime.now() - timedelta(days=365)
    ),
    Pet(
        owner_id=clients[1].id,  # Петр
        name="Бобик",
        species="dog",
        breed="Такса",
        birth_date=datetime.now() - timedelta(days=365*4)
    ),
    Pet(
        owner_id=clients[2].id,  # Елена
        name="Золотце",
        species="fish",
        breed="Золотая рыбка",
        birth_date=datetime.now() - timedelta(days=180)
    )
]

db.add_all(pets)
db.commit()
print(f"   ✅ Добавлено {len(pets)} питомцев")

# 4. ДОБАВЛЯЕМ КАТЕГОРИИ
print("3. Добавляем категории товаров...")

categories = [
    Category(name="Корм для собак", description="Сухой и влажный корм"),
    Category(name="Корм для кошек", description="Сухой и влажный корм"),
    Category(name="Игрушки", description="Игрушки для животных"),
    Category(name="Лежанки", description="Домики и лежанки"),
    Category(name="Аксессуары", description="Поводки, ошейники, миски"),
    Category(name="Груминг", description="Средства для ухода")
]

db.add_all(categories)
db.commit()
print(f"   ✅ Добавлено {len(categories)} категорий")

# 5. ДОБАВЛЯЕМ ТОВАРЫ
print("4. Добавляем товары...")

# Получаем категории из базы
dog_food = db.query(Category).filter(Category.name == "Корм для собак").first()
cat_food = db.query(Category).filter(Category.name == "Корм для кошек").first()
toys = db.query(Category).filter(Category.name == "Игрушки").first()
beds = db.query(Category).filter(Category.name == "Лежанки").first()

products = [
    Product(
        category_id=dog_food.id,
        name="Royal Canin для щенков",
        article="RC001",
        description="Корм для щенков крупных пород, 2 кг",
        price=2500.00,
        quantity=15,
        unit="шт",
        image_url="/images/rc001.jpg",
        is_active=True
    ),
    Product(
        category_id=dog_food.id,
        name="Purina Pro Plan для взрослых",
        article="PP002",
        description="Корм для взрослых собак с курицей, 3 кг",
        price=3200.00,
        quantity=10,
        unit="шт",
        image_url="/images/pp002.jpg",
        is_active=True
    ),
    Product(
        category_id=cat_food.id,
        name="Whiskas для кошек",
        article="WK003",
        description="Сухой корм с курицей, 1.5 кг",
        price=890.00,
        quantity=25,
        unit="шт",
        image_url="/images/wk003.jpg",
        is_active=True
    ),
    Product(
        category_id=toys.id,
        name="Мягкая игрушка 'Кость'",
        article="TY004",
        description="Игрушка для собак из прочного латекса",
        price=450.00,
        quantity=30,
        unit="шт",
        image_url="/images/ty004.jpg",
        is_active=True
    ),
    Product(
        category_id=toys.id,
        name="Игрушка-мышка с мятой",
        article="TY005",
        description="Для кошек, с пищалкой",
        price=320.00,
        quantity=40,
        unit="шт",
        image_url="/images/ty005.jpg",
        is_active=True
    ),
    Product(
        category_id=beds.id,
        name="Лежанка для собак",
        article="BD006",
        description="Мягкая лежанка с бортиками, 60 см",
        price=1800.00,
        quantity=8,
        unit="шт",
        image_url="/images/bd006.jpg",
        is_active=True
    )
]

db.add_all(products)
db.commit()
print(f"   ✅ Добавлено {len(products)} товаров")

# 6. СВЯЗЫВАЕМ ТОВАРЫ С ВИДАМИ ЖИВОТНЫХ
print("5. Добавляем связи товаров с видами...")

product_species = [
    ProductSpecies(product_id=products[0].id, species="dog"),
    ProductSpecies(product_id=products[1].id, species="dog"),
    ProductSpecies(product_id=products[2].id, species="cat"),
    ProductSpecies(product_id=products[3].id, species="dog"),
    ProductSpecies(product_id=products[4].id, species="cat"),
    ProductSpecies(product_id=products[5].id, species="dog"),
    ProductSpecies(product_id=products[5].id, species="cat"),
]

db.add_all(product_species)
db.commit()
print(f"   ✅ Добавлено {len(product_species)} связей")

# 7. СОЗДАЕМ ПРОДАЖИ
print("6. Добавляем продажи...")

sales = [
    Sale(
        seller_id=sellers[0].id,
        client_id=clients[0].id,
        total_amount=2950.00,
        payment_type="card",
        created_at=datetime.now() - timedelta(days=5)
    ),
    Sale(
        seller_id=sellers[0].id,
        client_id=clients[1].id,
        total_amount=1420.00,
        payment_type="cash",
        created_at=datetime.now() - timedelta(days=3)
    ),
    Sale(
        seller_id=sellers[1].id,
        client_id=clients[2].id,
        total_amount=5300.00,
        payment_type="card",
        created_at=datetime.now() - timedelta(days=1)
    ),
    Sale(
        seller_id=sellers[1].id,
        client_id=None,
        total_amount=890.00,
        payment_type="cash",
        created_at=datetime.now()
    )
]

db.add_all(sales)
db.commit()
print(f"   ✅ Добавлено {len(sales)} продаж")

# 8. ДОБАВЛЯЕМ ПОЗИЦИИ В ЧЕКАХ
print("7. Добавляем позиции в чеках...")

sale_items = [
    SaleItem(
        sale_id=sales[0].id,
        product_id=products[0].id,
        quantity=1,
        price_at_sale=2500.00,
        subtotal=2500.00
    ),
    SaleItem(
        sale_id=sales[0].id,
        product_id=products[4].id,
        quantity=1,
        price_at_sale=450.00,
        subtotal=450.00
    ),
    SaleItem(
        sale_id=sales[1].id,
        product_id=products[2].id,
        quantity=2,
        price_at_sale=320.00,
        subtotal=640.00
    ),
    SaleItem(
        sale_id=sales[1].id,
        product_id=products[3].id,
        quantity=1,
        price_at_sale=780.00,
        subtotal=780.00
    ),
    SaleItem(
        sale_id=sales[2].id,
        product_id=products[1].id,
        quantity=1,
        price_at_sale=3200.00,
        subtotal=3200.00
    ),
    SaleItem(
        sale_id=sales[2].id,
        product_id=products[2].id,
        quantity=2,
        price_at_sale=890.00,
        subtotal=1780.00
    ),
    SaleItem(
        sale_id=sales[2].id,
        product_id=products[5].id,
        quantity=1,
        price_at_sale=320.00,
        subtotal=320.00
    ),
    SaleItem(
        sale_id=sales[3].id,
        product_id=products[2].id,
        quantity=1,
        price_at_sale=890.00,
        subtotal=890.00
    )
]

db.add_all(sale_items)
db.commit()
print(f"   ✅ Добавлено {len(sale_items)} позиций")

# 9. ДОБАВЛЯЕМ РЕКОМЕНДАЦИИ
print("8. Добавляем рекомендации...")

recommendations = [
    Recommendation(
        client_id=clients[0].id,
        pet_id=pets[0].id,
        product_id=products[0].id,
        score=0.95,
        reason="Отлично подходит для немецких овчарок",
        is_shown=True
    ),
    Recommendation(
        client_id=clients[0].id,
        pet_id=pets[1].id,
        product_id=products[4].id,
        score=0.85,
        reason="Кошки обожают игрушки с мятой",
        is_shown=True
    ),
    Recommendation(
        client_id=clients[1].id,
        pet_id=pets[2].id,
        product_id=products[2].id,
        score=0.75,
        reason="Рекомендуется для попугаев",
        is_shown=False
    ),
    Recommendation(
        client_id=clients[2].id,
        pet_id=pets[4].id,
        product_id=products[2].id,
        score=0.60,
        reason="Специальный корм",
        is_shown=False
    )
]

db.add_all(recommendations)
db.commit()
print(f"   ✅ Добавлено {len(recommendations)} рекомендаций")

# 10. ИТОГ
print("\n" + "=" * 50)
print("✅ БАЗА ДАННЫХ УСПЕШНО ЗАПОЛНЕНА!")
print("=" * 50)
print(f"📊 Пользователей: {db.query(User).count()}")
print(f"📊 Питомцев: {db.query(Pet).count()}")
print(f"📊 Категорий: {db.query(Category).count()}")
print(f"📊 Товаров: {db.query(Product).count()}")
print(f"📊 Продаж: {db.query(Sale).count()}")
print(f"📊 Рекомендаций: {db.query(Recommendation).count()}")
print("=" * 50)

# Закрываем соединение
db.close()