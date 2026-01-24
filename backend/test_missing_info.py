import asyncio
from intents import IntentEngine
from models import EmailMessage
from datetime import datetime
import json

def test_missing_info():
    # Email asks for a meeting but user hasn't provided availability context
    body = "Hi, can we meet next week to discuss the Q3 roadmap? Let me know what works."
    
    email = EmailMessage(
        message_id="test_missing_1",
        thread_id="thread_m1",
        from_email="Manager <manager@example.com>",
        to_emails=["user@example.com"],
        subject="Meeting Request",
        body=body,
        timestamp=datetime.now().isoformat(),
        user_name="Subham"
    )
    
    engine = IntentEngine()
    analysis = engine.analyze_email(email)
    print(json.dumps(analysis.dict(), indent=2, default=str))

if __name__ == "__main__":
    test_missing_info()
