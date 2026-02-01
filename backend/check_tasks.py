import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def check_rows():
    engine = create_async_engine(DATABASE_URL)
    
    async with engine.connect() as conn:
        try:
            result = await conn.execute(text("SELECT COUNT(*) FROM analysis_tasks"))
            count = result.scalar()
            print(f"Total analysis tasks: {count}")
            
            if count > 0:
                result = await conn.execute(text("SELECT id, status, error FROM analysis_tasks ORDER BY created_at DESC LIMIT 5"))
                rows = result.fetchall()
                print("Recent tasks:")
                for row in rows:
                    print(f" - ID: {row[0]}, Status: {row[1]}, Error: {row[2]}")
        except Exception as e:
            print(f"Error: {e}")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_rows())
