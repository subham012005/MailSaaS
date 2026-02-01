import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def check_db_full():
    engine = create_async_engine(DATABASE_URL)
    
    async with engine.connect() as conn:
        for table in ['users', 'delegations']:
            print(f"\n--- Table: {table} ---")
            try:
                result = await conn.execute(text(f"DESCRIBE {table}"))
                cols = result.fetchall()
                for col in cols:
                    print(f"Col: {col[0]} ({col[1]})")
            except Exception as e:
                print(f"Error describing {table}: {e}")
                
        try:
            result = await conn.execute(text("SELECT COUNT(*) FROM delegations"))
            count = result.scalar()
            print(f"\nTotal delegations: {count}")
        except Exception as e:
            print(f"Error counting delegations: {e}")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_db_full())
