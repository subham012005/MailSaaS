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
    x_user_email: str = Header(None, alias="X-User-Email"),
    authorization: str = Header(None)
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
        
        # Fetch User Policies
        policies = []
        if x_user_email:
            result = await db.execute(select(User).where(User.email == x_user_email))
            user_obj = result.scalar_one_or_none()
            if user_obj:
                from db_models import Policy
                pol_result = await db.execute(select(Policy).where(Policy.user_id == user_obj.id, Policy.is_active == True))
                # Convert to list of dicts for the engine
                policies = [{
                    "title": p.title,
                    "description": p.description,
                    "policy_type": p.policy_type,
                    "scope": p.scope,
                    "action_constraint": p.action_constraint,
                    "severity": p.severity,
                    "priority": p.priority,
                    "conditions": p.conditions
                } for p in pol_result.scalars().all()]

        # Fetch Thread History for Context
        thread_history = ""
        if authorization and authorization.startswith("Bearer ") and email.thread_id:
            try:
                token = authorization.split(" ")[1]
                gmail = GmailService(token)
                thread_msgs = await gmail.get_email_thread(email.thread_id)
                # Format into a readable string for the LLM
                history_blocks = []
                for m in thread_msgs:
                    if m['id'] == email.message_id:
                        continue # Skip the current message to avoid redundancy
                    history_blocks.append(f"FROM: {m['from']}\nDATE: {m['date']}\nMESSAGE: {m['body']}")
                
                thread_history = "\n---\n".join(history_blocks)
                if not thread_history:
                    thread_history = "(This is the first message in the thread)"
                    
                logger.info(f"Successfully injected {len(history_blocks)} messages of previous thread context")
            except Exception as e:
                logger.warn(f"Failed to fetch thread context: {e}")

        analysis = engine.analyze_email(
            email, 
            thread_history, 
            relationship_context,
            personality_type=user_personality,
            personality_context=user_context,
            policies=policies
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

# --- Direct Reply Action ---

class ReplyRequest(BaseModel):
    thread_id: str
    recipient: str
    subject: str
    body: str
    in_reply_to: Optional[str] = None
    references: Optional[str] = None

@app.post("/reply")
async def send_direct_reply(
    data: ReplyRequest,
    authorization: str = Header(None)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing access token")
    
    token = authorization.split(" ")[1]
    try:
        gmail = GmailService(token)
        message_id = await gmail.reply_to_thread(
            thread_id=data.thread_id,
            recipient=data.recipient,
            subject=data.subject,
            body_text=data.body,
            in_reply_to=data.in_reply_to,
            references=data.references
        )
        return {"status": "success", "message_id": message_id}
    except Exception as e:
        logger.error(f"Failed to send direct reply: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/thread/{thread_id}")
async def get_thread(
    thread_id: str,
    authorization: str = Header(None)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing access token")
    
    token = authorization.split(" ")[1]
    try:
        gmail = GmailService(token)
        messages = await gmail.get_email_thread(thread_id)
        return messages
    except Exception as e:
        logger.error(f"Failed to fetch thread {thread_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Counterfactual & Override Logging ---

class OverrideRequest(BaseModel):
    email_id: str
    ai_recommendation: dict
    user_action: str
    predicted_impact: dict

@app.post("/override")
async def log_override(
    data: OverrideRequest,
    db: AsyncSession = Depends(get_db),
    x_user_email: str = Header(..., alias="X-User-Email")
):
    result = await db.execute(select(User).where(User.email == x_user_email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    from db_models import CounterfactualLog
    log = CounterfactualLog(
        user_id=user.id,
        email_id=data.email_id,
        ai_recommendation=data.ai_recommendation,
        user_action=data.user_action,
        was_overridden=True,
        predicted_impact=data.predicted_impact
    )
    db.add(log)
    await db.commit()
    return {"status": "success"}

# --- Delegation Intelligence ---

class DelegationCreate(BaseModel):
    email_id: str
    thread_id: str
    delegate_email: str
    expected_action: str
    original_from: str
    original_subject: str
    original_body: str
    intel_report: dict
    sla_hours: int = 24

class DraftSubmit(BaseModel):
    reply_draft: str

class RequestChanges(BaseModel):
    feedback: str

@app.post("/delegate")
async def create_delegation(
    data: DelegationCreate,
    db: AsyncSession = Depends(get_db),
    x_user_email: str = Header(..., alias="X-User-Email"),
    authorization: str = Header(None)
):
    result = await db.execute(select(User).where(User.email == x_user_email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch Thread History for Context
    thread_history_data = []
    if authorization and authorization.startswith("Bearer ") and data.thread_id:
        token = authorization.split(" ")[1]
        try:
            gmail = GmailService(token)
            thread_history_data = await gmail.get_email_thread(data.thread_id)
            logger.info(f"Fetched {len(thread_history_data)} messages for delegation context")
            
            # Trigger Auto-Forwarding via Gmail
            await gmail.send_delegation_report(
                recipient=data.delegate_email,
                original_from=data.original_from,
                original_subject=data.original_subject,
                original_body=data.original_body,
                intel_report=data.intel_report,
                user_instructions=data.expected_action,
                thread_history=thread_history_data # Include thread history in email
            )
        except Exception as e:
            logger.error(f"Failed to fetch thread or send report: {e}")
    
    from db_models import Delegation
    from datetime import timedelta
    deadline = datetime.now() + timedelta(hours=data.sla_hours)
    
    new_del = Delegation(
        user_id=user.id,
        email_id=data.email_id,
        thread_id=data.thread_id,
        original_subject=data.original_subject,
        original_sender=data.original_from, # Store original sender
        delegate_email=data.delegate_email,
        expected_action=data.expected_action,
        thread_context=thread_history_data, # Store context in DB
        sla_deadline=deadline
    )
    db.add(new_del)
    await db.commit()
    return {"status": "success", "id": new_del.id}

@app.get("/delegations")
async def get_delegations(
    db: AsyncSession = Depends(get_db),
    x_user_email: str = Header(..., alias="X-User-Email"),
    authorization: str = Header(None)
):
    result = await db.execute(select(User).where(User.email == x_user_email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    from db_models import Delegation
    from sqlalchemy import and_
    
    # 1. Fetch pending delegations
    res = await db.execute(select(Delegation).where(Delegation.user_id == user.id))
    delegations = res.scalars().all()
    
    # 2. Oversight Engine: check for completions
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        gmail = GmailService(token)
        
        updated_count = 0
        for d in delegations:
            if d.status == 'pending':
                try:
                    # Check thread for replies from delegate
                    messages = await gmail.get_email_thread(d.thread_id)
                    # Sync context
                    d.thread_context = messages
                    
                    # Check if any message comes from the delegate email
                    # (Simple check: is the sender email the same?)
                    for msg in messages:
                        sender = msg.get('from', '').lower()
                        if d.delegate_email.lower() in sender:
                            d.status = 'handled'
                            updated_count += 1
                            break
                    
                    # Also check for SLA breach
                    if d.status == 'pending' and datetime.now() > d.sla_deadline.replace(tzinfo=None):
                        d.status = 'overdue'
                        updated_count += 1
                        
                except Exception as e:
                    logger.warn(f"Failed to verify delegation status for {d.id}: {e}")
        
        if updated_count > 0:
            await db.commit()
            logger.info(f"Oversight engine updated {updated_count} delegation statuses")

    return delegations

@app.get("/delegations/assigned")
async def get_assigned_delegations(
    db: AsyncSession = Depends(get_db),
    x_user_email: str = Header(..., alias="X-User-Email")
):
    """Fetch delegations assigned TO the current user."""
    if not x_user_email:
        raise HTTPException(status_code=400, detail="Missing user email")
    
    from db_models import Delegation
    res = await db.execute(select(Delegation).where(Delegation.delegate_email == x_user_email))
    return res.scalars().all()

@app.post("/delegations/{delegation_id}/submit-draft")
async def submit_delegation_draft(
    delegation_id: int,
    data: DraftSubmit,
    db: AsyncSession = Depends(get_db),
    x_user_email: str = Header(..., alias="X-User-Email")
):
    from db_models import Delegation
    result = await db.execute(select(Delegation).where(Delegation.id == delegation_id))
    delegation = result.scalar_one_or_none()
    
    if not delegation:
        raise HTTPException(status_code=404, detail="Delegation not found")
    
    if delegation.delegate_email != x_user_email:
        raise HTTPException(status_code=403, detail="Not authorized to submit draft for this delegation")
    
    delegation.reply_draft = data.reply_draft
    delegation.status = 'awaiting_approval'
    await db.commit()
    return {"status": "success"}

@app.post("/delegations/{delegation_id}/approve")
async def approve_delegation(
    delegation_id: int,
    db: AsyncSession = Depends(get_db),
    x_user_email: str = Header(..., alias="X-User-Email"),
    authorization: str = Header(None)
):
    from db_models import Delegation, User
    result = await db.execute(select(Delegation).where(Delegation.id == delegation_id))
    delegation = result.scalar_one_or_none()
    
    if not delegation:
        raise HTTPException(status_code=404, detail="Delegation not found")
    
    # Verify the boss is the one approving
    user_res = await db.execute(select(User).where(User.id == delegation.user_id))
    boss = user_res.scalar_one_or_none()
    if not boss or boss.email != x_user_email:
        raise HTTPException(status_code=403, detail="Not authorized to approve this delegation")

    if not delegation.reply_draft:
        raise HTTPException(status_code=400, detail="No draft to approve")

    # Send the email via Boss's Gmail
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Boss access token required to send approved email")
        
    token = authorization.split(" ")[1]
    try:
        gmail = GmailService(token)
        # We need the recipient. We can extract it from the thread history or store it.
        # For now, let's try to find who sent the original email.
        thread_messages = await gmail.get_email_thread(delegation.thread_id)
        if not thread_messages:
            raise HTTPException(status_code=500, detail="Could not fetch thread context")
            
        original_sender = thread_messages[0]['from']
        # Extract email from "Name <email@example.com>" or just "email@example.com"
        import re
        email_match = re.search(r'[\w\.-]+@[\w\.-]+', original_sender)
        recipient = email_match.group(0) if email_match else original_sender

        # Send Reply
        await gmail.reply_to_thread(
            thread_id=delegation.thread_id,
            recipient=recipient,
            subject=delegation.original_subject,
            body_text=delegation.reply_draft
        )
        
        delegation.status = 'sent'
        await db.commit()
    except Exception as e:
        logger.error(f"Failed to send approved delegation reply: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

    return {"status": "success"}

@app.post("/delegations/{delegation_id}/request-changes")
async def request_delegation_changes(
    delegation_id: int,
    data: RequestChanges,
    db: AsyncSession = Depends(get_db),
    x_user_email: str = Header(..., alias="X-User-Email")
):
    from db_models import Delegation, User
    result = await db.execute(select(Delegation).where(Delegation.id == delegation_id))
    delegation = result.scalar_one_or_none()
    
    if not delegation:
        raise HTTPException(status_code=404, detail="Delegation not found")
    
    user_res = await db.execute(select(User).where(User.id == delegation.user_id))
    boss = user_res.scalar_one_or_none()
    if not boss or boss.email != x_user_email:
        raise HTTPException(status_code=403, detail="Not authorized")

    delegation.feedback = data.feedback
    delegation.status = 'needs_changes'
    await db.commit()
    return {"status": "success"}

@app.post("/delegations/{delegation_id}/send-direct")
async def delegation_send_direct(
    delegation_id: int,
    data: DraftSubmit,
    db: AsyncSession = Depends(get_db),
    x_user_email: str = Header(..., alias="X-User-Email")
):
    """Delegate sends reply directly, bypasses boss approval."""
    from db_models import Delegation
    result = await db.execute(select(Delegation).where(Delegation.id == delegation_id))
    delegation = result.scalar_one_or_none()
    
    if not delegation:
        raise HTTPException(status_code=404, detail="Delegation not found")
    
    if delegation.delegate_email != x_user_email:
        raise HTTPException(status_code=403, detail="Not authorized")

    delegation.reply_draft = data.reply_draft
    delegation.status = 'sent'
    await db.commit()
    return {"status": "success"}

@app.delete("/delegations/{delegation_id}")
async def delete_delegation(
    delegation_id: int,
    db: AsyncSession = Depends(get_db),
    x_user_email: str = Header(..., alias="X-User-Email")
):
    from db_models import Delegation, User
    result = await db.execute(select(Delegation).where(Delegation.id == delegation_id))
    delegation = result.scalar_one_or_none()
    
    if not delegation:
        raise HTTPException(status_code=404, detail="Delegation not found")
    
    user_res = await db.execute(select(User).where(User.id == delegation.user_id))
    user = user_res.scalar_one_or_none()
    
    if (user and user.email == x_user_email) or delegation.delegate_email == x_user_email:
        await db.delete(delegation)
        await db.commit()
        return {"status": "success"}
        
    raise HTTPException(status_code=403, detail="Not authorized")

# --- Inbox Load Forecasting ---

@app.get("/forecast")
async def get_load_forecast(
    db: AsyncSession = Depends(get_db),
    x_user_email: str = Header(..., alias="X-User-Email")
):
    """Predicts future inbox load based on pending threads and predicted outcomes."""
    # Mock logic for now
    return {
        "trajectory": "rising", # or 'stable', 'falling'
        "tomorrow_expected_load": 12,
        "load_reduction_potential": 45, # %
        "weekly_volume_prediction": 85,
        "insight": "Replying now reduces expected tomorrow load by 15%."
    }

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
    logger.debug(f"/history endpoint hit for user: {x_user_email}")
    try:
        if not x_user_email:
            raise HTTPException(status_code=400, detail="Missing user email header")
        history = await memory.get_user_history(db, x_user_email)
        logger.info(f"Successfully retrieved history for {x_user_email}")
        return history
    except Exception as e:
        logger.error(f"Error in get_history endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"History error: {str(e)}")

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

# --- Policy Endpoints ---

class PolicyCreate(BaseModel):
    description: str

@app.get("/policies")
async def get_policies(
    db: AsyncSession = Depends(get_db),
    x_user_email: str = Header(..., alias="X-User-Email")
):
    result = await db.execute(select(User).where(User.email == x_user_email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    from db_models import Policy
    res = await db.execute(select(Policy).where(Policy.user_id == user.id))
    return res.scalars().all()

@app.post("/policies")
async def create_policy(
    policy_data: PolicyCreate,
    db: AsyncSession = Depends(get_db),
    x_user_email: str = Header(..., alias="X-User-Email")
):
    result = await db.execute(select(User).where(User.email == x_user_email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    from db_models import Policy
    new_policy = Policy(user_id=user.id, description=policy_data.description)
    db.add(new_policy)
    await db.commit()
    return {"status": "success", "id": new_policy.id}

@app.delete("/policies/{policy_id}")
async def delete_policy(
    policy_id: int,
    db: AsyncSession = Depends(get_db),
    x_user_email: str = Header(..., alias="X-User-Email")
):
    from db_models import Policy
    await db.execute(update(Policy).where(Policy.id == policy_id).values(is_active=False)) # Soft delete
    await db.commit()
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
