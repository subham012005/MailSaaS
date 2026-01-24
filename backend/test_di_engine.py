import asyncio
import json
from datetime import datetime
from intents import IntentEngine
from models import EmailMessage

async def test_di_engine():
    print("Initializing IntentEngine...")
    try:
        # Assumes OPENAI_API_KEY is in .env 
        engine = IntentEngine(provider="openai", model_name="gpt-4o-mini")
    except Exception as e:
        print(f"Skipping OpenAI test (no key?): {e}")
        return

    # 1. Test High Obligation Email (Boss asking for report)
    email_boss = EmailMessage(
        message_id="msg001",
        thread_id="th001",
        from_email="ceo@company.com",
        to_emails=["me@company.com"],
        subject="Urgent: Q3 Report",
        body="I need the Q3 financial report by 5 PM today. Are we on track? Also, confirm the budget for the offsite.",
        timestamp=datetime.now().isoformat(),
        user_name="Subha"
    )
    
    print("\n--- Testing High Obligation Email ---")
    analysis = engine.analyze_email(email_boss, thread_history="", relationship_context='{"status": "Boss", "total_interactions": 50}')
    
    print(f"Detected Intents: {analysis.detected_intents}")
    print(f"Obligation Score: {analysis.obligation_score}")
    print(f"Risks: {analysis.risk_flags}")
    print(f"Breakdown: {analysis.recommendations[0].score_breakdown}")
    print(f"Rationale: {analysis.recommendations[0].decision_rationale}")

    # 2. Test Sales Spam (Cold email)
    email_spam = EmailMessage(
        message_id="msg002",
        thread_id="th002",
        from_email="sales@random-vendor.com",
        to_emails=["me@company.com"],
        subject="Quick question",
        body="Hi, I saw your profile and wanted to see if you need help with SEO. <a href='unsubscribe'>Unsubscribe</a>",
        timestamp=datetime.now().isoformat(),
        user_name="Subha"
    )

    print("\n--- Testing Cold/Spam Email ---")
    analysis_spam = engine.analyze_email(email_spam, thread_history="", relationship_context='{"status": "New", "total_interactions": 0}')
    
    print(f"Detected Intents: {analysis_spam.detected_intents}")
    print(f"Obligation Score: {analysis_spam.obligation_score}")
    print(f"Opportunity Score: {analysis_spam.opportunity_score}")
    print(f"Primary Action: {analysis_spam.primary_action_id}")
    if analysis_spam.recommendations:
        rec = next((r for r in analysis_spam.recommendations if r.id == analysis_spam.primary_action_id), None)
        if rec:
             print(f"Action Type: {rec.action_type}")
             print(f"Silence Reason: {rec.silence_reason}")

if __name__ == "__main__":
    asyncio.run(test_di_engine())
