import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def sync_all_tables():
    engine = create_async_engine(DATABASE_URL)
    
    async with engine.begin() as conn:
        print("Ensuring all tables from db_models.py exist...")
        
        tables = {
            'users': """
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) UNIQUE,
                    full_name VARCHAR(255),
                    avatar_url VARCHAR(255),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    ai_provider VARCHAR(50) DEFAULT 'default',
                    api_key VARCHAR(500),
                    personality_type VARCHAR(50) DEFAULT 'general',
                    personality_context TEXT,
                    is_onboarded BOOLEAN DEFAULT FALSE
                )
            """,
            'relationships': """
                CREATE TABLE IF NOT EXISTS relationships (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    email_address VARCHAR(255),
                    total_interactions INT DEFAULT 0,
                    last_interaction DATETIME,
                    interaction_history JSON,
                    promises_made JSON,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """,
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
            'user_metrics': """
                CREATE TABLE IF NOT EXISTS user_metrics (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    accuracy FLOAT DEFAULT 100.0,
                    total_decisions INT DEFAULT 0,
                    total_corrections INT DEFAULT 0,
                    time_saved_minutes INT DEFAULT 0,
                    replies_prevented INT DEFAULT 0,
                    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
            """,
            'counterfactual_logs': """
                CREATE TABLE IF NOT EXISTS counterfactual_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    email_id VARCHAR(255),
                    ai_recommendation JSON,
                    user_action VARCHAR(255),
                    was_overridden BOOLEAN DEFAULT FALSE,
                    predicted_impact JSON,
                    actual_outcome JSON,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """,
            'delegations': """
                CREATE TABLE IF NOT EXISTS delegations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    email_id VARCHAR(255),
                    thread_id VARCHAR(255),
                    original_subject VARCHAR(255),
                    original_sender VARCHAR(255),
                    delegate_email VARCHAR(255),
                    expected_action VARCHAR(500),
                    reply_draft TEXT,
                    feedback TEXT,
                    thread_context JSON,
                    instruction_history JSON,
                    send_mode VARCHAR(20) DEFAULT 'thread',
                    status VARCHAR(50) DEFAULT 'pending',
                    sla_deadline DATETIME,
                    last_instruction_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """,
            'analysis_tasks': """
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
        }
        
        for name, sql in tables.items():
            print(f"Creating/Verifying {name}...")
            try:
                await conn.execute(text(sql))
            except Exception as e:
                print(f"Error with {name}: {e}")
                
    await engine.dispose()
    print("\nSync complete.")

if __name__ == "__main__":
    asyncio.run(sync_all_tables())
