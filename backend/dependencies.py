import os
import httpx
from fastapi import Header, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from database import get_db
from db_models import User, UserSession
import logging
import time
from typing import Optional
from utils import hash_token

logger = logging.getLogger(__name__)

CACHE_TTL = 3600  # 1 hour session validity


async def verify_user(
    authorization: str = Header(...),
    x_user_email: str = Header(..., alias="X-User-Email"),
    x_refresh_token: Optional[str] = Header(None, alias="X-Refresh-Token"),
    db: AsyncSession = Depends(get_db)
) -> str:
    """
    Verify use via DB session first, fallback to Google.
    Returns verified email string.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.split(" ")[1]
    token_hash = hash_token(token)
    now = time.time()

    # 1. Check DB Session
    result = await db.execute(
        select(UserSession).where(UserSession.token_hash == token_hash)
    )
    session = result.scalar_one_or_none()

    if session:
        if now < session.expires_at:
            if session.email.lower() == x_user_email.lower():
                # Update refresh token if provided and different
                if x_refresh_token:
                    # Sync with session
                    if x_refresh_token != session.refresh_token:
                        session.refresh_token = x_refresh_token
                    
                    # Sync with user model for persistence
                    result_u = await db.execute(select(User).where(User.id == session.user_id))
                    db_user = result_u.scalar_one_or_none()
                    if db_user and x_refresh_token != db_user.refresh_token:
                        db_user.refresh_token = x_refresh_token
                
                if x_refresh_token or session.refresh_token:
                    await db.commit()
                return session.email
            else:
                logger.warning(f"Session hijack attempt? stored={session.email}, req={x_user_email}")
                # Fall through to re-verify with Google
        else:
            # Expired, clean up
            await db.delete(session)
            await db.commit()

    # 2. Verify with Google (Fallback)
    token_preview = f"{token[:10]}...{token[-10:]}" if len(token) > 20 else "short"
    logger.debug(f"Verifying token with Google for {x_user_email}. Preview: {token_preview}")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code != 200:
                logger.error(f"Google Auth failed: {response.status_code}")
                raise HTTPException(status_code=401, detail="Invalid token")

            user_info = response.json()
            verified_email = user_info.get("email")
            
            if not verified_email:
                raise HTTPException(status_code=401, detail="Token missing email claim")
            
            if verified_email.lower() != x_user_email.lower():
                raise HTTPException(status_code=403, detail="Identity mismatch")
            
            # 3. Create/Refresh DB Session
            ur = await db.execute(select(User).where(User.email == verified_email))
            db_user = ur.scalar_one_or_none()
            
            if not db_user:
                # We need to create the user here to link the session
                from memory import PersonalMemory
                memory = PersonalMemory()
                db_user = await memory.get_or_create_user(db, verified_email)

            # Check for existing session to preserve refresh token if not provided
            existing_refresh_token = None
            if not x_refresh_token:
                # Try to find any valid session for this user to copy refresh token provided previously
                # This is a bit of a heuristic but helps if the client doesn't send it every time
                last_sess_res = await db.execute(
                    select(UserSession)
                    .where(UserSession.user_id == db_user.id)
                    .where(UserSession.refresh_token.isnot(None))
                    .order_by(UserSession.created_at.desc())
                    .limit(1)
                )
                last_sess = last_sess_res.scalar_one_or_none()
                if last_sess:
                    existing_refresh_token = last_sess.refresh_token

            # Update user's persistent refresh token if we have a fresh one
            if x_refresh_token and x_refresh_token != db_user.refresh_token:
                db_user.refresh_token = x_refresh_token

            # Store session
            new_session = UserSession(
                token_hash=token_hash,
                user_id=db_user.id,
                email=verified_email,
                expires_at=now + CACHE_TTL,
                refresh_token=x_refresh_token or existing_refresh_token or db_user.refresh_token
            )
            # Use merge to handle potential races or re-logins
            await db.merge(new_session)
            await db.commit()
            
            return verified_email

    except httpx.HTTPError as e:
        logger.error(f"Auth Network Error: {e}")
        raise HTTPException(status_code=503, detail="Auth service unavailable")

    except httpx.HTTPError as e:
        logger.error(f"Auth Network Error: {e}")
        raise HTTPException(status_code=503, detail="Auth service unavailable")

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    verified_email: str = Depends(verify_user)
) -> User:
    """Fetch the user object from DB after identity verification."""
    result = await db.execute(select(User).where(User.email == verified_email))
    user = result.scalar_one_or_none()
    
    if not user:
        # Auto-create user if they don't exist yet but are authenticated via Google
        from memory import PersonalMemory
        memory = PersonalMemory()
        user = await memory.get_or_create_user(db, verified_email)
        
    return user
