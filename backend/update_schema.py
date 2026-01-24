import asyncio
from sqlalchemy import text
from database import engine

async def run_migration():
    async with engine.begin() as conn:
        print("Checking schema...")
        
        # 1. Check/Add replies_prevented to user_metrics
        try:
            await conn.execute(text("SELECT replies_prevented FROM user_metrics LIMIT 1"))
            print("'replies_prevented' column already exists.")
        except Exception:
            print("Adding 'replies_prevented' column to user_metrics...")
            await conn.execute(text("ALTER TABLE user_metrics ADD COLUMN replies_prevented INTEGER DEFAULT 0"))

        # 2. Check/Add personality fields to users
        try:
            await conn.execute(text("SELECT personality_type FROM users LIMIT 1"))
            print("'personality_type' already exists.")
        except Exception:
            print("Adding personality columns to users...")
            await conn.execute(text("ALTER TABLE users ADD COLUMN personality_type VARCHAR(50) DEFAULT 'general'"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN personality_context TEXT"))

        print("Running create_all to ensure new tables exist...")
        from db_models import Base
        await conn.run_sync(Base.metadata.create_all)
    
    await engine.dispose()
    print("Migration complete.")

if __name__ == "__main__":
    asyncio.run(run_migration())
