from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
import logging

from database import get_db
from db_models import User, Policy
from dependencies import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/policies", tags=["governance"])
logger = logging.getLogger(__name__)

class PolicyCreate(BaseModel):
    description: str

@router.get("")
async def get_policies(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    res = await db.execute(select(Policy).where(Policy.user_id == user.id))
    return res.scalars().all()

@router.post("")
async def create_policy(
    policy_data: PolicyCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    new_policy = Policy(user_id=user.id, description=policy_data.description)
    db.add(new_policy)
    await db.commit()
    return {"status": "success", "id": new_policy.id}

@router.delete("/{policy_id}")
async def delete_policy(
    policy_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Ensure the policy belongs to the user
    result = await db.execute(select(Policy).where(Policy.id == policy_id, Policy.user_id == user.id))
    policy = result.scalar_one_or_none()
    
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
        
    await db.execute(update(Policy).where(Policy.id == policy_id).values(is_active=False))
    await db.commit()
    return {"status": "success"}
