import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def check_delegations():
    engine = create_async_engine(DATABASE_URL)
    
    async with engine.connect() as conn:
        print("Checking 'delegations' table...")
        try:
            result = await conn.execute(text("DESCRIBE delegations"))
            cols = result.fetchall()
            print("Columns in 'delegations':")
            for col in cols:
                print(f" - {col[0]}: {col[1]}")
                
            result = await conn.execute(text("SELECT COUNT(*) FROM delegations"))
            count = result.scalar()
            print(f"Total delegations in DB: {count}")
            
            if count > 0:
                result = await conn.execute(text("SELECT id, user_id, delegate_email, status FROM delegations LIMIT 5"))
                rows = result.fetchall()
                print("First 5 delegations:")
                for row in rows:
                    print(f" - ID: {row[0]}, OwnerID: {row[1]}, Delegate: {row[2]}, Status: {row[3]}")
                    
        except Exception as e:
            print(f"Error checking delegations: {e}")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_delegations())
