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
            if api_key:
                self.model = ChatOpenAI(model=model, api_key=api_key)
            else:
                self.model = ChatOpenAI(model=model)  # Uses OPENAI_API_KEY from env
                
        elif self.provider == 'gemini':
            model = model_name or "gemini-2.5-flash"
            if api_key:
                self.model = ChatGoogleGenerativeAI(model=model, google_api_key=api_key)
            else:
                # Uses GOOGLE_API_KEY from env
                self.model = ChatGoogleGenerativeAI(model=model)
        else:
            raise ValueError(f"Unsupported provider: {provider}. Use 'openai' or 'gemini'.")
        
        self.structured_model = self.model.with_structured_output(IntentAnalysis)

    def analyze_email(self, email: EmailMessage, thread_history: str = "", relationship_context: str = "", personality_type: str = "general", personality_context: str = "") -> IntentAnalysis:
        user_signoff = email.user_name if email.user_name else "Best regards"
        
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
                "sales": "You are in sales. Focus on leads, conversions, and follow-ups. Tone: Persuasive, persistent, relationship-driven."
            }
            personality_prompt += f"\n{defaults.get(personality_type.lower(), 'You are a professional assistant.')}"

        template = PromptTemplate(
            template="""
You are a textual Decision Intelligence Engine. Your job is NOT just to write emails, but to decide IF a reply is needed and WHY.

**Your Identity & Perspective:**
{personality_prompt}

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
   - **Cold/Spam Detection**: Check for generic outreach, unsubscribe links in body (if likely automated), or "quick question" sales patterns.

2. **Thread Intelligence**:
   - `thread_state`: Identify if this is `Early` (New topic), `Mid` (Negotiation/Discussion), `Late` (Wrapping up), or `Closing` (Confirmed/Done).
   - `thread_fatigue`: High if > 5 replies back-and-forth on same topic. 

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
   
5. **Score Breakdown & Rationale (Explainability)**:
   - Provide a JSON `score_breakdown` with: `urgency` (0-30), `sender_importance` (0-25), `risk_of_ignoring` (0-15), `opportunity_value` (0-30).
   - `decision_rationale`: Write 1-2 sentences for the USER explaining WHY you recommend this action.

6. **Guardrails & Silence Automation**:
   - **Hard Override**: If email is from internal domain or existing partner (check Relationship Context) -> NEVER suggest "Ignore" as primary, use "Archive" or "Read" if no action needed.
   - **Silence**: If `obligation_score` < 20 AND `opportunity_score` < 10, strongly suggest "Do Nothing" or "Archive".

7. **Action Recommendations**:
   - Provide 2-3 actions. One MUST be the `primary_action`.
   - For `reply` actions: provide `suggested_reply` (Complete, no placeholders, MATCHING THE USER'S PERSONALITY TONE).

**Output Format:**
Return valid JSON adhering to the `IntentAnalysis` model.

""",
            input_variables=["from_email", "subject", "body", "thread_history", "user_name", "relationship_context", "personality_prompt"]
        )

        prompt = template.format(
            from_email=email.from_email,
            subject=email.subject,
            body=email.body,
            thread_history=thread_history or "(No previous context)",
            user_name=user_signoff,
            relationship_context=relationship_context or "(No relationship data)",
            personality_prompt=personality_prompt
        )

        result = self.structured_model.invoke(prompt)
        return result

    def generate_custom_reply(self, request: CustomReplyRequest) -> str:
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

**User Name (for signature):**
{user_name}

**Instructions:**
- Write a COMPLETE, ready-to-send email.
- **Includes the salutation (e.g., "Hi [Name],") and the sign-off (e.g., "Best regards, {user_name}").**
- If `user_name` is provided, YOU MUST USE IT in the signature. If not, use "Best regards,".
- Maintain a tone that matches the user's instruction (e.g., if they say "decline", be polite but firm).
""",
            input_variables=["original_body", "user_instruction", "thread_history", "user_name"]
        )
        
        prompt = template.format(
            original_body=request.original_body,
            user_instruction=request.user_instruction,
            thread_history=request.thread_history or "(No previous context)",
            user_name=request.user_name or "Best regards"
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
