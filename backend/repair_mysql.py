import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "mysql+aiomysql://root:password@localhost:3306/decision_intelligence")

async def repair_schema():
    print(f"Connecting to {DATABASE_URL}...")
    engine = create_async_engine(DATABASE_URL)
    
    async with engine.begin() as conn:
        print("Starting schema repair for 'delegations' table...")
        
        # Columns to add if missing
        updates = [
            "ALTER TABLE delegations ADD COLUMN send_mode VARCHAR(20) DEFAULT 'thread'",
            "ALTER TABLE delegations ADD COLUMN instruction_history JSON NULL",
            "ALTER TABLE delegations ADD COLUMN last_instruction_at DATETIME NULL",
            "ALTER TABLE delegations ADD COLUMN original_sender VARCHAR(255) NULL",
            "ALTER TABLE delegations ADD COLUMN original_subject VARCHAR(255) NULL"
        ]
        
        for sql in updates:
            try:
                await conn.execute(text(sql))
                print(f"SUCCESS: {sql}")
            except Exception as e:
                if 'Duplicate column name' in str(e) or 'already exists' in str(e):
                    print(f"SKIP: Column already exists for query: {sql}")
                else:
                    print(f"ERROR executing {sql}: {e}")
                    
    print("Schema repair complete.")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(repair_schema())
