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
        print("Ensuring 'analysis_tasks' table exists...")
        create_analysis_tasks = """
        CREATE TABLE IF NOT EXISTS analysis_tasks (
            id VARCHAR(255) PRIMARY KEY,
            user_id INT,
            email_id VARCHAR(255),
            status VARCHAR(50) DEFAULT 'pending',
            result JSON,
            error VARCHAR(500),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            completed_at DATETIME,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """
        try:
            await conn.execute(text(create_analysis_tasks))
            print("Table 'analysis_tasks' created or already exists.")
        except Exception as e:
            print(f"Error creating analysis_tasks: {e}")

        # Let's also ensure the 'decisions' and 'corrections' tables exist just in case
        print("\nChecking other tables...")
        
        tables_to_check = {
            'decisions': """
                CREATE TABLE IF NOT EXISTS decisions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    email_id VARCHAR(255),
                    subject VARCHAR(255),
                    action_type VARCHAR(255),
                    action_description VARCHAR(255),
                    predicted_outcome VARCHAR(255),
                    is_shadow BOOLEAN DEFAULT TRUE,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """,
            'corrections': """
                CREATE TABLE IF NOT EXISTS corrections (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    email_id VARCHAR(255),
                    field VARCHAR(50),
                    original_value VARCHAR(255),
                    corrected_value VARCHAR(255),
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """,
            'policies': """
                CREATE TABLE IF NOT EXISTS policies (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    title VARCHAR(255),
                    description VARCHAR(500),
                    policy_type VARCHAR(50),
                    scope JSON,
                    action_constraint VARCHAR(50),
                    severity VARCHAR(20),
                    priority INT DEFAULT 10,
                    conditions JSON,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """
        }
        
        for table_name, create_sql in tables_to_check.items():
            try:
                await conn.execute(text(create_sql))
                print(f"Table '{table_name}' verified.")
            except Exception as e:
                print(f"Error creating {table_name}: {e}")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(fix_database())
