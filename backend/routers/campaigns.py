from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from pydantic import BaseModel
from database import get_db
from db_models import User, Campaign, SequenceStep, CampaignContact
from dependencies import get_current_user

router = APIRouter(prefix="/campaigns", tags=["campaigns"])

# Pydantic Models
class SequenceStepBase(BaseModel):
    step_number: int
    delay_days: int
    subject_template: str
    body_template: str

class CampaignCreate(BaseModel):
    name: str

class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None # draft, active, paused, completed

class ContactCreate(BaseModel):
    email: str
    name: Optional[str] = None
    company: Optional[str] = None

# Routes
@router.get("")
async def get_campaigns(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Campaign)
        .where(Campaign.user_id == user.id)
        .options(selectinload(Campaign.steps), selectinload(Campaign.contacts))
    )
    campaigns = result.scalars().all()
    
    response = []
    for c in campaigns:
        response.append({
            "id": c.id,
            "name": c.name,
            "status": c.status,
            "step_count": len(c.steps),
            "contact_count": len(c.contacts),
            "created_at": c.created_at
        })
    return response

@router.post("")
async def create_campaign(campaign: CampaignCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    new_campaign = Campaign(user_id=user.id, name=campaign.name)
    db.add(new_campaign)
    await db.commit()
    await db.refresh(new_campaign)
    return new_campaign

@router.get("/{campaign_id}")
async def get_campaign(campaign_id: int, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Campaign)
        .where(Campaign.id == campaign_id, Campaign.user_id == user.id)
        .options(selectinload(Campaign.steps), selectinload(Campaign.contacts))
    )
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    return {
        "id": campaign.id,
        "name": campaign.name,
        "status": campaign.status,
        "steps": [{"id": s.id, "step_number": s.step_number, "delay_days": s.delay_days, "subject_template": s.subject_template, "body_template": s.body_template} for s in campaign.steps],
        "contacts": [{"id": c.id, "email": c.email, "name": c.name, "company": c.company, "status": c.status, "current_step": c.current_step} for c in campaign.contacts],
        "created_at": campaign.created_at
    }

@router.put("/{campaign_id}")
async def update_campaign(campaign_id: int, update_data: CampaignUpdate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(Campaign).where(Campaign.id == campaign_id, Campaign.user_id == user.id))
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
        
    if update_data.name is not None:
        campaign.name = update_data.name
    if update_data.status is not None:
        campaign.status = update_data.status
        
    await db.commit()
    return {"message": "Campaign updated successfully"}

@router.post("/{campaign_id}/steps")
async def save_steps(campaign_id: int, steps: List[SequenceStepBase], db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    # Verify campaign exists and belongs to user
    result = await db.execute(select(Campaign).where(Campaign.id == campaign_id, Campaign.user_id == user.id))
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Delete existing steps and replace
    await db.execute(SequenceStep.__table__.delete().where(SequenceStep.campaign_id == campaign_id))
    
    for step_data in steps:
        new_step = SequenceStep(
            campaign_id=campaign_id,
            step_number=step_data.step_number,
            delay_days=step_data.delay_days,
            subject_template=step_data.subject_template,
            body_template=step_data.body_template
        )
        db.add(new_step)
        
    await db.commit()
    return {"message": "Steps saved successfully"}

@router.post("/{campaign_id}/contacts")
async def add_contacts(campaign_id: int, contacts: List[ContactCreate], db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    result = await db.execute(select(Campaign).where(Campaign.id == campaign_id, Campaign.user_id == user.id))
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    added_count = 0
    for contact_data in contacts:
        # Check if already exists in this campaign
        existing = await db.execute(select(CampaignContact).where(CampaignContact.campaign_id == campaign_id, CampaignContact.email == contact_data.email))
        if not existing.scalar_one_or_none():
            new_contact = CampaignContact(
                campaign_id=campaign_id,
                email=contact_data.email,
                name=contact_data.name,
                company=contact_data.company,
                status='active', # Start as active
                current_step=1
            )
            db.add(new_contact)
            added_count += 1
            
    await db.commit()
    return {"message": f"Added {added_count} new contacts"}
