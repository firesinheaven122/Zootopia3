from sqlalchemy import Column, Integer, String, Numeric, Text, Boolean, Enum, ForeignKey, TIMESTAMP, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

Base = declarative_base()

class UserRole(enum.Enum):
    admin = 'admin'
    seller = 'seller'
    client = 'client'

class SpeciesType(enum.Enum):
    dog = 'dog'
    cat = 'cat'
    bird = 'bird'
    fish = 'fish'
    rodent = 'rodent'
    other = 'other'

class PaymentType(enum.Enum):
    cash = 'cash'
    card = 'card'

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20))
    role = Column(Enum(UserRole), nullable=False, server_default='client')
    is_active = Column(Boolean, nullable=False, server_default='true')
    created_at = Column(TIMESTAMP, server_default=func.now())

    pets = relationship('Pet', back_populates='owner')
    sales_as_seller = relationship('Sale', foreign_keys='Sale.seller_id', back_populates='seller')
    sales_as_client = relationship('Sale', foreign_keys='Sale.client_id', back_populates='client')
    recommendations = relationship('Recommendation', back_populates='client')

class Pet(Base):
    __tablename__ = 'pets'

    id = Column(Integer, primary_key=True, autoincrement=True)
    owner_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    name = Column(String(100), nullable=False)
    species = Column(Enum(SpeciesType))
    breed = Column(String(100))
    birth_date = Column(TIMESTAMP)
    created_at = Column(TIMESTAMP, server_default=func.now())

    owner = relationship('User', back_populates='pets')
    recommendations = relationship('Recommendation', back_populates='pet')

class Category(Base):
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    parent_id = Column(Integer, ForeignKey('categories.id'))
    description = Column(Text)

    parent = relationship('Category', remote_side=[id], backref='subcategories')

class Product(Base):
    __tablename__ = 'products'

    id = Column(Integer, primary_key=True, autoincrement=True)
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=False)
    name = Column(String(255), nullable=False)
    article = Column(String(50), unique=True)
    description = Column(Text)
    price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False, server_default='0')
    unit = Column(String(20), server_default='шт')
    image_url = Column(String(512))
    is_active = Column(Boolean, server_default='true')
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, onupdate=func.now())

    category = relationship('Category', backref='products')
    sale_items = relationship('SaleItem', back_populates='product')
    recommendations = relationship('Recommendation', back_populates='product')
    species_link = relationship('ProductSpecies', back_populates='product')

class ProductSpecies(Base):
    __tablename__ = 'product_species'

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    species = Column(Enum(SpeciesType), nullable=False)

    product = relationship('Product', back_populates='species_link')

    __table_args__ = (
        UniqueConstraint('product_id', 'species', name='unique_product_species'),
    )

class Sale(Base):
    __tablename__ = 'sales'

    id = Column(Integer, primary_key=True, autoincrement=True)
    seller_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    client_id = Column(Integer, ForeignKey('users.id'))
    total_amount = Column(Numeric(10, 2), nullable=False)
    payment_type = Column(Enum(PaymentType), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    seller = relationship('User', foreign_keys=[seller_id], back_populates='sales_as_seller')
    client = relationship('User', foreign_keys=[client_id], back_populates='sales_as_client')
    items = relationship('SaleItem', back_populates='sale')

class SaleItem(Base):
    __tablename__ = 'sale_items'

    id = Column(Integer, primary_key=True, autoincrement=True)
    sale_id = Column(Integer, ForeignKey('sales.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    price_at_sale = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)

    sale = relationship('Sale', back_populates='items')
    product = relationship('Product', back_populates='sale_items')

class Recommendation(Base):
    __tablename__ = 'recommendations'

    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    pet_id = Column(Integer, ForeignKey('pets.id'))
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    score = Column(Numeric(3, 2), nullable=False)
    reason = Column(Text)
    is_shown = Column(Boolean, server_default='false')
    created_at = Column(TIMESTAMP, server_default=func.now())

    client = relationship('User', back_populates='recommendations')
    pet = relationship('Pet', back_populates='recommendations')
    product = relationship('Product', back_populates='recommendations')