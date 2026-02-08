from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, desc
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from database import get_db
from db_models import User, Notification
from dependencies import get_current_user

router = APIRouter(tags=["notifications"])

class NotificationSchema(BaseModel):
    id: int
    type: str
    message: str
    read: bool
    target_view: Optional[str] = None
    target_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/notifications", response_model=List[NotificationSchema])
async def get_notifications(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = select(Notification).where(
        Notification.user_id == user.id
    ).order_by(desc(Notification.created_at)).limit(limit)
    
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = select(Notification).where(
        Notification.id == notification_id,
        Notification.user_id == user.id
    )
    result = await db.execute(query)
    notification = result.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notification.read = True
    await db.commit()
    return {"status": "success"}

@router.post("/notifications/read-all")
async def mark_all_read(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    await db.execute(
        update(Notification)
        .where(Notification.user_id == user.id, Notification.read == False)
        .values(read=True)
    )
    await db.commit()
    return {"status": "success"}
