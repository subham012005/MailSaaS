import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "mysql+aiomysql://root:1234@localhost:3306/decision_intelligence")

from sqlalchemy import text

async def update_db():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE delegations ADD COLUMN thread_id VARCHAR(255);"))
            print("Added thread_id column")
        except Exception as e:
            print(f"thread_id issue: {e}")
            
        try:
            await conn.execute(text("ALTER TABLE delegations ADD COLUMN original_subject VARCHAR(255);"))
            print("Added original_subject column")
        except Exception as e:
            print(f"original_subject issue: {e}")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(update_db())
