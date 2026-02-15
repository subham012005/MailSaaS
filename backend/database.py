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

# Determine engine arguments based on environment
engine_args = {}
if "postgresql" in DATABASE_URL:
    # Use 'require' SSL for Postgres (Supabase/Render requirement)
    # This maintains encryption but allows the connection even with self-signed certs in the chain
    engine_args["connect_args"] = {"ssl": "require"}
    # Add pooling parameters to prevent connection timeouts/leaks in production
    engine_args.update({
        "pool_size": 5,
        "max_overflow": 10,
        "pool_timeout": 30,
        "pool_recycle": 1800,
        "pool_pre_ping": True,
    })

engine = create_async_engine(DATABASE_URL, echo=False, **engine_args)

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
