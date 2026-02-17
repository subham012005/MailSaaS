import os
import json
from typing import List, Optional
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv
from models import IntentAnalysis, ActionRecommendation, EmailMessage, CustomReplyRequest

load_dotenv()

class IntentEngine:
    def __init__(self, provider: str = "openai", api_key: Optional[str] = None, model_name: Optional[str] = None):
        """
        Initialize IntentEngine with specified provider.
        
        Args:
            provider: 'openai' or 'gemini' or 'default' (uses openai)
            api_key: Optional custom API key. If None, uses environment variable.
            model_name: Optional model name. If None, uses default for provider.
        """
        self.provider = provider if provider != 'default' else 'openai'
        
        if self.provider == 'openai':
            model = model_name or "gpt-4o-mini"
            key = api_key or os.getenv("OPENAI_API_KEY")
            if not key:
                raise ValueError("OPENAI_API_KEY not found in environment or user settings.")
            self.model = ChatOpenAI(model=model, api_key=key)
                
        elif self.provider == 'gemini':
            model = model_name or "gemini-1.5-flash"
            key = api_key or os.getenv("GOOGLE_API_KEY")
            if not key:
                raise ValueError("GOOGLE_API_KEY not found in environment or user settings.")
            self.model = ChatGoogleGenerativeAI(model=model, google_api_key=key)
        else:
            raise ValueError(f"Unsupported provider: {provider}. Use 'openai' or 'gemini'.")
        
        # We wrap in structured output
        self.structured_model = self.model.with_structured_output(IntentAnalysis)

    def analyze_email(self, email: EmailMessage, thread_history: str = "", relationship_context: str = "", personality_type: str = "general", personality_context: str = "", policies: List[dict] = []) -> IntentAnalysis:
        user_signoff = email.user_name if email.user_name else "Best regards"
        
        # --- Pre-LLM Policy Matcher ---
        active_policies = []
        policy_prompt = ""
        
        if policies:
            for p in policies:
                # Basic matching logic (can be expanded)
                scope = p.get('scope') or {}
                match = True
                
                # Domain match
                if 'domain' in scope and scope['domain']:
                    sender_domain = email.from_email.split('@')[-1]
                    if sender_domain not in scope['domain']:
                        match = False
                
                if match:
                    active_policies.append(p)
            
            if active_policies:
                policy_prompt = "\n**ENFORCEABLE GOVERNANCE POLICIES:**\n"
                for p in active_policies:
                    policy_prompt += f"- [{p.get('severity', 'HARD')}] {p.get('title')}: {p.get('description')}. Action Constraint: {p.get('action_constraint')}\n"
                policy_prompt += "\nYOU MUST OBEY HARD POLICIES. If an action violates a HARD policy, it is an invalid operation. Provide reasoning for how each policy was applied."

        # Personality / ICP Tuning
        personality_prompt = f"Act as a: {personality_type.upper()}."
        if personality_context:
            personality_prompt += f"\nAdditional Context about you: {personality_context}"
        else:
            # Default descriptions for standard personalities
            defaults = {
                "student": "You are a student. Focus on learning opportunities, internships, deadlines, and networking. Tone: Eager, professional but slightly more informal than a CEO.",
                "founder": "You are a founder/CEO. Time is extremely limited. Be direct, focus on ROI, strategic partnerships, and scaling. Tone: Concise, high-authority.",
                "recruiter": "You are a recruiter. Focus on talent acquisition, scheduling interviews, and candidate experience. Tone: Warm, organized, evaluative.",
                "sales": "You are in sales. Focus on leads, conversions, and follow-ups. Tone: Persuasive, persistent, relationship-driven.",
                "developer": "You are a developer. Focus on technical details, API documentation, bug reports, and pull requests. Tone: Precise, technical, and analytical.",
                "manager": "You are a manager. Focus on team coordination, project timelines, blocking issues, and resource allocation. Tone: Supportive, organized, and results-oriented.",
                "researcher": "You are a researcher. Focus on data accuracy, methodology, citations, and finding deep insights. Tone: Curious, thorough, and objective."
            }
            personality_prompt += f"\n{defaults.get(personality_type.lower(), 'You are a professional assistant.')}"

        # Delegation Context
        delegation_prompt = ""
        if email.delegation_instruction:
            delegation_prompt = f"""
**DELEGATED TASK CONTEXT:**
This email was assigned to you by {email.delegation_sender or 'a delegator'}.
INSTRUCTION: "{email.delegation_instruction}"
Your recommended action and drafted reply MUST align with this instruction.
"""

        template = PromptTemplate(
            template="""
You are a textual Decision Intelligence Engine. Your job is NOT just to write emails, but to decide IF a reply is needed and WHY.

**Your Identity & Perspective:**
{personality_prompt}
{policy_prompt}

{delegation_prompt}

**Input Data:**
- **From:** {from_email}
- **Subject:** {subject}
- **Body:** {body}
- **Thread History:** {thread_history} (Analyze for fatigue/state)
- **User Name:** {user_name}
- **Relationship Context:** {relationship_context} (Use this for scoring 'sender_importance')

**Analysis Instructions:**

1. **Strict Intent Classification**:
   - Classify into EXACTLY ONE of: `Sales`, `HR`, `Legal`, `Operations`, `Partnership`, `FYI` (Informational), `Emotional` (Complaint/Praise), `Scheduling`.
   - **Delegation Detection**: Look for "looping in", "can someone", "FYI". If found, mark intent as `Delegation`.
   - **Cold/Spam Detection (Brutal)**: 
     - Check for generic outreach, unsubscribe links, or "quick question" patterns.
     - **Cold Outreach Immunity**: If this is likely a mass-outreach or cold email with 0 previous relationship context, YOU MUST fingerprint it. Return `cold_outreach: true` and suggest a `brutal_silence` action (Silent Archive).

1.5. **Zero-Hallucination & Context Verification (CRITICAL)**:
   - **Context Search (MANDATORY)**: Before asking a question, search the `body`, `thread_history`, and `relationship_context`. If a fact (e.g. school name, class year) was EVER mentioned in any previous message in the thread, IT IS KNOWN.
   - **Identify Missing Facts**: Only list questions for information that is truly unknown and required for a reply.
   - **NO GUESSING**: Do not hallucinate data. If unknown, ask the user.
   - **Primary Action Swap**: If there are questions in `questions_for_user`, the `primary_action_id` MUST be an action with `action_type: 'ask_context'`. 

2. **Thread Intelligence & Forecasting**:
   - `thread_state`: Identify if this is `Early` (New topic), `Mid` (Negotiation/Discussion), `Late` (Wrapping up), or `Closing` (Confirmed/Done).
   - **Outcome Forecasting (Causal Value)**: Predict the impact of your recommended primary action:
     - `future_inbox_reduction`: Estimated % (0-100) of future messages this reply will prevent.
     - `escalation_risk`: Risk (0-100) of this action causing a conflict.
     - `relationship_strain_delta`: Predicted impact on relationship (-100 to 100).
     - `time_cost_forecast`: Predicted cumulative minutes for future interactions.
     - `outcome_confidence`: Your confidence (0.0-1.0) in these predictions based on data availability.

3. **Risk Radar (Crucial)**:
   - Identify text that implies:
     - **Legal Risk**: "I agree", "confirmed", "guarantee".
     - **Financial Risk**: Pricing mentions ("$XX"), "budget", "cost".
     - **Compliance Risk**: "confidential", "NDA", "PII".
   - Return these as `risk_flags`.

4. **Scoring System (0-100)**:
   - **`obligation_score`**: How RISKY is it to ignore this?
     - Adjust based on your personality ({personality_prompt}).
   - **`opportunity_score`**: What is the UPSIDE of engaging?

   - **Score Breakdown**: For each recommendation, provide a `score_breakdown` object containing:
     - `urgency`: 0-100 (time sensitivity)
     - `importance`: 0-100 (sender/context value)
     - `risk`: 0-100 (potential downside)
     - `opportunity`: 0-100 (potential upside)
   - `decision_rationale`: 1-2 sentences explaining WHY you recommend this action.
   - `explanation`: Deep Explainability Overlay. Breakdown: 
     - "Why this decision": Logic path.
     - "Signals that mattered": Specific text or relationship cues.
     - "Counterfactuals": "If the sender had mentioned X, I would have recommended Y instead."
   - `policy_matches`: For each active policy, report:
     - `title`: Policy title.
     - `severity`: HARD/SOFT/ADVISORY.
     - `impact`: enforced/violated/neutral.
     - `reasoning`: How the policy specifically shaped the decision.

6. **Action Constraints**:
   - **HARD POLICIES**: If a HARD policy says `DENY_REPLY`, you MUST NOT recommend a reply action as primary.
   - **Guardrails**: Internal domain -> Archive/Read, never Ignore.

7. **Action Recommendations**:
   - Provide 2-3 actions. One MUST be the `primary_action`.
   - **Context Actions**: If you have questions in `questions_for_user`, you MUST provide an action with `action_type: 'ask_context'` and `action_label: 'Provide Missing Context'`. This MUST be the `primary_action`.
   - For `reply` actions: provide `suggested_reply` (Complete, no placeholders, MATCHING THE USER'S PERSONALITY TONE). If facts are missing, the reply MUST be cautious (e.g. "I'll check on that and get back to you") or provide a generic draft while the `ask_context` remains primary.
   - **NO HEADERS**: Do NOT include headers like "Subject:", "To:", or "From:" in the `suggested_reply` field. Write ONLY the message body content.

**Output Format:**
Return valid JSON adhering to the `IntentAnalysis` model.

""",
            input_variables=["from_email", "subject", "body", "thread_history", "user_name", "relationship_context", "personality_prompt", "policy_prompt", "delegation_prompt"]
        )

        prompt = template.format(
            from_email=email.from_email,
            subject=email.subject,
            body=email.body,
            thread_history=thread_history or "(No previous context)",
            user_name=user_signoff,
            relationship_context=relationship_context or "(No relationship data)",
            personality_prompt=personality_prompt,
            policy_prompt=policy_prompt,
            delegation_prompt=delegation_prompt
        )

        result = self.structured_model.invoke(prompt)
        
        # --- Post-LLM Validator (Zero-Trust) ---
        self.verify_policy_compliance(result, active_policies)
        
        return result

    def verify_policy_compliance(self, analysis: IntentAnalysis, policies: List[dict]):
        """Manual check to ensure LLM hasn't bypassed a HARD constraint."""
        for p in policies:
            if p.get('severity') == 'HARD' and p.get('action_constraint') == 'DENY_REPLY':
                # Check if primary action is a reply
                primary = next((r for r in analysis.recommendations if r.id == analysis.primary_action_id), None)
                if primary and primary.action_type == 'reply':
                    # Violation! Force change or log error.
                    # For now, we'll append a violation flag and trust the UI to handle it, 
                    # or potentially swap the primary action back to a safe one.
                    for match in (analysis.policy_matches or []):
                        if match.title == p.get('title'):
                            match.impact = 'violated'
                            match.reasoning = f"CRITICAL: Policy {p.get('title')} was violated by the AI. Overriding action."
                    
                    # Basic remedial action: if it's a hard deny and AI suggested reply,
                    # we might want to swap primary_action_id to an 'archive' or 'do_nothing' action if available.
                    safe_action = next((r for r in analysis.recommendations if r.action_type != 'reply'), None)
                    if safe_action:
                        analysis.primary_action_id = safe_action.id

    def generate_custom_reply(self, request: CustomReplyRequest) -> str:
        delegation_prompt = ""
        if request.delegation_instruction:
            delegation_prompt = f"\n**DELEGATION INSTRUCTION:** '{request.delegation_instruction}'\nEnsure the reply satisfies this instruction."

        template = PromptTemplate(
            template="""
You are a professional email assistant.
Your goal is to write a reply based on the USER'S INSTRUCTION.

**Original Email:**
{original_body}

**Thread Context:**
{thread_history}

**User Instruction:**
{user_instruction}
{delegation_prompt}

**User Name (for signature):**
{user_name}

**Instructions:**
- Write a COMPLETE, ready-to-send email.
- **Includes the salutation (e.g., "Hi [Name],") and the sign-off (e.g., "Best regards, {user_name}").**
- If `user_name` is provided, YOU MUST USE IT in the signature. If not, use "Best regards,".
- Maintain a tone that matches the user's instruction (e.g., if they say "decline", be polite but firm).
- **NO HEADERS**: Do NOT include "Subject:", "To:", or "From:" in your response. Write ONLY the message body content.
""",
            input_variables=["original_body", "user_instruction", "thread_history", "user_name", "delegation_prompt"]
        )
        
        prompt = template.format(
            original_body=request.original_body,
            user_instruction=request.user_instruction,
            thread_history=request.thread_history or "(No previous context)",
            user_name=request.user_name or "Best regards",
            delegation_prompt=delegation_prompt
        )
        
        result = self.model.invoke(prompt)
        return result.content

if __name__ == "__main__":
    # Test with hard-coded data
    from datetime import datetime
    test_email = EmailMessage(
        message_id="msg123",
        thread_id="thread456",
        from_email="client@example.com",
        to_emails=["user@example.com"],
        subject="Project Update & Meeting Request",
        body="Hi, I've reviewed the latest designs. They look great, but I have a few concerns about the timeline. Can we meet tomorrow at 10 AM to discuss?",
        timestamp=datetime.now().isoformat()
    )
    
    engine = IntentEngine()
    analysis = engine.analyze_email(test_email)
    print(json.dumps(analysis.dict(), indent=2, default=str))
