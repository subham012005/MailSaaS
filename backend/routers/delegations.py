from fastapi import APIRouter, HTTPException, Depends, Header
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
import logging
from datetime import datetime, timedelta
import re

from models import (
    DelegationCreate, DraftSubmit, RequestChanges, 
    SendOption, ApproveDelegationRequest, UnifiedSendRequest,
    InstructionAddRequest
)
from database import get_db
from db_models import User, Delegation
from gmail_service import GmailService
from dependencies import get_current_user

router = APIRouter(tags=["delegations"])
logger = logging.getLogger(__name__)

@router.post("/delegate")
async def create_delegation(
    data: DelegationCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    authorization: str = Header(...)
):
    """Create a new delegation and notify the delegate via Gmail."""
    token = authorization.split(" ")[1]
    thread_history_data = []
    
    try:
        gmail = GmailService(token)
        # Fetch full thread context for the delegate
        if data.thread_id:
            thread_history_data = await gmail.get_email_thread(data.thread_id)
            
            # Auto-mark as read
            await gmail.mark_as_read(data.email_id)
            
            # Send notification email to delegate
            await gmail.send_delegation_report(
                recipient=data.delegate_email,
                original_from=data.original_from,
                original_subject=data.original_subject,
                original_body=data.original_body,
                intel_report=data.intel_report,
                user_instructions=data.expected_action,
                thread_history=thread_history_data
            )
    except Exception as e:
        logger.error(f"Gmail sync failed during delegation: {e}")
        # We continue even if Gmail notification fails, but log it
    
    deadline = datetime.now() + timedelta(hours=data.sla_hours)
    history = [{
        "text": data.expected_action,
        "timestamp": datetime.now().isoformat(),
        "type": "initial"
    }]
    
    new_del = Delegation(
        user_id=user.id,
        email_id=data.email_id,
        thread_id=data.thread_id,
        original_subject=data.original_subject,
        original_sender=data.original_from,
        delegate_email=data.delegate_email,
        expected_action=data.expected_action,
        thread_context=thread_history_data,
        instruction_history=history,
        sla_deadline=deadline,
        last_instruction_at=datetime.now()
    )
    db.add(new_del)
    await db.commit()
    return {"status": "success", "id": new_del.id}

@router.get("/delegations")
async def get_delegations(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Fetch all delegations belonging to the user."""
    logger.info(f"Fetching delegations for owner: {user.email} (ID: {user.id})")
    res = await db.execute(select(Delegation).where(Delegation.user_id == user.id))
    results = res.scalars().all()
    logger.info(f"Found {len(results)} delegations owned by {user.email}")
    return results

@router.get("/delegations/assigned")
async def get_assigned_delegations(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Fetch delegations assigned TO the current user."""
    logger.info(f"Fetching assignments for delegate: {user.email}")
    res = await db.execute(select(Delegation).where(Delegation.delegate_email == user.email))
    results = res.scalars().all()
    logger.info(f"Found {len(results)} assignments for {user.email}")
    return results

@router.post("/delegations/{delegation_id}/approve")
async def approve_delegation(
    delegation_id: int,
    data: ApproveDelegationRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    authorization: str = Header(...)
):
    """Approve a draft and send it via the owner's Gmail."""
    result = await db.execute(
        select(Delegation).where(and_(Delegation.id == delegation_id, Delegation.user_id == user.id))
    )
    delegation = result.scalar_one_or_none()
    
    if not delegation:
        raise HTTPException(status_code=404, detail="Delegation not found or unauthorized")
    
    if not delegation.reply_draft:
        raise HTTPException(status_code=400, detail="No draft to approve")

    token = authorization.split(" ")[1]
    try:
        gmail = GmailService(token)
        thread_messages = await gmail.get_email_thread(delegation.thread_id)
        
        # Determine recipient
        original_sender = thread_messages[0]['from']
        email_match = re.search(r'[\w\.-]+@[\w\.-]+', original_sender)
        recipient = email_match.group(0) if email_match else original_sender

        if data.send_mode == 'thread':
            latest_msg = thread_messages[-1]
            await gmail.reply_to_thread(
                thread_id=delegation.thread_id,
                recipient=recipient,
                subject=delegation.original_subject,
                body_text=delegation.reply_draft,
                in_reply_to=latest_msg.get('message_id_header'),
                references=latest_msg.get('references', '')
            )
        else:
            await gmail.send_email(
                recipient=recipient,
                subject=f"Re: {delegation.original_subject}",
                body_text=delegation.reply_draft
            )
        
        delegation.status = 'sent'
        await db.commit()
        return {"status": "success"}
    except httpx.HTTPStatusError as e:
        status_code = e.response.status_code
        detail = "invalid_token" if status_code == 401 else str(e)
        logger.error(f"Gmail API error during approval for {user.email}: {status_code} - {detail}")
        raise HTTPException(status_code=status_code, detail=detail)
    except Exception as e:
        logger.error(f"Approval send failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to send email via Gmail")

@router.get("/delegates/recent")
async def get_recent_delegates(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Fetch distinct contacts recently delegated to."""
    res = await db.execute(
        select(Delegation.delegate_email)
        .where(Delegation.user_id == user.id)
        .distinct()
        .limit(10)
    )
    return [r[0] for r in res.all()]

@router.delete("/delegations/{delegation_id}")
async def delete_delegation(
    delegation_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Delete or cancel a delegation."""
    result = await db.execute(select(Delegation).where(Delegation.id == delegation_id))
    delegation = result.scalar_one_or_none()
    
    if not delegation:
        raise HTTPException(status_code=404, detail="Delegation not found")
    
    if delegation.user_id == user.id or delegation.delegate_email == user.email:
        await db.delete(delegation)
        await db.commit()
        return {"status": "success"}
        

@router.post("/delegations/{delegation_id}/submit-draft")
async def submit_delegation_draft(
    delegation_id: int,
    data: DraftSubmit,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Delegate submits a draft for approval."""
    result = await db.execute(select(Delegation).where(Delegation.id == delegation_id))
    delegation = result.scalar_one_or_none()
    
    if not delegation or delegation.delegate_email != user.email:
        raise HTTPException(status_code=404, detail="Delegation not found or unauthorized")
        
    delegation.reply_draft = data.reply_draft
    delegation.status = 'awaiting_approval'
    await db.commit()
    return {"status": "success"}

@router.post("/delegations/{delegation_id}/request-changes")
async def request_delegation_changes(
    delegation_id: int,
    data: RequestChanges,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Owner requests changes to a submitted draft."""
    result = await db.execute(select(Delegation).where(Delegation.id == delegation_id))
    delegation = result.scalar_one_or_none()
    
    if not delegation or delegation.user_id != user.id:
        raise HTTPException(status_code=404, detail="Delegation not found or unauthorized")
        
    delegation.feedback = data.feedback
    delegation.status = 'needs_changes'
    await db.commit()
    return {"status": "success"}

@router.post("/delegations/{delegation_id}/send")
async def delegation_unified_send(
    delegation_id: int,
    data: UnifiedSendRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    authorization: str = Header(...)
):
    """Handle both direct send (by delegate) and submission for approval."""
    result = await db.execute(select(Delegation).where(Delegation.id == delegation_id))
    delegation = result.scalar_one_or_none()
    
    if not delegation or delegation.delegate_email != user.email:
        raise HTTPException(status_code=404, detail="Delegation not found or unauthorized")

    delegation.reply_draft = data.reply_draft
    # delegation.send_mode = data.send_mode # If db model supports it

    if data.approval_required:
        delegation.status = 'awaiting_approval'
        await db.commit()
        return {"status": "success", "mode": "submitted_for_approval"}
    else:
        token = authorization.split(" ")[1]
        try:
            gmail = GmailService(token)
            await gmail.send_email(
                recipient=delegation.original_sender,
                subject=f"Re: {delegation.original_subject}",
                body_text=data.reply_draft
            )
            delegation.status = 'sent'
            await db.commit()
            return {"status": "success", "mode": "sent_directly"}
        except httpx.HTTPStatusError as e:
            status_code = e.response.status_code
            detail = "invalid_token" if status_code == 401 else str(e)
            logger.error(f"Gmail API error during direct send for {user.email}: {status_code} - {detail}")
            raise HTTPException(status_code=status_code, detail=detail)
        except Exception as e:
            logger.error(f"Direct send failed: {e}")
            raise HTTPException(status_code=500, detail="Failed to send email")

@router.post("/delegations/{delegation_id}/instructions")
async def add_delegation_instruction(
    delegation_id: int,
    data: InstructionAddRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Owner adds more instructions to an active delegation."""
    result = await db.execute(select(Delegation).where(Delegation.id == delegation_id))
    delegation = result.scalar_one_or_none()
    
    if not delegation or delegation.user_id != user.id:
        raise HTTPException(status_code=404, detail="Delegation not found or unauthorized")
        
    history = list(delegation.instruction_history or [])
    history.append({
        "text": data.instruction,
        "timestamp": datetime.now().isoformat(),
        "type": "follow-up"
    })
    
    delegation.instruction_history = history
    delegation.expected_action = data.instruction
    if data.sla_hours:
        delegation.sla_deadline = datetime.now() + timedelta(hours=data.sla_hours)
    
    delegation.last_instruction_at = datetime.now()
    if delegation.status == 'needs_changes':
        delegation.status = 'pending'
        
    await db.commit()
    return {"status": "success"}
