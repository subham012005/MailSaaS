import asyncio
from intents import IntentEngine
from models import EmailMessage
from datetime import datetime
import json

def test_meeting_time_question():
    # Email specifically just asks "meeting time ?"
    body = "meeting time ?"
    
    email = EmailMessage(
        message_id="test_meeting_1",
        thread_id="thread_m2",
        from_email="Subham Sharma <subham2010sh@gmail.com>",
        to_emails=["hitesh@example.com"],
        subject="Decision Engine Active",
        body=body,
        timestamp=datetime.now().isoformat(),
        user_name="Hitesh"
    )
    
    engine = IntentEngine()
    analysis = engine.analyze_email(email)
    print(json.dumps(analysis.dict(), indent=2, default=str))

if __name__ == "__main__":
    test_meeting_time_question()
