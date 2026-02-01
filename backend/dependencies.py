import os
import httpx
from fastapi import Header, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from db_models import User
from sqlalchemy import select
import logging
import time
from typing import Dict, Tuple

logger = logging.getLogger(__name__)

# In-memory cache for verified tokens: {token: (email, expiry)}
TOKEN_CACHE: Dict[str, Tuple[str, float]] = {}
CACHE_TTL = 300  # 5 minutes

async def verify_user(
    authorization: str = Header(...),
    x_user_email: str = Header(..., alias="X-User-Email")
) -> User:
    """
    Verify the user by checking their access token against Google's userinfo API
    and comparing the returned email with the X-User-Email header.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.split(" ")[1]
    
    # Check cache
    now = time.time()
    if token in TOKEN_CACHE:
        email, expiry = TOKEN_CACHE[token]
        if now < expiry:
            if email.lower() == x_user_email.lower():
                return email
            else:
                logger.warning(f"Email mismatch in cache: {email} vs {x_user_email}")
                # Don't fail yet, maybe the cache is stale or token is reused? 
                # Actually, if email mismatch, we should probably re-verify or fail.
        else:
            del TOKEN_CACHE[token]

    # Debug: Token preview
    token_preview = f"{token[:10]}...{token[-10:]}" if len(token) > 20 else "short_token"
    logger.debug(f"Verifying token for {x_user_email}. Preview: {token_preview}")
    
    try:
        async with httpx.AsyncClient() as client:
            # Verify token with Google
            response = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code != 200:
                logger.error(f"Token verification failed for {x_user_email}. Status: {response.status_code}, Response: {response.text}")
                raise HTTPException(status_code=401, detail="Invalid or expired token")

            user_info = response.json()
            verified_email = user_info.get("email")
            
            if not verified_email:
                raise HTTPException(status_code=401, detail="Token does not contain email")
            
            if verified_email.lower() != x_user_email.lower():
                logger.warning(f"Email spoofing detected: {verified_email} vs {x_user_email}")
                raise HTTPException(status_code=403, detail="Identity spoofing detected")
            
            # Store in cache
            TOKEN_CACHE[token] = (verified_email, now + CACHE_TTL)
            
            return verified_email

    except httpx.HTTPError as e:
        logger.error(f"OAuth verification network error: {e}")
        raise HTTPException(status_code=503, detail="Authentication service unavailable")

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
