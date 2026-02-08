import asyncio
from sqlalchemy import text
from database import engine
from db_models import Base

async def run_migration():
    print("Connecting to database...")
    async with engine.begin() as conn:
        print("Checking for user_sessions table...")
        # Just run create_all, it typically skips existing tables. 
        # But we want to be sure about the new table.
        await conn.run_sync(Base.metadata.create_all)
        print("Schema update complete (create_all executed).")
        
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(run_migration())
