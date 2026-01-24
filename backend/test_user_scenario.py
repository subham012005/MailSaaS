import asyncio
from intents import IntentEngine
from models import EmailMessage
from datetime import datetime
import json

def test_user_scenario():
    # User's exact example
    body = "Hey Sir,\nthis mail is for asking the meeting time to schedule tomorrow?"
    
    email = EmailMessage(
        message_id="test_user_repro_1",
        thread_id="thread_u1",
        from_email="Some Sender <sender@example.com>",
        to_emails=["subham2010sh@gmail.com"],
        subject="Meeting Request",
        body=body,
        timestamp=datetime.now().isoformat(),
        user_name="Hitesh"
    )
    
    engine = IntentEngine()
    analysis = engine.analyze_email(email)
    print(json.dumps(analysis.dict(), indent=2, default=str))

if __name__ == "__main__":
    test_user_scenario()
