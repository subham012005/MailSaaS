import asyncio
from intents import IntentEngine
from models import EmailMessage
from datetime import datetime
import json

def test_google_mail():
    body = """Welcome to Google AI Studio
The fastest path from prompt to production with Gemini. 
Build with Gemini API
Hi Subham, here’s what you can do with Google AI Studio: 
... (truncated for brevity, using key parts) ...
This email was sent to subhamsh05@gmail.com because you signed up to try the Gemini API and Google AI Studio. 
"""
    
    email = EmailMessage(
        message_id="test_google_1",
        thread_id="thread_g1",
        from_email="Google AI Studio <googleaistudio-noreply@google.com>",
        to_emails=["subhamsh05@gmail.com"],
        subject="Welcome to Google AI Studio",
        body=body,
        timestamp=datetime.now().isoformat()
    )
    
    engine = IntentEngine()
    analysis = engine.analyze_email(email)
    print(json.dumps(analysis.dict(), indent=2, default=str))

if __name__ == "__main__":
    test_google_mail()
