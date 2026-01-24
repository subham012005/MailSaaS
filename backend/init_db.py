import asyncio
from database import engine, Base
from db_models import User, Decision, Correction, UserMetric

async def init_db():
    try:
        async with engine.begin() as conn:
            # Create all tables
            await conn.run_sync(Base.metadata.create_all)
        print("Database tables created successfully.")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init_db())
