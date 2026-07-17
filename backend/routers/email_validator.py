import logging
import re
import socket
import smtplib
import random
import string
import asyncio
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from dependencies import verify_user

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(tags=["email-validator"])

# Regex for basic email format validation
EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
)

# Common disposable email provider domains
DISPOSABLE_DOMAINS = {
    "mailinator.com", "yopmail.com", "10minutemail.com", "trashmail.com", "tempmail.com",
    "temp-mail.org", "guerrillamail.com", "dispostable.com", "getairmail.com", "maildrop.cc",
    "tempail.com", "throwawaymail.com", "burnermail.io", "burnercmail.com", "sharklasers.com",
    "guerrillamailblock.com", "guerrillamail.net", "guerrillamail.org", "guerrillamail.biz",
    "grr.la", "pokemail.net", "spam4.me", "veo.la", "smartenvelope.tokyo", "fakeinbox.com",
    "mintemail.com", "mailnesia.com", "mailcatch.com", "mytrashmail.com", "discard.email",
    "spambox.us", "mailbox.512.cx", "tempmailaddress.com", "moakt.com", "harakirimail.com",
    "getnada.com", "generator.email", "temporary-mail.net", "mailnull.com", "dispostable.com"
}

class ValidationRequest(BaseModel):
    email: str

class ValidationResponse(BaseModel):
    email: str
    is_valid_format: bool
    has_mx_records: bool
    mx_servers: List[str]
    smtp_status: str
    is_disposable: bool
    is_catch_all: bool
    overall_status: str  # valid, invalid, unknown
    details: str

def check_mx_records(domain: str) -> List[str]:
    """Resolve domain to MX records using dnspython."""
    try:
        import dns.resolver
        answers = dns.resolver.resolve(domain, 'MX')
        # Sort MX records by preference order (lower value has higher preference)
        records = sorted(answers, key=lambda r: r.preference)
        return [str(r.exchange).rstrip('.') for r in records]
    except Exception as e:
        logger.warning(f"Failed to resolve MX records for {domain}: {e}")
        return []

def check_smtp_mailbox_sync(mx_servers: List[str], target_email: str, domain: str) -> dict:
    """
    Connect to SMTP servers in order of preference, verify mailbox existence, and check for catch-all.
    Runs synchronously (meant to be run in a separate thread).
    """
    if not mx_servers:
        return {
            "smtp_status": "does_not_exist",
            "is_catch_all": False,
            "overall_status": "invalid",
            "details": "No MX records found for domain."
        }
        
    sender = "verify@smartemail.in"
    timeout = 6.0
    
    # Generate a random mailbox for catch-all testing
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=15))
    random_email = f"{random_str}@{domain}"
    
    smtp_status = "unknown"
    is_catch_all = False
    details = "Could not establish SMTP connection."
    
    for mx_host in mx_servers:
        try:
            logger.info(f"Connecting to MX: {mx_host} for verifying {target_email}")
            server = smtplib.SMTP(timeout=timeout)
            server.connect(mx_host, 25)
            
            # HELO/EHLO
            server.helo(server.local_hostname or "localhost")
            server.mail(sender)
            
            # 1. Check target email mailbox existence
            code, message = server.rcpt(target_email)
            message_decoded = message.decode('utf-8', errors='ignore')
            logger.info(f"RCPT TO {target_email} returned code {code}: {message_decoded}")
            
            if code == 250 or code == 251:
                smtp_status = "exists"
                details = f"Mailbox exists (SMTP code: {code})."
            elif code >= 500:
                smtp_status = "does_not_exist"
                details = f"Mailbox does not exist (SMTP code: {code}: {message_decoded})."
                server.quit()
                break # If mailbox does not exist, we can stop trying other servers
            else:
                smtp_status = "unknown"
                details = f"Mailbox status unverifiable (SMTP code: {code}: {message_decoded})."
                
            # 2. Check catch-all on the same connection
            catch_all_code, catch_all_message = server.rcpt(random_email)
            catch_all_message_decoded = catch_all_message.decode('utf-8', errors='ignore')
            logger.info(f"RCPT TO random {random_email} returned code {catch_all_code}: {catch_all_message_decoded}")
            
            if catch_all_code == 250 or catch_all_code == 251:
                is_catch_all = True
                
            server.quit()
            break # Successfully communicated with the primary/fallback server, no need to query next
            
        except smtplib.SMTPConnectError as e:
            logger.warning(f"SMTP connection error for {mx_host}: {e}")
            details = f"SMTP connection refused: {str(e)}"
        except socket.timeout:
            logger.warning(f"SMTP connection timeout for {mx_host}")
            details = "SMTP connection timeout."
        except Exception as e:
            logger.warning(f"SMTP verification error for {mx_host}: {e}")
            details = f"SMTP check failed: {str(e)}"
            
    # Compute overall status based on SMTP check and catch-all status
    overall_status = "unknown"
    if smtp_status == "exists":
        if is_catch_all:
            overall_status = "unknown"
            details = "Catch-all domain detected. Server accepts all mailboxes, so existence of this specific mailbox cannot be verified."
        else:
            overall_status = "valid"
    elif smtp_status == "does_not_exist":
        overall_status = "invalid"
        
    return {
        "smtp_status": smtp_status,
        "is_catch_all": is_catch_all,
        "overall_status": overall_status,
        "details": details
    }

@router.post("/emails/validate", response_model=ValidationResponse)
async def validate_email(
    payload: ValidationRequest
):
    """
    Validate email address format, resolve DNS MX records, verify disposable status,
    and perform SMTP check for mailbox existence and catch-all behavior.
    """
    email = payload.email.strip()
    
    # 1. Format validation
    is_valid_format = bool(EMAIL_REGEX.match(email))
    if not is_valid_format:
        return ValidationResponse(
            email=email,
            is_valid_format=False,
            has_mx_records=False,
            mx_servers=[],
            smtp_status="unknown",
            is_disposable=False,
            is_catch_all=False,
            overall_status="invalid",
            details="Invalid email address format."
        )
        
    # Get domain
    domain = email.split('@')[-1].lower()
    
    # 2. Check disposable email domain
    is_disposable = domain in DISPOSABLE_DOMAINS
    if is_disposable:
        # Resolve MX records anyway for data completion, but mark overall_status as invalid
        mx_servers = await asyncio.to_thread(check_mx_records, domain)
        return ValidationResponse(
            email=email,
            is_valid_format=True,
            has_mx_records=len(mx_servers) > 0,
            mx_servers=mx_servers,
            smtp_status="unknown",
            is_disposable=True,
            is_catch_all=False,
            overall_status="invalid",
            details="Disposable email addresses are not allowed."
        )
        
    # 3. Check domain and MX records
    mx_servers = await asyncio.to_thread(check_mx_records, domain)
    has_mx_records = len(mx_servers) > 0
    
    if not has_mx_records:
        return ValidationResponse(
            email=email,
            is_valid_format=True,
            has_mx_records=False,
            mx_servers=[],
            smtp_status="does_not_exist",
            is_disposable=False,
            is_catch_all=False,
            overall_status="invalid",
            details="No mail exchange (MX) records found for domain."
        )
        
    # 4. Perform SMTP check (runs in thread pool to prevent blocking)
    smtp_result = await asyncio.to_thread(check_smtp_mailbox_sync, mx_servers, email, domain)
    
    return ValidationResponse(
        email=email,
        is_valid_format=True,
        has_mx_records=True,
        mx_servers=mx_servers,
        smtp_status=smtp_result["smtp_status"],
        is_disposable=False,
        is_catch_all=smtp_result["is_catch_all"],
        overall_status=smtp_result["overall_status"],
        details=smtp_result["details"]
    )
