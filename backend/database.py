import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

# MySQL Connection URL
# Format: mysql+aiomysql://user:password@host:port/dbname
# Support for multiple database drivers (MySQL/PostgreSQL)
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set. Deployment failed.")

# Handle PostgreSQL scheme for Render/Supabase
if DATABASE_URL.startswith("postgresql://") and "asyncpg" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

# Handle MySQL scheme for local/Aiven
if DATABASE_URL.startswith("mysql://") and "aiomysql" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+aiomysql://")

engine = create_async_engine(DATABASE_URL, echo=False)

AsyncSessionLocal = async_sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
