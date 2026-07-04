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
    api_key_encrypted = Column(String(500), nullable=True)  # Encrypted API key
    personality_type = Column(String(50), default='general')
    personality_context = Column(Text, nullable=True) # Stores JSON string {persona_id: context_text} or plain text
    is_onboarded = Column(Boolean, default=False)
    refresh_token = Column(String(500), nullable=True)  # Store refresh token for offline access
    
    decisions = relationship("Decision", back_populates="user")
    corrections = relationship("Correction", back_populates="user")
    relationships = relationship("Relationship", back_populates="user")
    sessions = relationship("UserSession", back_populates="user")
    scheduled_emails = relationship("ScheduledEmail", back_populates="user")

class UserSession(Base):
    __tablename__ = "user_sessions"

    token_hash = Column(String(255), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    email = Column(String(255), index=True)
    expires_at = Column(Float)  # Unix timestamp
    refresh_token = Column(String(500), nullable=True) # Store refresh token for offline access
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="sessions")

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
    category_distribution = Column(JSON, default={}) # Distribution of email categories
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
    instruction_history = Column(JSON, nullable=True) # List of instructions with timestamps
    send_mode = Column(String(20), default='thread') # 'thread' or 'new'
    status = Column(String(50), default='pending') # 'pending', 'awaiting_approval', 'approved', 'sent', 'overdue', 'needs_changes'
    sla_deadline = Column(DateTime(timezone=True))
    last_instruction_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")

class AnalysisTask(Base):
    __tablename__ = "analysis_tasks"

    id = Column(String(255), primary_key=True, index=True) # Usually a UUID or similar
    user_id = Column(Integer, ForeignKey("users.id"))
    email_id = Column(String(255))
    status = Column(String(50), default='pending') # 'pending', 'processing', 'completed', 'failed'
    result = Column(JSON, nullable=True)
    error = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String(50)) # 'delegation', 'system', 'approval', 'new_email'
    message = Column(String(500))
    read = Column(Boolean, default=False)
    target_view = Column(String(50), nullable=True) # e.g., 'delegations'
    target_id = Column(String(255), nullable=True) # ID of the related item
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")

class ScheduledEmail(Base):
    __tablename__ = "scheduled_emails"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    recipient = Column(String(255))
    subject = Column(String(255))
    body = Column(Text)
    scheduled_time = Column(DateTime(timezone=True))
    thread_id = Column(String(255), nullable=True)
    in_reply_to = Column(String(255), nullable=True)
    references = Column(String(255), nullable=True)
    status = Column(String(50), default='pending') # 'pending', 'sent', 'cancelled', 'failed'
    error = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="scheduled_emails")

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(255))
    status = Column(String(50), default='draft') # 'draft', 'active', 'paused', 'completed'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    steps = relationship("SequenceStep", back_populates="campaign", cascade="all, delete-orphan")
    contacts = relationship("CampaignContact", back_populates="campaign", cascade="all, delete-orphan")

class SequenceStep(Base):
    __tablename__ = "sequence_steps"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    step_number = Column(Integer)
    delay_days = Column(Integer, default=0) # Days to wait after previous step
    subject_template = Column(String(255))
    body_template = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    campaign = relationship("Campaign", back_populates="steps")

class CampaignContact(Base):
    __tablename__ = "campaign_contacts"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    email = Column(String(255))
    name = Column(String(255), nullable=True)
    company = Column(String(255), nullable=True)
    status = Column(String(50), default='pending') # 'pending', 'active', 'bounced', 'replied', 'unsubscribed', 'completed'
    current_step = Column(Integer, default=1)
    next_action_time = Column(DateTime(timezone=True), nullable=True) # When the next step should fire
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    campaign = relationship("Campaign", back_populates="contacts")
