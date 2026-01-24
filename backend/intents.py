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

    def analyze_email(self, email: EmailMessage, thread_history: str = "") -> IntentAnalysis:
        user_signoff = email.user_name if email.user_name else "Best regards"
        
        template = PromptTemplate(
            template="""
You are a Decision Intelligence Engine for a professional email assistant. 
Your goal is to analyze the following email and suggest multiple potential actions, each with a predicted outcome.

**Thread Context:**
{thread_history}

**Current Email:**
From: {from_email}
Subject: {subject}
Body: {body}
User Name (for signature): {user_name}

**Instructions:**
1. Identify the core **intents** of the sender.
2. Provide a **summary** of the email as 2-3 bullet points/key points that are easy to understand.
3. Determine the **tone** and **urgency** (now, later, never).
4. **STRICT FILTERING STEP**:
   - Check if `from_email` contains "noreply", "no-reply", "newsletter", "marketing", "updates", "info@", "team@", or generic service names (e.g., "Google", "OpenAI", "Amazon").
   - Check if `body` contains mass-mail footer indications like "Unsubscribe", "Privacy Policy", "Terms of Service", "View in browser", "Manage preferences".
   - If ANY of these are present and there is NO clear, direct personal question addressed specifically to the user, then:
     - The email is **AUTOMATED/INFORMATIONAL**.
     - You MUST NOT suggest replying.
     - You MUST suggest "Archive", "Mark as Read", or "Do Nothing".
     
5. **MISSING CONTEXT CHECK (CRITICAL)**:
   - Does that incoming email ask a specific question (e.g., "What time?", "Where?", "Is this approved?")?
   - If YES, do you (the AI) run knowing the answer? Likely NOT.
   - **Rule**: If the incoming email asks a question, you MUST ask the user for the answer in `questions_for_user`.
   - Example: Email says "meeting time?". You MUST set `questions_for_user` = ["What time would you like to meet?"].
   - **Do NOT generate a reply that just asks "When are you free?"**. The user wants to provide the time NOW so the reply can be specific (e.g., "I am free at 2 PM").
   - If `questions_for_user` is populated, the frontend will pause and ask the user.

6. Generate 2-3 recommended **actions**. For each action:
   - Provide a unique **id** (e.g., "act_1", "act_2").
   - Provide a clear label (e.g., "Reply Professional", "Decline Politely", "Archive", "Do Nothing").
   - Predict the **consequence**/outcome of taking that action.
   - Provide a "Why" explanation citing context.
   - **CRITICAL**: If the action involves replying:
     - You MUST provide a `suggested_reply` (full email body).
     - **ABSOLUTELY NO PLACEHOLDERS**: Never use `[Your Name]`, `[Insert Date]`, `[Time]`. 
     - Use the provided `user_name` for the signature. If unknown, just use "Best regards,".
     - If you don't know a detail, either ask in `questions_for_user` OR write the email in a way that avoids needing it yet (e.g., "I will confirm the time shortly").
   
7. Identify the **best/primary action** to take and set its ID as `primary_action_id`.
   - If automated, prioritize "Do Nothing".
   - If `questions_for_user` has items, prioritize the action that corresponds to answering them (usually a reply).
   
**Focus on Decision Intelligence, not just automation.**
""",
            input_variables=["from_email", "subject", "body", "thread_history", "user_name"]
        )

        prompt = template.format(
            from_email=email.from_email,
            subject=email.subject,
            body=email.body,
            thread_history=thread_history or "(No previous context)",
            user_name=user_signoff
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
