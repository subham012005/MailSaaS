from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging

from models import DecisionMetric, ActionRecommendation, UserCorrection
from db_models import User, CounterfactualLog
from database import get_db
from dependencies import get_current_user
from memory import PersonalMemory
from pydantic import BaseModel

router = APIRouter(tags=["metrics"])
logger = logging.getLogger(__name__)
memory = PersonalMemory()

class OverrideRequest(BaseModel):
    email_id: str
    ai_recommendation: dict
    user_action: str
    predicted_impact: dict

@router.get("/metrics", response_model=DecisionMetric)
async def get_metrics(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    patterns = await memory.get_user_patterns(db, user.email)
    return DecisionMetric(
        decisions_saved=patterns.get("total_decisions", 0),
        minutes_saved=patterns.get("minutes_saved", 0),
        consistency_score=patterns.get("accuracy", 1.0),
        rework_reduction=patterns.get("rework_reduction", 0.15),
        replies_prevented=patterns.get("replies_prevented", 0)
    )

@router.get("/history")
async def get_history(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    try:
        history = await memory.get_user_history(db, user.email)
        return history
    except Exception as e:
        logger.error(f"Error fetching history for {user.email}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve history")

@router.post("/decision")
async def log_decision(
    message_id: str, 
    action: ActionRecommendation, 
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    await memory.log_decision(db, user.email, message_id, action)
    return {"status": "success"}

@router.post("/correction")
async def log_correction(
    correction: UserCorrection, 
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    await memory.log_correction(db, user.email, correction)
    return {"status": "success"}

@router.post("/override")
async def log_override(
    data: OverrideRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
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

@router.get("/forecast")
async def get_load_forecast(user: User = Depends(get_current_user)):
    """Predict future inbox load (Placeholder intelligence)."""
    return {
        "trajectory": "stable",
        "tomorrow_expected_load": 12,
        "load_reduction_potential": 35,
        "weekly_volume_prediction": 85,
        "insight": "Current delegation rate is optimal for inbox health."
    }
