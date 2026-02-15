
import asyncio
import os
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import sys

# Add the current directory to path so we can import models
sys.path.append(os.getcwd())

from db_models import ScheduledEmail

async def check_failed_emails():
    load_dotenv()
    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        print("DATABASE_URL not found")
        return

    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    try:
        async with async_session() as session:
            result = await session.execute(
                select(ScheduledEmail).where(ScheduledEmail.status == 'failed')
            )
            emails = result.scalars().all()
            
            if not emails:
                print("No failed emails found.")
                return
                
            print(f"Found {len(emails)} failed emails:")
            for email in emails:
                # Truncate body for readability if needed, but error is what we want
                print(f"--- Email ID: {email.id} ---")
                print(f"Recipient: {email.recipient}")
                print(f"Scheduled For: {email.scheduled_time}")
                print(f"Error Message: {email.error}")
                print("-" * 20)
    finally:
        await engine.dispose()

if __name__ == "__main__":
    try:
        asyncio.run(check_failed_emails())
    except KeyboardInterrupt:
        pass
