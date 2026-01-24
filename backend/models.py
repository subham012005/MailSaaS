from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

class ActionRecommendation(BaseModel):
    id: str
    action_type: str # 'reply', 'ignore', 'negotiate', 'decline', 'escalate', 'shorten', 'expand', 'no_reply'
    action_label: str
    predicted_outcome: str
    why_recommendation: str
    suggested_reply: Optional[str] = None
    historical_references: List[str] = []

class EmailMessage(BaseModel):
    message_id: str
    thread_id: str
    from_email: str
    to_emails: List[str]
    subject: str
    body: str
    html_body: Optional[str] = None
    timestamp: str
    is_read: bool = True
    is_automated: bool = False
    user_name: Optional[str] = None

class CustomReplyRequest(BaseModel):
    message_id: str
    original_body: str
    user_instruction: str
    thread_history: Optional[str] = ""
    user_name: Optional[str] = None

class IntentAnalysis(BaseModel):
    message_id: str
    detected_intents: List[str]
    summary: List[str] = Field(..., description="Short key points summarizing the email")
    tone: str
    urgency: str # 'now', 'later', 'never'
    primary_action_id: Optional[str] = None
    questions_for_user: List[str] = Field(default=[], description="Questions to ask the user if context is missing")
    recommendations: List[ActionRecommendation]

class UserCorrection(BaseModel):
    message_id: str
    original_draft: str
    edited_draft: str
    correction_intent: str

class DecisionMetric(BaseModel):
    decisions_saved: int
    minutes_saved: float
    consistency_score: float
    rework_reduction: float

class HistoryItem(BaseModel):
    id: str
    type: str # 'decision' or 'correction'
    title: str
    target: Optional[str] = None
    outcome: Optional[str] = None
    original: Optional[str] = None
    edited: Optional[str] = None
    timestamp: str
    category: str

