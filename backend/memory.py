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
            try:
                user = User(email=email, full_name=email.split('@')[0])
                db.add(user)
                await db.commit()
                await db.refresh(user)
                
                # Init metrics
                metrics = UserMetric(user_id=user.id)
                db.add(metrics)
                await db.commit()
            except Exception as e:
                # Catch IntegrityError for race conditions during concurrent first-time requests
                await db.rollback()
                result = await db.execute(select(User).where(User.email == email))
                user = result.scalar_one_or_none()
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
        
        # Update metrics table (as a cache)
        result = await db.execute(select(UserMetric).where(UserMetric.user_id == user.id))
        metrics = result.scalar_one_or_none()
        if not metrics:
            metrics = UserMetric(user_id=user.id)
            db.add(metrics)

        metrics.total_decisions += 1
        metrics.time_saved_minutes += 2 # Simplified
        if rec.action_type in ['do_nothing', 'ignore', 'no_reply']:
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
        
        # 1. Aggregate Real-time Metrics from all activity tables
        # - Decisions (AI recommendations)
        # - Delegations (Tasks assigned)
        # - Scheduled Emails (Sent successfully)
        
        from db_models import ScheduledEmail, Delegation
        
        # Count AI Decisions
        d_count_res = await db.execute(select(func.count(Decision.id)).where(Decision.user_id == user.id))
        total_decisions = d_count_res.scalar() or 0
        
        # Count Delegations
        del_count_res = await db.execute(select(func.count(Delegation.id)).where(Delegation.user_id == user.id))
        total_delegations = del_count_res.scalar() or 0
        
        # Count Sent Scheduled Emails
        sch_count_res = await db.execute(select(func.count(ScheduledEmail.id)).where(
            ScheduledEmail.user_id == user.id, ScheduledEmail.status == 'sent'
        ))
        total_sent_scheduled = sch_count_res.scalar() or 0
        
        # Replies Prevented (specific decision type)
        rp_count_res = await db.execute(select(func.count(Decision.id)).where(
            Decision.user_id == user.id,
            Decision.action_type.in_(['do_nothing', 'ignore', 'no_reply'])
        ))
        replies_prevented = rp_count_res.scalar() or 0
        
        # Calculate derived metrics
        # Weights: Decision (2m), Delegation (5m), Sent Scheduled (3m)
        minutes_saved = (total_decisions * 2) + (total_delegations * 5) + (total_sent_scheduled * 3)
        
        # Fetch accuracy from UserMetric cache
        m_res = await db.execute(select(UserMetric).where(UserMetric.user_id == user.id))
        metrics = m_res.scalar_one_or_none()
        accuracy = getattr(metrics, 'accuracy', 1.0) or 1.0
        
        # Override total displayed count for frontend compatibility (decisions_saved is usually the main counter)
        display_decisions = total_decisions + total_delegations + total_sent_scheduled

        # 2. Calculate Aggregated Velocity (Last 7 Days)
        from datetime import timedelta
        end_date = datetime.now()
        start_date = end_date - timedelta(days=6)
        
        velocity_map = {(start_date + timedelta(days=i)).strftime('%Y-%m-%d'): 0 for i in range(7)}
        
        # Query Decisions
        v_dec = await db.execute(
            select(func.date(Decision.timestamp), func.count(Decision.id))
            .where(Decision.user_id == user.id, Decision.timestamp >= start_date)
            .group_by(func.date(Decision.timestamp))
        )
        for row in v_dec.all():
            d_str = str(row[0])
            if d_str in velocity_map: velocity_map[d_str] += row[1]

        # Query Delegations
        v_del = await db.execute(
            select(func.date(Delegation.created_at), func.count(Delegation.id))
            .where(Delegation.user_id == user.id, Delegation.created_at >= start_date)
            .group_by(func.date(Delegation.created_at))
        )
        for row in v_del.all():
            d_str = str(row[0])
            if d_str in velocity_map: velocity_map[d_str] += row[1]
            
        # Query Sent Scheduled
        v_sch = await db.execute(
            select(func.date(ScheduledEmail.created_at), func.count(ScheduledEmail.id))
            .where(ScheduledEmail.user_id == user.id, ScheduledEmail.status == 'sent', ScheduledEmail.created_at >= start_date)
            .group_by(func.date(ScheduledEmail.created_at))
        )
        for row in v_sch.all():
            d_str = str(row[0])
            if d_str in velocity_map: velocity_map[d_str] += row[1]
                
        velocity_data = list(velocity_map.values())

        # 3. Category Distribution (Pie Chart Data)
        # Parse from AnalysisTask results to see "what kind of mails"
        from db_models import AnalysisTask
        cat_dist = {}
        t_res = await db.execute(
            select(AnalysisTask.result)
            .where(AnalysisTask.user_id == user.id, AnalysisTask.status == 'completed')
            .order_by(AnalysisTask.created_at.desc())
            .limit(50)
        )
        for (res_json,) in t_res.all():
            if res_json and 'detected_intents' in res_json:
                intents = res_json['detected_intents']
                if isinstance(intents, list):
                    for intent in intents:
                        cat_dist[intent] = cat_dist.get(intent, 0) + 1
                elif isinstance(intents, str):
                    cat_dist[intents] = cat_dist.get(intents, 0) + 1

        # Use action_type from Decisions as fallback if cat_dist is empty
        if not cat_dist:
            d_res = await db.execute(
                select(Decision.action_type, func.count(Decision.id))
                .where(Decision.user_id == user.id)
                .group_by(Decision.action_type)
            )
            for row in d_res.all():
                cat_dist[str(row[0]).capitalize()] = row[1]

        # 4. Find Top Category
        top_category = "General"
        if cat_dist:
            top_category = max(cat_dist, key=cat_dist.get)
        
        return {
            "total_decisions": display_decisions,
            "minutes_saved": minutes_saved,
            "replies_prevented": replies_prevented,
            "accuracy": accuracy,
            "velocity": velocity_data,
            "top_category": top_category,
            "category_distribution": cat_dist
        }

    async def get_user_history(self, db: AsyncSession, user_email: str) -> list[Dict[str, Any]]:
        try:
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
                    "title": d.action_description or "Email Analysis",
                    "target": d.subject or "Recent Message",
                    "outcome": d.predicted_outcome,
                    "timestamp": d.timestamp.isoformat() if d.timestamp else datetime.now().isoformat(),
                    "category": d.action_type or "intel"
                })
                
            for c in corrections:
                history.append({
                    "id": f"correction_{c.id}",
                    "type": "correction",
                    "title": "Feedback Loop",
                    "target": "Draft Revision",
                    "original": c.original_value,
                    "edited": c.corrected_value,
                    "timestamp": c.timestamp.isoformat() if c.timestamp else datetime.now().isoformat(),
                    "category": "learning"
                })
                
            # Sort combined list by timestamp desc
            history.sort(key=lambda x: x['timestamp'], reverse=True)
            return history[:20]
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"ERROR in get_user_history: {e}")
            return []
