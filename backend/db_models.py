from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    full_name = Column(String(255))
    avatar_url = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # BYOK (Bring Your Own Key) fields
    ai_provider = Column(String(50), default='default')  # 'default', 'openai', 'gemini'
    api_key = Column(String(500), nullable=True)  # Plain text API key (Development Only)
    personality_type = Column(String(50), default='general')
    personality_context = Column(Text, nullable=True)
    
    decisions = relationship("Decision", back_populates="user")
    corrections = relationship("Correction", back_populates="user")
    relationships = relationship("Relationship", back_populates="user")

class Relationship(Base):
    __tablename__ = "relationships"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    email_address = Column(String(255), index=True)
    total_interactions = Column(Integer, default=0)
    last_interaction = Column(DateTime(timezone=True))
    interaction_history = Column(JSON, default={}) # Stores trends like avg response time, tone
    promises_made = Column(JSON, default=[]) # List of active commitments
    
    user = relationship("User", back_populates="relationships")

class Decision(Base):
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    email_id = Column(String(255))
    subject = Column(String(255))
    action_type = Column(String(255))
    action_description = Column(String(255))
    predicted_outcome = Column(String(255))
    is_shadow = Column(Boolean, default=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="decisions")

class Correction(Base):
    __tablename__ = "corrections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    email_id = Column(String(255))
    field = Column(String(50))  # 'draft', 'tone', etc.
    original_value = Column(String(255))
    corrected_value = Column(String(255))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="corrections")

class UserMetric(Base):
    __tablename__ = "user_metrics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    accuracy = Column(Float, default=100.0)
    total_decisions = Column(Integer, default=0)
    total_corrections = Column(Integer, default=0)
    time_saved_minutes = Column(Integer, default=0)
    replies_prevented = Column(Integer, default=0) # New Metric: Inbox Load Reduction
    last_updated = Column(DateTime(timezone=True), onupdate=func.now())

class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Structured Governance
    title = Column(String(255))
    description = Column(String(500))
    policy_type = Column(String(50)) # e.g., 'PRICING', 'INTERNAL', 'SECURITY'
    scope = Column(JSON) # {domain: [], labels: [], etc.}
    action_constraint = Column(String(50)) # 'DENY_REPLY', 'FORCE_DRAFT', 'NOTIFY_ONLY'
    severity = Column(String(20)) # 'HARD', 'SOFT', 'ADVISORY'
    priority = Column(Integer, default=10)
    conditions = Column(JSON, default={}) # {contains_terms: [], intent_matches: []}
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="policies")

class CounterfactualLog(Base):
    __tablename__ = "counterfactual_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    email_id = Column(String(255))
    ai_recommendation = Column(JSON)
    user_action = Column(String(255))
    was_overridden = Column(Boolean, default=False)
    predicted_impact = Column(JSON)
    actual_outcome = Column(JSON, nullable=True) # Populated later
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")

# Update User model
User.policies = relationship("Policy", back_populates="user")

class Delegation(Base):
    __tablename__ = "delegations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    email_id = Column(String(255))
    thread_id = Column(String(255))
    original_subject = Column(String(255))
    original_sender = Column(String(255), nullable=True) # The email address of the original sender
    delegate_email = Column(String(255))
    expected_action = Column(String(500))
    reply_draft = Column(Text, nullable=True) # The draft response from the delegate
    feedback = Column(Text, nullable=True) # Feedback from the boss to the delegate
    thread_context = Column(JSON, nullable=True) # List of previous messages in the thread
    status = Column(String(50), default='pending') # 'pending', 'awaiting_approval', 'approved', 'sent', 'overdue', 'needs_changes'
    sla_deadline = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
