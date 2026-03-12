import sys
print(f"Python version: {sys.version}")
print(f"Python executable: {sys.executable}")

try:
    import sqlalchemy
    print(f"✅ SQLAlchemy version: {sqlalchemy.__version__}")
except ImportError as e:
    print(f"❌ SQLAlchemy not found: {e}")

try:
    import psycopg2
    print(f"✅ psycopg2 version: {psycopg2.__version__}")
except ImportError as e:
    print(f"❌ psycopg2 not found: {e}")
