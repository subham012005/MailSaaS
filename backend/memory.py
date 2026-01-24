from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from db_models import User, Decision, Correction, UserMetric, Relationship
from models import ActionRecommendation, UserCorrection
from datetime import datetime
from typing import Dict, Any

class RelationshipMemory:
    async def get_relationship(self, db: AsyncSession, user_email: str, sender_email: str) -> Dict[str, Any]:
        """Fetch relationship context for a specific sender."""
        # Get user
        result = await db.execute(select(User).where(User.email == user_email))
        user = result.scalar_one_or_none()
        if not user:
            return {}

        # Get relationship
        r_result = await db.execute(
            select(Relationship)
            .where(Relationship.user_id == user.id)
            .where(Relationship.email_address == sender_email)
        )
        relationship = r_result.scalar_one_or_none()
        
        if not relationship:
            return {
                "status": "New Connection",
                "total_interactions": 0,
                "avg_response_time": "Unknown",
                "risk_level": "Unknown"
            }
            
        return {
            "status": "Existing Connection",
            "total_interactions": relationship.total_interactions,
            "last_interaction": relationship.last_interaction.isoformat() if relationship.last_interaction else None,
            "history": relationship.interaction_history,
            "promises": relationship.promises_made
        }

    async def update_relationship(self, db: AsyncSession, user_email: str, sender_email: str, interaction_data: Dict[str, Any]):
        """Update relationship stats after an interaction."""
        # Get or create user (reusing logic from PersonalMemory would be better, but separating for now)
        result = await db.execute(select(User).where(User.email == user_email))
        user = result.scalar_one_or_none()
        if not user:
            return # Should handle error

        # Get or create relationship
        r_result = await db.execute(
            select(Relationship)
            .where(Relationship.user_id == user.id)
            .where(Relationship.email_address == sender_email)
        )
        relationship = r_result.scalar_one_or_none()
        
        if not relationship:
            relationship = Relationship(
                user_id=user.id,
                email_address=sender_email,
                total_interactions=0,
                interaction_history={},
                promises_made=[]
            )
            db.add(relationship)
        
        # Update stats
        relationship.total_interactions += 1
        relationship.last_interaction = datetime.now()
        
        # Simple history update (append to list in JSON, keep last 5)
        current_history = relationship.interaction_history or {}
        # Merge new data
        # Example interaction_data: {"action": "reply", "tone": "formal"}
        # This is a placeholder for more complex merging logic
        
        await db.commit()

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
            if rec.action_type == 'do_nothing' or rec.action_type == 'ignore':
                 metrics.replies_prevented += 1
            
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
        replies_prevented = getattr(metrics, 'replies_prevented', 0) or 0

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
        
        return {
            "total_decisions": total_decisions,
            "minutes_saved": minutes_saved,
            "replies_prevented": replies_prevented,
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
                "category": d.action_type # Use action_type as category (e.g., 'reply', 'ignore')
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
