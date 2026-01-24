from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from db_models import User, Decision, Correction, UserMetric
from models import ActionRecommendation, UserCorrection
from datetime import datetime
from typing import Dict, Any

class PersonalMemory:
    async def get_or_create_user(self, db: AsyncSession, email: str):
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user:
            user = User(email=email, full_name=email.split('@')[0])
            db.add(user)
            await db.commit()
            await db.refresh(user)
            
            # Init metrics
            metrics = UserMetric(user_id=user.id)
            db.add(metrics)
            await db.commit()
        return user

    async def log_decision(self, db: AsyncSession, user_email: str, email_id: str, rec: ActionRecommendation):
        user = await self.get_or_create_user(db, user_email)
        decision = Decision(
            user_id=user.id,
            email_id=email_id,
            subject="Email Action", # In production, fetch subject from Gmail
            action_type=rec.action_type,
            action_description=rec.action_label,
            predicted_outcome=rec.predicted_outcome,
            is_shadow=True
        )
        db.add(decision)
        
        # Update metrics
        result = await db.execute(select(UserMetric).where(UserMetric.user_id == user.id))
        metrics = result.scalar_one_or_none()
        if metrics:
            metrics.total_decisions += 1
            metrics.time_saved_minutes += 2 # Simplified
            # Recalculate accuracy
            total = metrics.total_decisions
            if total > 0:
                metrics.accuracy = max(0.0, (total - metrics.total_corrections) / total)
            
        await db.commit()

    async def log_correction(self, db: AsyncSession, user_email: str, correction: UserCorrection):
        user = await self.get_or_create_user(db, user_email)
        db_correction = Correction(
            user_id=user.id,
            email_id=correction.message_id,
            field="draft",
            original_value=correction.original_draft,
            corrected_value=correction.edited_draft
        )
        db.add(db_correction)
        
        # Update metrics
        result = await db.execute(select(UserMetric).where(UserMetric.user_id == user.id))
        metrics = result.scalar_one_or_none()
        if metrics:
            metrics.total_corrections += 1
            total = metrics.total_decisions
            if total > 0:
                metrics.accuracy = max(0.0, (total - metrics.total_corrections) / total)
            else:
                metrics.accuracy = 0.0
                
        await db.commit()

    async def get_user_patterns(self, db: AsyncSession, user_email: str) -> Dict[str, Any]:
        user = await self.get_or_create_user(db, user_email)
        
        # 1. Fetch Basic Metrics
        result = await db.execute(select(UserMetric).where(UserMetric.user_id == user.id))
        metrics = result.scalar_one_or_none()
        
        total_decisions = getattr(metrics, 'total_decisions', 0) or 0
        minutes_saved = getattr(metrics, 'time_saved_minutes', 0) or 0
        accuracy = getattr(metrics, 'accuracy', 1.0) or 1.0

        # 2. Calculate Velocity (Last 7 Days)
        from datetime import timedelta
        end_date = datetime.now()
        start_date = end_date - timedelta(days=6)
        
        # Initialize dictionary for last 7 days with 0
        velocity_map = {(start_date + timedelta(days=i)).strftime('%Y-%m-%d'): 0 for i in range(7)}
        
        # Query DB for counts by date
        v_result = await db.execute(
            select(
                func.date(Decision.timestamp).label('date'),
                func.count(Decision.id)
            )
            .where(Decision.user_id == user.id)
            .where(Decision.timestamp >= start_date)
            .group_by(func.date(Decision.timestamp))
        )
        
        # Fill in actual data
        for row in v_result.all():
            # SQLite returns strings for dates, Postgres might return date objects
            date_str = str(row[0]) 
            if date_str in velocity_map:
                velocity_map[date_str] = row[1]
                
        velocity_data = list(velocity_map.values())

        # 3. Find Top Category (Partnership, etc.)
        t_result = await db.execute(
            select(Decision.action_description, func.count(Decision.id).label('count'))
            .where(Decision.user_id == user.id)
            .group_by(Decision.action_description)
            .order_by(func.count(Decision.id).desc())
            .limit(1)
        )
        top_cat_row = t_result.one_or_none()
        top_category = top_cat_row[0] if top_cat_row else "General Communication"
        
        # 4. Detailed Accuracy Breakdown (Derived from real accuracy)
        # We simulate slight variance for realism until we track granular field-level accuracy
        return {
            "total_decisions": total_decisions,
            "minutes_saved": minutes_saved,
            "accuracy": accuracy,
            "velocity": velocity_data,
            "top_category": top_category
        }

    async def get_user_history(self, db: AsyncSession, user_email: str) -> list[Dict[str, Any]]:
        user = await self.get_or_create_user(db, user_email)
        
        # Fetch Decisions
        d_result = await db.execute(
            select(Decision)
            .where(Decision.user_id == user.id)
            .order_by(Decision.timestamp.desc())
            .limit(10)
        )
        decisions = d_result.scalars().all()
        
        # Fetch Corrections
        c_result = await db.execute(
            select(Correction)
            .where(Correction.user_id == user.id)
            .order_by(Correction.timestamp.desc())
            .limit(10)
        )
        corrections = c_result.scalars().all()
        
        history = []
        for d in decisions:
            history.append({
                "id": f"decision_{d.id}",
                "type": "decision",
                "title": d.action_description,
                "target": d.subject or "Unknown Recipient",
                "outcome": d.predicted_outcome,
                "timestamp": d.timestamp.isoformat() if d.timestamp else datetime.now().isoformat(),
                "category": "Work" # Refine later with actual category
            })
            
        for c in corrections:
            history.append({
                "id": f"correction_{c.id}",
                "type": "correction",
                "title": "Tone Adjustment", # Infer from field
                "target": "Draft Revision",
                "original": c.original_value,
                "edited": c.corrected_value,
                "timestamp": c.timestamp.isoformat() if c.timestamp else datetime.now().isoformat(),
                "category": "Quality"
            })
            
        # Sort combined list by timestamp desc
        history.sort(key=lambda x: x['timestamp'], reverse=True)
        return history[:20]
