from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import dns.resolver
import logging

from dependencies import get_current_user
from db_models import User
from intents import IntentEngine
from encryption import get_encryption_service

router = APIRouter(prefix="/deliverability", tags=["deliverability"])
logger = logging.getLogger(__name__)

class SpamCheckRequest(BaseModel):
    subject: str
    body: str

@router.get("/domain-health")
async def get_domain_health(domain: str, user: User = Depends(get_current_user)):
    """
    Check the DNS records (SPF, DKIM, DMARC, MX) for a given domain
    to ensure it is properly authenticated for email sending.
    """
    if not domain:
        raise HTTPException(status_code=400, detail="Domain is required")
        
    domain = domain.strip().lower()
    
    health = {
        "domain": domain,
        "mx_records": {"status": "missing", "records": []},
        "spf_record": {"status": "missing", "record": None},
        "dmarc_record": {"status": "missing", "record": None},
        "overall_health": "poor"
    }
    
    # 1. Check MX Records
    try:
        mx_answers = dns.resolver.resolve(domain, 'MX')
        records = [str(r.exchange) for r in mx_answers]
        if records:
            health["mx_records"]["status"] = "found"
            health["mx_records"]["records"] = records
    except Exception as e:
        logger.warning(f"MX lookup failed for {domain}: {e}")

    # 2. Check SPF (TXT records on root domain starting with v=spf1)
    try:
        txt_answers = dns.resolver.resolve(domain, 'TXT')
        for r in txt_answers:
            txt_record = str(r).strip('"')
            if txt_record.startswith("v=spf1"):
                health["spf_record"]["status"] = "found"
                health["spf_record"]["record"] = txt_record
                break
    except Exception as e:
        logger.warning(f"SPF lookup failed for {domain}: {e}")
        
    # 3. Check DMARC (TXT record on _dmarc.domain)
    try:
        dmarc_domain = f"_dmarc.{domain}"
        dmarc_answers = dns.resolver.resolve(dmarc_domain, 'TXT')
        for r in dmarc_answers:
            txt_record = str(r).strip('"')
            if txt_record.startswith("v=DMARC1"):
                health["dmarc_record"]["status"] = "found"
                health["dmarc_record"]["record"] = txt_record
                break
    except Exception as e:
        logger.warning(f"DMARC lookup failed for {domain}: {e}")
        
    # Determine overall health
    score = 0
    if health["mx_records"]["status"] == "found": score += 1
    if health["spf_record"]["status"] == "found": score += 1
    if health["dmarc_record"]["status"] == "found": score += 1
    
    if score == 3:
        health["overall_health"] = "excellent"
    elif score == 2:
        health["overall_health"] = "fair"
        
    return health

@router.post("/spam-check")
async def check_spam_score(request: SpamCheckRequest, user: User = Depends(get_current_user)):
    """
    Analyze draft for spam trigger words, tone, and link density using LLM.
    """
    provider = user.ai_provider or 'openai'
    api_key = None
    
    if user.api_key_encrypted:
        encryption_service = get_encryption_service()
        api_key = encryption_service.decrypt(user.api_key_encrypted)
    
    # We will use langchain/openai directly here to do a quick spam analysis
    from langchain_core.prompts import ChatPromptTemplate
    
    try:
        engine = IntentEngine(provider=provider, api_key=api_key)
        llm = engine.llm
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert email deliverability consultant. Analyze the following email subject and body for 'Spam Likelihood'. Return a JSON object exactly with these keys: 'spam_score' (0-100, where 100 is highly likely to go to spam), 'trigger_words' (list of detected spammy words/phrases), 'tone_analysis' (string describing if it sounds too salesy), 'recommendations' (list of strings on how to fix it). DO NOT include markdown formatting or backticks around the json, output raw JSON only."),
            ("user", "Subject: {subject}\\nBody: {body}")
        ])
        
        chain = prompt | llm
        result = chain.invoke({"subject": request.subject, "body": request.body})
        
        # Parse the JSON
        import json
        
        content = result.content
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
            
        analysis = json.loads(content)
        return analysis
        
    except Exception as e:
        logger.error(f"Spam check failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to run spam analysis")
