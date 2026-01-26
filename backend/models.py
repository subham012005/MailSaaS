from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

class ScoreBreakdown(BaseModel):
    urgency: int = Field(..., description="0-100 score for time sensitivity")
    importance: int = Field(..., description="0-100 score for sender/context value")
    risk: int = Field(..., description="0-100 score for potential negative outcome")
    opportunity: int = Field(..., description="0-100 score for potential upside")

class ActionRecommendation(BaseModel):
    id: str
    action_type: str # 'reply', 'ignore', 'delegate', 'negotiate', 'decline', 'escalate', 'shorten', 'expand', 'no_reply'
    action_label: str
    predicted_outcome: str
    why_recommendation: str
    decision_rationale: str = Field(..., description="User-facing explanation (1-2 sentences) of why this decision was made")
    score_breakdown: ScoreBreakdown
    prediction_confidence: float = Field(..., description="Confidence score 0.0-1.0")
    silence_reason: Optional[str] = Field(None, description="Reason for suggested silence")
    suggested_reply: Optional[str] = Field(None, description="The drafted email content")
    historical_references: List[str] = Field(default_factory=list)

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

class OutcomeMetrics(BaseModel):
    future_inbox_reduction: float = Field(..., description="Estimated % reduction in future messages for this thread")
    escalation_risk: int = Field(..., description="Risk of this causing an escalation (0-100)")
    relationship_strain_delta: int = Field(..., description="Estimated change in relationship strain (-100 to 100)")
    time_cost_forecast: float = Field(..., description="Predicted minutes required for future interactions in this thread")
    outcome_confidence: float = Field(..., description="Confidence in these predictions (0.0-1.0)")

class PolicyEnforcement(BaseModel):
    policy_id: Optional[int] = Field(..., description="ID of the matched policy")
    title: str
    severity: str # 'HARD', 'SOFT', 'ADVISORY'
    impact: str # 'enforced', 'violated', 'neutral'
    reasoning: str

class IntentAnalysis(BaseModel):
    message_id: str
    detected_intents: List[str]
    summary: List[str] = Field(..., description="Short key points summarizing the email")
    tone: str
    urgency: str # 'now', 'later', 'never'
    obligation_score: int = Field(..., description="Risk if ignored (0-100)")
    opportunity_score: int = Field(..., description="Value if engaged (0-100)")
    risk_flags: List[str] = Field(default_factory=list, description="Legal, Financial, or Compliance risks")
    strategic_mode: str = Field(..., description="Current strategy mode applied")
    thread_state: str = Field(..., description="Early, Mid, Late, Closing")
    cold_outreach: bool = Field(..., description="Is this a cold email/spam?")
    primary_action_id: str = Field(..., description="The ID of the recommended primary action")
    questions_for_user: List[str] = Field(..., description="Questions to ask the user if context is missing")
    recommendations: List[ActionRecommendation] = Field(..., description="A list of 2-3 recommended actions")
    outcome_metrics: OutcomeMetrics = Field(..., description="The predicted impact metrics")
    policy_matches: List[PolicyEnforcement] = Field(..., description="List of policies that were checked")
    explanation: str = Field(..., description="Deep explainability overview of the decision logic")

class PersonalityUpdate(BaseModel):
    personality_type: str
    personality_context: Optional[str] = None

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
    replies_prevented: int = 0

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

