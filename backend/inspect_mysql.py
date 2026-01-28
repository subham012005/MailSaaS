import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "mysql+aiomysql://root:password@localhost:3306/decision_intelligence")

async def inspect():
    engine = create_async_engine(DATABASE_URL)
    async with engine.connect() as conn:
        res = await conn.execute(text("DESCRIBE delegations"))
        columns = res.fetchall()
        for col in columns:
            print(f"Column: {col[0]}, Type: {col[1]}")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(inspect())
