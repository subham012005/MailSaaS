from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, ForeignKey, Float
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
    
    decisions = relationship("Decision", back_populates="user")
    corrections = relationship("Correction", back_populates="user")

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
    last_updated = Column(DateTime(timezone=True), onupdate=func.now())
