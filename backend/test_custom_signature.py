import asyncio
from intents import IntentEngine
from models import CustomReplyRequest
import json

def test_custom_reply_signature():
    # Simulate user answering "9:00 AM" to the context question
    req = CustomReplyRequest(
        message_id="msg_test_custom",
        original_body="Hey, can we meet tomorrow?",
        user_instruction="Reply that I am available at 9:00 AM.",
        user_name="Subham Sharma"
    )
    
    engine = IntentEngine()
    reply = engine.generate_custom_reply(req)
    print("Generated Reply:")
    print(reply)

if __name__ == "__main__":
    test_custom_reply_signature()
