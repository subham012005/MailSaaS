import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def fix_database():
    engine = create_async_engine(DATABASE_URL)
    
    async with engine.begin() as conn:
        print("Checking 'users' table...")
        try:
            result = await conn.execute(text("DESCRIBE users"))
            columns = [row[0] for row in result.fetchall()]
            
            updates = [
                ('is_onboarded', "ALTER TABLE users ADD COLUMN is_onboarded BOOLEAN DEFAULT FALSE"),
                ('personality_context', "ALTER TABLE users ADD COLUMN personality_context TEXT"),
                ('ai_provider', "ALTER TABLE users ADD COLUMN ai_provider VARCHAR(50) DEFAULT 'default'"),
                ('api_key', "ALTER TABLE users ADD COLUMN api_key VARCHAR(500)"),
                ('personality_type', "ALTER TABLE users ADD COLUMN personality_type VARCHAR(50) DEFAULT 'general'")
            ]
            
            for col, sql in updates:
                if col not in columns:
                    print(f"Adding {col} to users...")
                    await conn.execute(text(sql))
        except Exception as e:
            print(f"Error checking users: {e}")

        print("\nChecking 'delegations' table...")
        try:
            result = await conn.execute(text("DESCRIBE delegations"))
            columns = [row[0] for row in result.fetchall()]
            
            updates = [
                ('thread_id', "ALTER TABLE delegations ADD COLUMN thread_id VARCHAR(255)"),
                ('original_subject', "ALTER TABLE delegations ADD COLUMN original_subject VARCHAR(255)"),
                ('original_sender', "ALTER TABLE delegations ADD COLUMN original_sender VARCHAR(255)"),
                ('reply_draft', "ALTER TABLE delegations ADD COLUMN reply_draft TEXT"),
                ('feedback', "ALTER TABLE delegations ADD COLUMN feedback TEXT"),
                ('thread_context', "ALTER TABLE delegations ADD COLUMN thread_context JSON"),
                ('instruction_history', "ALTER TABLE delegations ADD COLUMN instruction_history JSON"),
                ('send_mode', "ALTER TABLE delegations ADD COLUMN send_mode VARCHAR(20) DEFAULT 'thread'"),
                ('last_instruction_at', "ALTER TABLE delegations ADD COLUMN last_instruction_at DATETIME DEFAULT CURRENT_TIMESTAMP"),
                ('created_at', "ALTER TABLE delegations ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP")
            ]
            
            for col, sql in updates:
                if col not in columns:
                    print(f"Adding {col} to delegations...")
                    await conn.execute(text(sql))
        except Exception as e:
            print(f"Error checking delegations: {e}")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(fix_database())
