import asyncio
from intents import IntentEngine
from models import EmailMessage
from datetime import datetime
import json

def test_chatgpt_mail():
    body = """Start with any question
Chat now
You don’t need a plan or the perfect question to use ChatGPT.
Just start typing whatever’s on your mind — a half-baked idea, a random question, a weird "what if."
ChatGPT is built for all of it.
No pressure. No perfect prompts. Explore ideas, create images, write stories, and summarize files in just a simple conversation.
Best,
The ChatGPT Team
OpenAI
...
Unsubscribe
...
"""
    
    email = EmailMessage(
        message_id="test_chatgpt_1",
        thread_id="thread_gpt1",
        from_email="ChatGPT <noreply@email.openai.com>",
        to_emails=["user@example.com"],
        subject="Ask anything – really",
        body=body,
        timestamp=datetime.now().isoformat()
    )
    
    engine = IntentEngine()
    analysis = engine.analyze_email(email)
    print(json.dumps(analysis.dict(), indent=2, default=str))

if __name__ == "__main__":
    test_chatgpt_mail()
