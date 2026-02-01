import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def check_analysis_tasks():
    engine = create_async_engine(DATABASE_URL)
    
    async with engine.connect() as conn:
        print("\n--- Table: analysis_tasks ---")
        try:
            result = await conn.execute(text("DESCRIBE analysis_tasks"))
            cols = result.fetchall()
            for col in cols:
                print(f"Col: {col[0]} ({col[1]})")
        except Exception as e:
            print(f"Error describing analysis_tasks: {e}")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_analysis_tasks())
