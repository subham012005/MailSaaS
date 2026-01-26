import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from dotenv import load_dotenv
from sqlalchemy import text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "mysql+aiomysql://root:1234@localhost:3306/decision_intelligence")

async def update_db():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE delegations ADD COLUMN thread_context JSON;"))
            print("Added thread_context column")
        except Exception as e:
            print(f"thread_context issue: {e}")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(update_db())
