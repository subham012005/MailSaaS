import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Optional
from sqlalchemy import select
from database import AsyncSessionLocal
from db_models import ScheduledEmail, User, UserSession
from gmail_service import GmailService
from routers import emails, user, delegations, metrics, governance, notifications
from datetime import datetime
from utils import hash_token
from dotenv import load_dotenv

# Load environment variables
load_dotenv(override=True)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add a file handler for scheduled emails worker
worker_log_handler = logging.FileHandler("worker_debug.log")
worker_log_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
worker_logger = logging.getLogger("scheduled_worker")
worker_logger.setLevel(logging.INFO)
worker_logger.addHandler(worker_log_handler)
worker_logger.propagate = False # Don't duplicate in main logger

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

async def refresh_access_token(refresh_token: str) -> Optional[str]:
    """Exchange refresh token for new access token."""
    import httpx
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": os.getenv("GOOGLE_CLIENT_ID"),
                    "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
                    "refresh_token": refresh_token,
                    "grant_type": "refresh_token"
                }
            )
            data = response.json()
            if response.status_code == 200 and "access_token" in data:
                return data["access_token"]
            worker_logger.error(f"Token refresh failed: {data}")
            return None
    except Exception as e:
        worker_logger.error(f"Token refresh exception: {e}", exc_info=True)
        return None

async def send_scheduled_emails_worker():
    """Background worker to send scheduled emails."""
    worker_logger.info("Starting scheduled emails background worker")
    
    # Import here to avoid circular dependencies if any
    from datetime import timezone
    import time
    
    while True:
        try:
            async with AsyncSessionLocal() as db:
                # Use timezone-aware datetime for proper comparison with database timestamps
                now = datetime.now(timezone.utc)
                worker_logger.info(f"Worker Loop: Checking for scheduled emails at {now} (UTC)")
                
                result = await db.execute(
                    select(ScheduledEmail)
                    .where(ScheduledEmail.status == 'pending', ScheduledEmail.scheduled_time <= now)
                )
                scheduled_emails = result.scalars().all()
                
                if scheduled_emails:
                    worker_logger.info(f"Found {len(scheduled_emails)} scheduled email(s) ready to send")
                
                for scheduled_email in scheduled_emails:
                    try:
                        # Fetch user explicitly
                        u_res = await db.execute(select(User).where(User.id == scheduled_email.user_id))
                        user = u_res.scalar_one_or_none()
                        
                        if not user:
                            worker_logger.error(f"User {scheduled_email.user_id} not found for email {scheduled_email.id}")
                            continue
                        
                        worker_logger.info(f"Processing scheduled email {scheduled_email.id} for {user.email}")
                        access_token = None
                        
                        # 1. Prioritize User's persistent Refresh Token
                        if user.refresh_token:
                            worker_logger.info(f"Using persistent refresh token for {user.email}")
                            access_token = await refresh_access_token(user.refresh_token)
                        
                        # 2. Fallback to session if no access token yet
                        if not access_token:
                            worker_logger.info(f"No persistent token or refresh failed, checking sessions for {user.email}...")
                            sess_result = await db.execute(
                                select(UserSession)
                                .where(UserSession.user_id == user.id)
                                .order_by(
                                    UserSession.refresh_token.isnot(None).desc(),
                                    UserSession.expires_at.desc()
                                )
                                .limit(1)
                            )
                            session = sess_result.scalar_one_or_none()
                            
                            if session and session.refresh_token:
                                worker_logger.info(f"Using session refresh token for {user.email}")
                                access_token = await refresh_access_token(session.refresh_token)
                                if access_token:
                                    # Update user model for future persistent use
                                    user.refresh_token = session.refresh_token
                        
                        if not access_token:
                             raise Exception(f"Could not obtain a valid access token for {user.email} (neither persistent nor session token available/valid).")

                        gmail = GmailService(access_token)
                        
                        if scheduled_email.thread_id:
                            await gmail.reply_to_thread(
                                thread_id=scheduled_email.thread_id,
                                recipient=scheduled_email.recipient,
                                subject=scheduled_email.subject,
                                body_text=scheduled_email.body,
                                in_reply_to=scheduled_email.in_reply_to,
                                references=scheduled_email.references
                            )
                        else:
                            await gmail.send_email(
                                recipient=scheduled_email.recipient,
                                subject=scheduled_email.subject,
                                body_text=scheduled_email.body
                            )
                        
                        scheduled_email.status = 'sent'
                        scheduled_email.error = None
                        worker_logger.info(f"✓ Successfully sent scheduled email {scheduled_email.id} to {scheduled_email.recipient}")
                                
                    except Exception as e:
                        error_msg = f"Failed to send scheduled email {scheduled_email.id}: {str(e)}"
                        worker_logger.error(error_msg, exc_info=True)
                        scheduled_email.status = 'failed'
                        scheduled_email.error = str(e)[:500]
                
                await db.commit()
        except Exception as e:
            logger.exception(f"Error in scheduled emails worker loop: {e}")
        
        # Check every 60 seconds
        await asyncio.sleep(60)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start the background worker
    worker_task = asyncio.create_task(send_scheduled_emails_worker())
    yield
    # Shutdown: Cancel the worker
    worker_task.cancel()
    try:
        await worker_task
    except asyncio.CancelledError:
        pass

# Initialize FastAPI app
app = FastAPI(
    title="Decision Intelligence API",
    description="AI-powered email decision intelligence system",
    version="2.0-async",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://0.0.0.0:3000",
        "https://smartemail.in",
        "https://www.smartemail.in",
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "X-User-Email", "Content-Type", "Accept", "X-Refresh-Token"],
)

# Register Routers
app.include_router(emails.router)
app.include_router(user.router)
app.include_router(delegations.router)
app.include_router(metrics.router)
app.include_router(governance.router)
app.include_router(notifications.router)

@app.get("/")
async def root():
    return {"message": "Decision Intelligence API is running", "version": "2.0-async"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
