from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from models import EmailMessage, IntentAnalysis, UserCorrection, DecisionMetric, ActionRecommendation, CustomReplyRequest, PersonalityUpdate
from intents import IntentEngine
from memory import PersonalMemory, RelationshipMemory
from database import get_db
from db_models import User  # Import User model
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime
from typing import List, Optional
from gmail_service import GmailService
from db_models import User


import logging
import json
logging.basicConfig(level=logging.DEBUG, filename='backend_debug.log', filemode='a',
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="Decision Intelligence Email Assistant")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Default engine (will be created per-request with user settings)
memory = PersonalMemory()
relationship_memory = RelationshipMemory()

# Pydantic model for API settings
class ApiSettings(BaseModel):
    provider: str  # 'default', 'openai', 'gemini'
    api_key: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "Decision Intelligence API is running"}

@app.get("/emails")
async def get_emails(
    authorization: str = Header(None)
):
    logger.debug(f"/emails endpoint hit with Auth header: {authorization[:20] if authorization else 'None'}...")
    if not authorization or not authorization.startswith("Bearer "):
        logger.error("Missing or invalid Bearer token")
        raise HTTPException(status_code=401, detail="Missing access token")
    
    token = authorization.split(" ")[1]
    try:
        gmail = GmailService(token)
        emails = await gmail.fetch_latest_emails()
        logger.info(f"Successfully fetched {len(emails)} emails")
        return emails
    except Exception as e:
        logger.error(f"Error in get_emails: {str(e)}")
        # IMPORTANT: Returning the actual error string to the frontend for debugging
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze", response_model=IntentAnalysis)
async def analyze_email(
    email: EmailMessage,
    db: AsyncSession = Depends(get_db),
    x_user_email: str = Header(None, alias="X-User-Email")
):
    logger.debug(f"/analyze endpoint hit for message_id: {email.message_id}")
    try:
        # Get user's API settings
        provider = 'default'
        api_key = None
        
        if x_user_email:
            result = await db.execute(select(User).where(User.email == x_user_email))
            user = result.scalar_one_or_none()
            if user:
                if user.ai_provider:
                    provider = user.ai_provider
                if user.api_key:
                    api_key = user.api_key
        
        # Check if we have what we need for the provider
        if provider != 'default' and not api_key:
            # If user selected a provider but hasn't set a key, we can't analyze
             raise HTTPException(status_code=422, detail="API Key missing")

        # Create engine with user's settings, handling initialization errors
        try:
            engine = IntentEngine(provider=provider, api_key=api_key)
        except Exception as e:
            logger.error(f"Failed to initialize IntentEngine: {e}")
            raise HTTPException(status_code=500, detail=f"AI Engine Error: {str(e)}")
        
        
        # Fetch user settings (Personality)
        user_personality = "general"
        user_context = ""
        if x_user_email:
            result = await db.execute(select(User).where(User.email == x_user_email))
            user_obj = result.scalar_one_or_none()
            if user_obj:
                user_personality = user_obj.personality_type or "general"
                user_context = user_obj.personality_context or ""

        # Fetch relationship context
        rel_data = await relationship_memory.get_relationship(db, x_user_email, email.from_email)
        relationship_context = json.dumps(rel_data, default=str)
        
        thread_history = "" 
        analysis = engine.analyze_email(
            email, 
            thread_history, 
            relationship_context,
            personality_type=user_personality,
            personality_context=user_context
        )
        
        # --- Guardrails & Hard Overrides ---
        # 1. Internal Domain Override: Never Ignore internal folks
        if x_user_email and email.from_email:
            user_domain = x_user_email.split('@')[-1]
            sender_domain = email.from_email.split('@')[-1]
            if user_domain == sender_domain and analysis.primary_action_id in ['ignore', 'do_nothing']:
                # Override to 'archive' or 'read' to be safe, or just force a neutral 'acknowledge'
                # For now, let's just log and swap to 'archive' if strictly internal
                logger.info(f"Guardrail triggered: Internal domain {user_domain}. Swapping Ignore -> Archive.")
                if analysis.recommendations:
                    # Find 'archive' or create it
                    archive_rec = next((r for r in analysis.recommendations if r.action_type == 'archive'), None)
                    if archive_rec:
                        analysis.primary_action_id = archive_rec.id
                    else:
                        # Fallback if AI didn't suggest archive (rare)
                        pass

        # 2. Update Relationship Memory (Async/Fire-and-forget ideally, but here inline)
        # We only update interaction count/date on RECEIVE? 
        # Typically we update on REPLY. But receiving contributes to "Last Interaction".
        # Let's update that we saw an email.
        await relationship_memory.update_relationship(db, x_user_email, email.from_email, {"type": "received"})

        logger.info(f"Successfully analyzed email {email.message_id} using {provider}")
        return analysis
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in analyze_email: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-custom")
async def generate_custom_reply(
    request: CustomReplyRequest,
    db: AsyncSession = Depends(get_db),
    x_user_email: str = Header(None, alias="X-User-Email")
):
    logger.debug(f"/generate-custom endpoint hit for message_id: {request.message_id}")
    try:
        # Get user's API settings
        provider = 'default'
        api_key = None
        
        if x_user_email:
            result = await db.execute(select(User).where(User.email == x_user_email))
            user = result.scalar_one_or_none()
            if user:
                if user.ai_provider:
                    provider = user.ai_provider
                if user.api_key:
                    api_key = user.api_key
        
        if provider != 'default' and not api_key:
             raise HTTPException(status_code=422, detail="API Key missing")
        
        try:
            engine = IntentEngine(provider=provider, api_key=api_key)
            reply = engine.generate_custom_reply(request)
            return {"reply": reply}
        except Exception as e:
             logger.error(f"Failed to generate reply: {e}")
             raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in generate_custom_reply: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user/personality")
async def get_personality(
    x_user_email: str = Header(None),
    db: AsyncSession = Depends(get_db)
):
    if not x_user_email:
        raise HTTPException(status_code=400, detail="Missing user email header")
    
    result = await db.execute(select(User).where(User.email == x_user_email))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "personality_type": user.personality_type or "general",
        "personality_context": user.personality_context or ""
    }

@app.post("/user/personality")
async def update_personality(
    update_data: PersonalityUpdate,
    x_user_email: str = Header(None),
    db: AsyncSession = Depends(get_db)
):
    if not x_user_email:
        raise HTTPException(status_code=400, detail="Missing user email header")
    
    # Update user personality in DB
    await db.execute(
        update(User)
        .where(User.email == x_user_email)
        .values(
            personality_type=update_data.personality_type,
            personality_context=update_data.personality_context
        )
    )
    await db.commit()
    return {"status": "success", "message": f"Personality updated to {update_data.personality_type}"}

@app.post("/decision")
async def log_decision(
    message_id: str, 
    action: ActionRecommendation, 
    db: AsyncSession = Depends(get_db),
    x_user_email: str = Header(..., alias="X-User-Email")
):
    await memory.log_decision(db, x_user_email, message_id, action)
    return {"status": "success"}

@app.post("/correction")
async def log_correction(
    correction: UserCorrection, 
    db: AsyncSession = Depends(get_db),
    x_user_email: str = Header(..., alias="X-User-Email")
):
    await memory.log_correction(db, x_user_email, correction)
    return {"status": "success"}

@app.get("/metrics", response_model=DecisionMetric)
async def get_metrics(
    db: AsyncSession = Depends(get_db),
    x_user_email: str = Header(..., alias="X-User-Email")
):
    patterns = await memory.get_user_patterns(db, x_user_email)
    return DecisionMetric(
        decisions_saved=patterns.get("total_decisions", 0),
        minutes_saved=patterns.get("minutes_saved", 0),
        consistency_score=patterns.get("accuracy", 1.0),
        rework_reduction=patterns.get("rework_reduction", 0.15),
        replies_prevented=patterns.get("replies_prevented", 0)
    )

@app.get("/history")
async def get_history(
    db: AsyncSession = Depends(get_db),
    x_user_email: str = Header(..., alias="X-User-Email")
):
    history = await memory.get_user_history(db, x_user_email)
    return history

@app.get("/user/api-settings")
async def get_api_settings(
    db: AsyncSession = Depends(get_db),
    x_user_email: str = Header(..., alias="X-User-Email")
):
    """Get user's current API provider setting (without exposing the key)."""
    result = await db.execute(select(User).where(User.email == x_user_email))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "provider": user.ai_provider or 'default',
        "has_custom_key": bool(user.api_key)
    }

@app.post("/user/api-settings")
async def save_api_settings(
    settings: ApiSettings,
    db: AsyncSession = Depends(get_db),
    x_user_email: str = Header(..., alias="X-User-Email")
):
    """Save user's API provider and optional custom key."""
    result = await db.execute(select(User).where(User.email == x_user_email))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update provider
    user.ai_provider = settings.provider
    
    # Update API key if provided
    if settings.api_key:
        user.api_key = settings.api_key
    elif settings.provider == 'default':
        # Clear custom key if switching to default, OR keep it? 
        # Usually clearing is safer to avoid confusion
        user.api_key = None
    
    await db.commit()
    
    return {
        "status": "success",
        "provider": user.ai_provider,
        "has_custom_key": bool(user.api_key)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
