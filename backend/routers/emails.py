from fastapi import APIRouter, HTTPException, Depends, Header, BackgroundTasks
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
import json
import logging
import uuid
from datetime import datetime

from models import EmailMessage, IntentAnalysis, CustomReplyRequest, EmailScheduleRequest
from pydantic import BaseModel
from typing import Optional
from intents import IntentEngine
from memory import RelationshipMemory, PersonalMemory
from database import get_db, AsyncSessionLocal
from db_models import User, Policy, AnalysisTask, ScheduledEmail, Decision
from gmail_service import GmailService
from encryption import get_encryption_service
from dependencies import get_current_user, verify_user

router = APIRouter(tags=["emails"])
logger = logging.getLogger(__name__)
relationship_memory = RelationshipMemory()
personal_memory = PersonalMemory()

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
    token = authorization.split(" ")[1]
    try:
        gmail = GmailService(token)
        emails = await gmail.fetch_latest_emails()
        logger.info(f"Found {len(emails)} emails for {verified_email}")
        return emails
    except httpx.HTTPStatusError as e:
        status_code = e.response.status_code
        detail = "invalid_token" if status_code == 401 else str(e)
        logger.error(f"Gmail API error for {verified_email}: {status_code} - {detail}")
        raise HTTPException(status_code=status_code, detail=detail)
    except Exception as e:
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

@router.get("/emails/spam")
async def get_spam_emails(
    authorization: str = Header(...),
    verified_email: str = Depends(verify_user)
):
    """Fetch spam emails from Gmail."""
    token = authorization.split(" ")[1]
    try:
        gmail = GmailService(token)
        emails = await gmail.fetch_spam_emails()
        return emails
    except httpx.HTTPStatusError as e:
        status_code = e.response.status_code
        detail = "invalid_token" if status_code == 401 else str(e)
        raise HTTPException(status_code=status_code, detail=detail)
    except Exception as e:
        logger.error(f"Error in get_spam_emails for {verified_email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch spam emails")

@router.get("/emails/trash")
async def get_trash_emails(
    authorization: str = Header(...),
    verified_email: str = Depends(verify_user)
):
    """Fetch trash emails from Gmail."""
    token = authorization.split(" ")[1]
    try:
        gmail = GmailService(token)
        emails = await gmail.fetch_trash_emails()
        return emails
    except httpx.HTTPStatusError as e:
        status_code = e.response.status_code
        detail = "invalid_token" if status_code == 401 else str(e)
        raise HTTPException(status_code=status_code, detail=detail)
    except Exception as e:
        logger.error(f"Error in get_trash_emails for {verified_email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch trash emails")

@router.get("/emails/starred")
async def get_starred_emails(
    authorization: str = Header(...),
    verified_email: str = Depends(verify_user)
):
    """Fetch starred emails from Gmail."""
    token = authorization.split(" ")[1]
    try:
        gmail = GmailService(token)
        emails = await gmail.fetch_starred_emails()
        return emails
    except httpx.HTTPStatusError as e:
        status_code = e.response.status_code
        detail = "invalid_token" if status_code == 401 else str(e)
        raise HTTPException(status_code=status_code, detail=detail)
    except Exception as e:
        logger.error(f"Error in get_starred_emails for {verified_email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch starred emails")

@router.get("/emails/snoozed")
async def get_snoozed_emails(
    authorization: str = Header(...),
    verified_email: str = Depends(verify_user)
):
    """Fetch snoozed emails from Gmail."""
    token = authorization.split(" ")[1]
    try:
        gmail = GmailService(token)
        emails = await gmail.fetch_snoozed_emails()
        return emails
    except httpx.HTTPStatusError as e:
        status_code = e.response.status_code
        detail = "invalid_token" if status_code == 401 else str(e)
        raise HTTPException(status_code=status_code, detail=detail)
    except Exception as e:
        logger.error(f"Error in get_snoozed_emails for {verified_email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch snoozed emails")

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
            if user.api_key_encrypted:
                encryption_service = get_encryption_service()
                api_key = encryption_service.decrypt(user.api_key_encrypted)
            
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
        
        if user.api_key_encrypted:
            encryption_service = get_encryption_service()
            api_key = encryption_service.decrypt(user.api_key_encrypted)
        
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
    db: AsyncSession = Depends(get_db),
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

        # Log decision for analytics
        from models import ActionRecommendation, ScoreBreakdown
        fake_rec = ActionRecommendation(
            id=f"direct_reply_{uuid.uuid4()}",
            action_type="reply",
            action_label="Direct Reply Sent",
            predicted_outcome="Email dispatched to recipient",
            why_recommendation="User initiated direct reply",
            decision_rationale="Manual reply sent via dashboard",
            score_breakdown=ScoreBreakdown(urgency=50, importance=50, risk=0, opportunity=50),
            prediction_confidence=1.0
        )
        await personal_memory.log_decision(db, user.email, data.email_id or f"manual_{uuid.uuid4()}", fake_rec)

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

@router.post("/emails/schedule")
async def schedule_email(
    request: EmailScheduleRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Schedule an email to be sent later."""
    try:
        logger.info(f"Scheduling email for {user.email}: scheduled_time={request.scheduled_time} (type: {type(request.scheduled_time)})")
        
        new_scheduled = ScheduledEmail(
            user_id=user.id,
            recipient=request.recipient,
            subject=request.subject,
            body=request.body,
            scheduled_time=request.scheduled_time,
            thread_id=request.thread_id,
            in_reply_to=request.in_reply_to,
            references=request.references,
            status='pending'
        )
        db.add(new_scheduled)
        await db.commit()
        await db.refresh(new_scheduled)
        
        logger.info(f"✓ Email scheduled with ID {new_scheduled.id}, stored time: {new_scheduled.scheduled_time}")
        
        # Log preliminary decision (optional, maybe wait until sent?)
        # Let's log it now as 'Scheduled' so the user sees immediate impact on analytics
        from models import ActionRecommendation, ScoreBreakdown
        fake_rec = ActionRecommendation(
            id=f"schedule_{new_scheduled.id}",
            action_type="reply", # Scheduling a reply is essentially a 'reply' action
            action_label="Email Scheduled",
            predicted_outcome="Email will be sent at scheduled time",
            why_recommendation="User scheduled a future send",
            decision_rationale="Planning future communication",
            score_breakdown=ScoreBreakdown(urgency=100, importance=50, risk=0, opportunity=50),
            prediction_confidence=1.0
        )
        await personal_memory.log_decision(db, user.email, f"sched_{new_scheduled.id}", fake_rec)

        return {"status": "success", "id": new_scheduled.id}
    except Exception as e:
        logger.error(f"Failed to schedule email for {user.email}: {e}")
        raise HTTPException(status_code=500, detail="Failed to schedule email")

@router.get("/emails/scheduled")
async def get_scheduled_emails(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Get all pending scheduled emails."""
    try:
        result = await db.execute(
            select(ScheduledEmail).where(
                ScheduledEmail.user_id == user.id
            ).order_by(ScheduledEmail.scheduled_time.desc())
        )
        emails = result.scalars().all()
        
        # Convert to dict with proper timezone handling
        from datetime import timezone
        
        response_data = []
        for e in emails:
            # Ensure timezone-aware datetime
            scheduled_dt = e.scheduled_time
            if scheduled_dt and scheduled_dt.tzinfo is None:
                # If naive, assume UTC
                scheduled_dt = scheduled_dt.replace(tzinfo=timezone.utc)
            
            created_dt = e.created_at
            if created_dt and created_dt.tzinfo is None:
                created_dt = created_dt.replace(tzinfo=timezone.utc)
            
            logger.info(f"Returning scheduled email {e.id}: scheduled_time={scheduled_dt.isoformat() if scheduled_dt else None}")
            
            response_data.append({
                "id": e.id,
                "recipient": e.recipient,
                "subject": e.subject,
                "body": e.body,
                "scheduled_time": scheduled_dt.isoformat() if scheduled_dt else None,
                "thread_id": e.thread_id,
                "in_reply_to": e.in_reply_to,
                "references": e.references,
                "status": e.status,
                "error": e.error,
                "created_at": created_dt.isoformat() if created_dt else None
            })
        
        return response_data
    except Exception as e:
        logger.error(f"Failed to fetch scheduled emails for {user.email}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch scheduled emails")

@router.delete("/emails/scheduled/{scheduled_id}")
async def cancel_scheduled_email(
    scheduled_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Cancel a scheduled email."""
    try:
        result = await db.execute(
            update(ScheduledEmail)
            .where(ScheduledEmail.id == scheduled_id, ScheduledEmail.user_id == user.id)
            .values(status='cancelled')
        )
        await db.commit()
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Failed to cancel scheduled email {scheduled_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to cancel scheduled email")

class UpdateScheduledEmailRequest(BaseModel):
    scheduled_time: datetime

@router.put("/emails/scheduled/{scheduled_id}")
async def update_scheduled_email(
    scheduled_id: int,
    request: UpdateScheduledEmailRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Update/reschedule a scheduled email."""
    try:
        # First verify the email exists and belongs to the user
        # Removed status check to allow rescheduling of any email
        result = await db.execute(
            select(ScheduledEmail).where(
                ScheduledEmail.id == scheduled_id,
                ScheduledEmail.user_id == user.id
            )
        )
        scheduled_email = result.scalar_one_or_none()
        
        if not scheduled_email:
            logger.error(f"Scheduled email {scheduled_id} not found for user {user.email}")
            raise HTTPException(status_code=404, detail="Scheduled email not found")
        
        # Log current and new times for debugging
        logger.info(f"Rescheduling email {scheduled_id}: current_time={scheduled_email.scheduled_time}, new_time={request.scheduled_time}, current_status={scheduled_email.status}")
        
        # Update the scheduled time and reset status to pending if it was cancelled/failed
        update_values = {"scheduled_time": request.scheduled_time}
        if scheduled_email.status in ['cancelled', 'failed', 'sent']:
            update_values["status"] = "pending"
            update_values["error"] = None
            logger.info(f"Resetting status from {scheduled_email.status} to pending")
        
        await db.execute(
            update(ScheduledEmail)
            .where(ScheduledEmail.id == scheduled_id, ScheduledEmail.user_id == user.id)
            .values(**update_values)
        )
        await db.commit()
        
        logger.info(f"✓ Rescheduled email {scheduled_id} to {request.scheduled_time} for user {user.email}")
        return {"status": "success", "scheduled_time": request.scheduled_time}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update scheduled email {scheduled_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update scheduled email")
