import asyncio
from sqlalchemy import select
from database import AsyncSessionLocal, engine
from db_models import ScheduledEmail, UserSession, User

# Silence SQL logs
engine.echo = False

async def check_emails():
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(ScheduledEmail, UserSession.refresh_token, User.email)
            .join(User, User.id == ScheduledEmail.user_id)
            .outerjoin(UserSession, UserSession.user_id == User.id)
            .order_by(ScheduledEmail.id.desc())
            .limit(5)
        )
        data = result.all()
        print(f"Found {len(data)} scheduled emails:")
        for e, refresh_token, email in data:
            print(f"ID: {e.id}")
            print(f"  User: {email}")
            print(f"  Refresh Token: {'PRESENT' if refresh_token else 'MISSING'}")
            print(f"  Status: {e.status}")
            print(f"  Error: {e.error}")
            print("-" * 30)

if __name__ == "__main__":
    asyncio.run(check_emails())
