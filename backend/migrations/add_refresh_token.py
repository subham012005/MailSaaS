
import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from dotenv import load_dotenv

# Load env vars
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

async def add_refresh_token_column():
    if not DATABASE_URL:
        print("DATABASE_URL not found")
        return

    engine = create_async_engine(DATABASE_URL, echo=True)

    async with engine.begin() as conn:
        try:
            # Check if column exists first to avoid error
            print("Checking if column exists...")
            # This is a bit hacky for MySQL but works for a quick check or just try/catch the alter
            await conn.execute(text("ALTER TABLE user_sessions ADD COLUMN refresh_token VARCHAR(500) NULL"))
            print("Successfully added refresh_token column.")
        except Exception as e:
            if "Duplicate column name" in str(e):
                print("Column refresh_token already exists.")
            else:
                print(f"Error adding column: {e}")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(add_refresh_token_column())
