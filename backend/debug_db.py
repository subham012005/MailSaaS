import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

async def debug_connection():
    # Try connecting without specifying the database first to see if the server is up
    DATABASE_URL = os.getenv("DATABASE_URL")
    # Strip database name from URL for server check
    # mysql+aiomysql://root:password@localhost:3306/decision_intelligence
    base_url = "/".join(DATABASE_URL.split("/")[:-1])
    
    print(f"Connecting to server: {base_url}")
    engine = create_async_engine(base_url)
    
    try:
        async with engine.connect() as conn:
            print("✅ Successfully connected to MySQL server!")
            # Check if database exists
            db_name = DATABASE_URL.split("/")[-1]
            result = await conn.execute(text(f"SHOW DATABASES LIKE '{db_name}'"))
            row = result.fetchone()
            if row:
                print(f"✅ Database '{db_name}' exists.")
            else:
                print(f"❌ Database '{db_name}' DOES NOT exist.")
                print(f"Attempting to create database '{db_name}'...")
                await conn.execute(text(f"CREATE DATABASE {db_name}"))
                print(f"✅ Database '{db_name}' created successfully.")
                
    except Exception as e:
        print(f"❌ Connection failed: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(debug_connection())
