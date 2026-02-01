from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update
import logging

from models import PersonalityUpdate
from database import get_db
from dependencies import get_current_user
from encryption import get_encryption_service
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/user", tags=["user"])
logger = logging.getLogger(__name__)

class ApiSettings(BaseModel):
    provider: str
    api_key: Optional[str] = None

import json

@router.get("/personality")
async def get_personality(user = Depends(get_current_user)):
    # Try to parse the context as JSON
    raw_context = user.personality_context
    contexts = {}
    
    if raw_context:
        try:
            contexts = json.loads(raw_context)
            if not isinstance(contexts, dict):
                # Fallback for old single-string context
                contexts = {"general": str(raw_context)}
        except json.JSONDecodeError:
            # Fallback for plain text
            contexts = {"general": raw_context}
    
    current_type = user.personality_type or "general"
    return {
        "personality_type": current_type,
        "personality_contexts": contexts,
        "personality_context": contexts.get(current_type, ""),
        "is_onboarded": user.is_onboarded
    }

@router.post("/personality")
async def update_personality(
    update_data: PersonalityUpdate,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    # Retrieve current context mapping
    raw_context = user.personality_context
    contexts = {}
    
    if raw_context:
        try:
            contexts = json.loads(raw_context)
            if not isinstance(contexts, dict):
                contexts = {"general": str(raw_context)}
        except json.JSONDecodeError:
            contexts = {"general": raw_context}
    
    # Update the specific persona's context
    contexts[update_data.personality_type] = update_data.personality_context or ""
    
    await db.execute(
        update(user.__class__)
        .where(user.__class__.id == user.id)
        .values(
            personality_type=update_data.personality_type,
            personality_context=json.dumps(contexts)
        )
    )
    await db.commit()
    return {"status": "success"}

@router.get("/api-settings")
async def get_api_settings(user = Depends(get_current_user)):
    return {
        "provider": user.ai_provider or "openai",
        "has_api_key": bool(user.api_key)
    }

@router.post("/api-settings")
async def save_api_settings(
    settings: ApiSettings,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    encrypted_key = None
    if settings.api_key:
        try:
            encryption_service = get_encryption_service()
            encrypted_key = encryption_service.encrypt(settings.api_key)
        except Exception as e:
            logger.error(f"Encryption failed: {e}")
            raise HTTPException(status_code=500, detail="Security error")
    
    await db.execute(
        update(user.__class__)
        .where(user.__class__.id == user.id)
        .values(
            ai_provider=settings.provider,
            api_key=encrypted_key,
            is_onboarded=True
        )
    )
    await db.commit()
    return {"status": "success"}
