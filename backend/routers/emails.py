from fastapi import APIRouter, HTTPException, Depends, Header, BackgroundTasks
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
import json
import logging
import uuid
from datetime import datetime

from models import EmailMessage, IntentAnalysis, CustomReplyRequest
from pydantic import BaseModel
from typing import Optional
from intents import IntentEngine
from memory import RelationshipMemory
from database import get_db, AsyncSessionLocal
from db_models import User, Policy, AnalysisTask
from gmail_service import GmailService
from encryption import get_encryption_service
from dependencies import get_current_user, verify_user

router = APIRouter(tags=["emails"])
logger = logging.getLogger(__name__)
relationship_memory = RelationshipMemory()

@router.get("/debug/token")
async def debug_token(
    authorization: str = Header(...),
    x_user_email: str = Header(..., alias="X-User-Email")
):
    """Debug endpoint to check token validity and user info."""
    if not authorization.startswith("Bearer "):
        return {"error": "Invalid header", "header": authorization[:20] + "..." if authorization else "None"}
    
    token = authorization.split(" ")[1]
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {token}"}
            )
            return {
                "status_code": response.status_code,
                "userinfo": response.json() if response.status_code == 200 else response.text,
                "requested_email": x_user_email,
                "token_preview": token[:10] + "..." + token[-10:] if len(token) > 20 else "short"
            }
    except Exception as e:
        return {"error": str(e)}

class ReplyRequest(BaseModel):
    thread_id: str
    recipient: str
    subject: str
    body: str
    email_id: Optional[str] = None
    in_reply_to: Optional[str] = None
    references: Optional[str] = None

@router.get("/emails")
async def get_emails(
    authorization: str = Header(...),
    verified_email: str = Depends(verify_user)
):
    """Fetch latest emails from Gmail inbox."""
    print(f"\n>>> GET /emails called for: {verified_email}")
    token = authorization.split(" ")[1]
    try:
        gmail = GmailService(token)
        emails = await gmail.fetch_latest_emails()
        print(f">>> Found {len(emails)} emails for {verified_email}")
        return emails
    except httpx.HTTPStatusError as e:
        status_code = e.response.status_code
        detail = "invalid_token" if status_code == 401 else str(e)
        logger.error(f"Gmail API error for {verified_email}: {status_code} - {detail}")
        raise HTTPException(status_code=status_code, detail=detail)
    except Exception as e:
        print(f">>> ERROR in get_emails: {str(e)}")
        logger.error(f"Error in get_emails for {verified_email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch emails from Gmail")

@router.get("/emails/sent")
async def get_sent_emails(
    authorization: str = Header(...),
    verified_email: str = Depends(verify_user)
):
    """Fetch sent emails from Gmail."""
    token = authorization.split(" ")[1]
    try:
        gmail = GmailService(token)
        emails = await gmail.fetch_sent_emails()
        return emails
    except httpx.HTTPStatusError as e:
        status_code = e.response.status_code
        detail = "invalid_token" if status_code == 401 else str(e)
        raise HTTPException(status_code=status_code, detail=detail)
    except Exception as e:
        logger.error(f"Error in get_sent_emails for {verified_email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch sent emails")

@router.get("/emails/drafts")
async def get_draft_emails(
    authorization: str = Header(...),
    verified_email: str = Depends(verify_user)
):
    """Fetch draft emails from Gmail."""
    token = authorization.split(" ")[1]
    try:
        gmail = GmailService(token)
        emails = await gmail.fetch_draft_emails()
        return emails
    except httpx.HTTPStatusError as e:
        status_code = e.response.status_code
        detail = "invalid_token" if status_code == 401 else str(e)
        raise HTTPException(status_code=status_code, detail=detail)
    except Exception as e:
        logger.error(f"Error in get_draft_emails for {verified_email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch draft emails")

async def _run_ai_analysis_task(
    task_id: str,
    email: EmailMessage,
    user_id: int,
    auth_token: str
):
    """Background task to run AI analysis and store results."""
    async with AsyncSessionLocal() as db:
        try:
            # 1. Fetch User
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            if not user:
                logger.error(f"Task {task_id}: User {user_id} not found")
                return

            await db.execute(
                update(AnalysisTask)
                .where(AnalysisTask.id == task_id)
                .values(status='processing')
            )
            await db.commit()

            # 2. Prepare AI Engine Settings
            provider = user.ai_provider or 'openai'
            api_key = None
            if user.api_key:
                encryption_service = get_encryption_service()
                api_key = encryption_service.decrypt(user.api_key)
            
            engine = IntentEngine(provider=provider, api_key=api_key)

            # 3. Fetch Context (Personality, Relationships, Policies)
            user_personality = user.personality_type or "general"
            raw_context = user.personality_context
            user_context = ""
            if raw_context:
                try:
                    contexts = json.loads(raw_context)
                    if isinstance(contexts, dict):
                        user_context = contexts.get(user_personality, "")
                    else:
                        user_context = str(raw_context)
                except json.JSONDecodeError:
                    user_context = raw_context
            
            rel_data = await relationship_memory.get_relationship(db, user.email, email.from_email)
            relationship_context = json.dumps(rel_data, default=str)
            
            pol_result = await db.execute(select(Policy).where(Policy.user_id == user.id, Policy.is_active == True))
            policies = [{
                "title": p.title, "description": p.description, "policy_type": p.policy_type,
                "scope": p.scope, "action_constraint": p.action_constraint, "severity": p.severity,
                "priority": p.priority, "conditions": p.conditions
            } for p in pol_result.scalars().all()]

            # 4. Fetch Thread History
            thread_history = ""
            if email.thread_id:
                try:
                    gmail = GmailService(auth_token)
                    thread_msgs = await gmail.get_email_thread(email.thread_id)
                    history_blocks = [
                        f"FROM: {m['from']}\nDATE: {m['date']}\nMESSAGE: {m['body']}"
                        for m in thread_msgs if m['id'] != email.message_id
                    ]
                    thread_history = "\n---\n".join(history_blocks) or "(Initial message)"
                except Exception as e:
                    logger.warning(f"Task {task_id}: Failed thread fetch: {e}")

            # 5. Run Analysis
            analysis = engine.analyze_email(
                email, thread_history, relationship_context,
                personality_type=user_personality, personality_context=user_context, policies=policies
            )
            
            # 6. Guardrails
            if email.from_email:
                u_domain = user.email.split('@')[-1]
                s_domain = email.from_email.split('@')[-1]
                if u_domain == s_domain and analysis.primary_action_id in ['ignore', 'do_nothing']:
                    archive_rec = next((r for r in analysis.recommendations if r.action_type == 'archive'), None)
                    if archive_rec:
                        analysis.primary_action_id = archive_rec.id

            # 7. Update Relationship Memory
            await relationship_memory.update_relationship(db, user.email, email.from_email, {"type": "received"})

            # 8. Complete Task
            await db.execute(
                update(AnalysisTask)
                .where(AnalysisTask.id == task_id)
                .values(
                    status='completed',
                    result=analysis.model_dump(),
                    completed_at=datetime.now()
                )
            )
            await db.commit()

        except Exception as e:
            logger.exception(f"Task {task_id} failed: {e}")
            await db.execute(
                update(AnalysisTask)
                .where(AnalysisTask.id == task_id)
                .values(status='failed', error=str(e))
            )
            await db.commit()

@router.post("/analyze")
async def analyze_email(
    email: EmailMessage,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    authorization: str = Header(...)
):
    """Start an email analysis task in the background."""
    task_id = str(uuid.uuid4())
    token = authorization.split(" ")[1]
    
    new_task = AnalysisTask(
        id=task_id,
        user_id=user.id,
        email_id=email.message_id,
        status='pending'
    )
    db.add(new_task)
    await db.commit()
    
    background_tasks.add_task(_run_ai_analysis_task, task_id, email, user.id, token)
    
    return {"task_id": task_id, "status": "pending"}

@router.get("/tasks/{task_id}")
async def get_task_status(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Check the status and get results of an analysis task."""
    result = await db.execute(
        select(AnalysisTask).where(AnalysisTask.id == task_id, AnalysisTask.user_id == user.id)
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    return {
        "id": task.id,
        "status": task.status,
        "result": task.result,
        "error": task.error,
        "created_at": task.created_at,
        "completed_at": task.completed_at
    }

@router.post("/generate-custom")
async def generate_custom_reply(
    request: CustomReplyRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Generate a custom reply based on user instruction."""
    try:
        provider = user.ai_provider or 'openai'
        api_key = None
        
        if user.api_key:
            encryption_service = get_encryption_service()
            api_key = encryption_service.decrypt(user.api_key)
        
        engine = IntentEngine(provider=provider, api_key=api_key)
        reply = engine.generate_custom_reply(request)
        return {"reply": reply}
    except Exception as e:
        logger.error(f"Failed to generate custom reply: {e}")
        raise HTTPException(status_code=500, detail="Reply generation failed")

@router.get("/thread/{thread_id}")
async def get_thread(
    thread_id: str,
    authorization: str = Header(...),
    verified_email: str = Depends(verify_user)
):
    """Fetch all messages in a thread."""
    token = authorization.split(" ")[1]
    try:
        gmail = GmailService(token)
        messages = await gmail.get_email_thread(thread_id)
        return messages
    except httpx.HTTPStatusError as e:
        status_code = e.response.status_code
        detail = "invalid_token" if status_code == 401 else str(e)
        logger.error(f"Gmail API error for {verified_email}: {status_code} - {detail}")
        raise HTTPException(status_code=status_code, detail=detail)
    except Exception as e:
        logger.error(f"Failed to fetch thread {thread_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch thread")

@router.post("/reply")
async def send_direct_reply(
    data: ReplyRequest,
    user: User = Depends(get_current_user),
    authorization: str = Header(...)
):
    """Send a direct reply via owner's Gmail."""
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
        
        # Mark as read
        if data.email_id:
            await gmail.mark_as_read(data.email_id)

        return {"status": "success", "message_id": message_id}
    except httpx.HTTPStatusError as e:
        status_code = e.response.status_code
        detail = "invalid_token" if status_code == 401 else str(e)
        raise HTTPException(status_code=status_code, detail=detail)
    except Exception as e:
        logger.error(f"Failed to send direct reply for {user.email}: {e}")
        raise HTTPException(status_code=500, detail="Failed to send reply")

@router.get("/attachments/{message_id}/{attachment_id}")
async def download_attachment(
    message_id: str,
    attachment_id: str,
    authorization: str = Header(...),
    verified_email: str = Depends(verify_user)
):
    """Download an attachment from Gmail."""
    token = authorization.split(" ")[1]
    try:
        gmail = GmailService(token)
        attachment_data = await gmail.get_attachment(message_id, attachment_id)
        
        import base64
        return {
            "data": base64.b64encode(attachment_data).decode(),
            "size": len(attachment_data)
        }
    except httpx.HTTPStatusError as e:
        status_code = e.response.status_code
        detail = "invalid_token" if status_code == 401 else str(e)
        raise HTTPException(status_code=status_code, detail=detail)
    except Exception as e:
        logger.error(f"Failed to download attachment for {verified_email}: {e}")
        raise HTTPException(status_code=500, detail="Attachment download failed")
