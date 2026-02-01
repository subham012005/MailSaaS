from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import asyncio
import os
from dotenv import load_dotenv
from db_models import User, Base

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

async def check_db():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        result = await session.execute(select(User))
        users = result.scalars().all()
        for u in users:
            print(f"User: {u.email}")
            print(f"Personality Type: {u.personality_type}")
            print(f"Personality Context type: {type(u.personality_context)}")
            print(f"Personality Context: {u.personality_context}")
            print("-" * 20)
    await engine.dispose()

if __name__ == "__main__":
    try:
        asyncio.run(check_db())
    except Exception as e:
        print(f"Caught database error: {e}")
