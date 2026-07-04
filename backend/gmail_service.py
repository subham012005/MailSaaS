import base64
import httpx
from typing import List, Dict, Optional, Any
from datetime import datetime
import json
import logging

logger = logging.getLogger(__name__)

class GmailService:
    def __init__(self, access_token: str):
        """
        Initialize with the access token from NextAuth.
        """
        self.access_token = access_token
        self.base_url = "https://gmail.googleapis.com/gmail/v1/users/me"
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json"
        }

    def split_email_body(self, text: str) -> tuple[str, str]:
        """
        Split email body into new message and quoted 'On ... wrote:' text.
        """
        if not text:
            return "", ""
        
        import re
        
        # We look for the FIRST occurrence of the quote header starting at the beginning of a line
        patterns = [
            # Standard Gmail: On Mon, Jan 26, 2026 at 4:11 AM <email> wrote:
            r'(?m)^On\s+.*,\s+.*\s+at\s+.*\s+wrote:',
            # Simplified: On ... wrote:
            r'(?m)^On\s+.*\s+wrote:',
            # Outlook / General: ----- Original Message -----
            r'(?m)^\s*-+\s*Original Message\s*-+',
            # Outlook / General: From: ... Sent: ...
            r'(?m)^\s*From:.*[\s\S]*?Sent:.*[\s\S]*?To:.*',
            # Horizontal lines or dividers
            r'(?m)^_{32,}'
        ]
        
        for p in patterns:
            match = re.search(p, text, re.IGNORECASE)
            if match:
                # We split at the start of the match
                new_body = text[:match.start()].strip()
                quoted = text[match.start():].strip()
                if new_body: # Only split if there's actually something before it
                    return new_body, quoted
                
        return text.strip(), ""

    async def _fetch_and_parse_message(self, msg_info: Dict, client: httpx.AsyncClient) -> Optional[Dict]:
        """Fetch and parse a single message."""
        try:
            msg_response = await client.get(f"{self.base_url}/messages/{msg_info['id']}", params={'format': 'full'})
            if not msg_response.is_success:
                logger.error(f"Failed to fetch message {msg_info['id']}: {msg_response.status_code}")
                return None
                
            msg = msg_response.json()
            payload = msg.get('payload', {})
            headers = payload.get('headers', [])
            labels = msg.get('labelIds') or []
            is_read = 'UNREAD' not in labels
            
            subject = next((h['value'] for h in headers if h['name'].lower() == 'subject'), 'No Subject')
            from_email = next((h['value'] for h in headers if h['name'].lower() == 'from'), 'Unknown')
            to_email = next((h['value'] for h in headers if h['name'].lower() == 'to'), '')
            date_str = next((h['value'] for h in headers if h['name'].lower() == 'date'), None)
            message_id_header = next((h['value'] for h in headers if h['name'].lower() == 'message-id'), None)
            references = next((h['value'] for h in headers if h['name'].lower() == 'references'), '')
            
            # Enhanced body extraction
            plain_body = ""
            html_body = ""

            def parse_parts(parts):
                nonlocal plain_body, html_body
                for part in parts:
                    mime_type = part.get('mimeType')
                    body_data = part.get('body', {}).get('data')
                    
                    if mime_type == 'text/plain' and body_data:
                        try:
                            plain_body = base64.urlsafe_b64decode(body_data).decode()
                        except: pass
                    elif mime_type == 'text/html' and body_data:
                        try:
                            html_body = base64.urlsafe_b64decode(body_data).decode()
                        except: pass
                    elif 'parts' in part:
                        parse_parts(part['parts'])

            if 'parts' in payload:
                parse_parts(payload['parts'])
            else:
                body_data = payload.get('body', {}).get('data')
                if body_data:
                    if payload.get('mimeType') == 'text/html':
                        try: html_body = base64.urlsafe_b64decode(body_data).decode()
                        except: pass
                    else:
                        try: plain_body = base64.urlsafe_b64decode(body_data).decode()
                        except: pass

            cleaned_body, quoted_body = self.split_email_body(plain_body)
            
            # Extract attachment metadata
            attachments = []
            def extract_attachments(parts):
                for part in parts:
                    if part.get('filename'):
                        att_id = part.get('body', {}).get('attachmentId')
                        if att_id:
                            attachments.append({
                                "id": att_id,
                                "filename": part['filename'],
                                "mimeType": part.get('mimeType'),
                                "size": part.get('body', {}).get('size', 0)
                            })
                    if 'parts' in part:
                        extract_attachments(part['parts'])
            
            if 'parts' in payload:
                extract_attachments(payload['parts'])
            
            return {
                "id": msg['id'],
                "threadId": msg['threadId'],
                "message_id_header": message_id_header,
                "references": references,
                "from": from_email,
                "fromFull": from_email,
                "to": to_email,
                "to_emails": [], 
                "subject": subject,
                "preview": cleaned_body[:200] if cleaned_body else (html_body[:200] if html_body else ""),
                "body": cleaned_body,
                "quoted_body": quoted_body,
                "html_body": html_body,
                "dateRaw": date_str or str(datetime.now()),
                "date": date_str.split(',')[1].split('202')[0].strip() if date_str and ',' in date_str else date_str,
                "isRead": is_read,
                "attachments": attachments
            }
        except Exception as e:
            logger.error(f"Error processing message {msg_info.get('id')}: {e}")
            return None

    async def _process_messages(self, messages: List[Dict], client: httpx.AsyncClient) -> List[Dict]:
        """Common helper to process a list of Gmail message summaries into full email details concurrently."""
        import asyncio
        tasks = [self._fetch_and_parse_message(msg_info, client) for msg_info in messages]
        results = await asyncio.gather(*tasks)
        return [r for r in results if r is not None]

    async def fetch_latest_emails(self, max_results: int = 10) -> List[Dict]:
        """Fetch latest inbox emails."""
        try:
            async with httpx.AsyncClient(headers=self.headers, timeout=15.0) as client:
                params = {'maxResults': max_results, 'q': 'in:inbox'}
                response = await client.get(f"{self.base_url}/messages", params=params)
                response.raise_for_status()
                messages = response.json().get('messages', [])
                return await self._process_messages(messages, client)
        except Exception as e:
            logger.exception(f"Error fetching inbox: {e}")
            raise e

    async def fetch_sent_emails(self, max_results: int = 10) -> List[Dict]:
        """Fetch latest sent emails."""
        try:
            async with httpx.AsyncClient(headers=self.headers, timeout=15.0) as client:
                params = {'maxResults': max_results, 'q': 'in:sent'}
                response = await client.get(f"{self.base_url}/messages", params=params)
                response.raise_for_status()
                messages = response.json().get('messages', [])
                return await self._process_messages(messages, client)
        except Exception as e:
            logger.exception(f"Error fetching sent: {e}")
            raise e

    async def fetch_draft_emails(self, max_results: int = 10) -> List[Dict]:
        """Fetch latest draft emails."""
        try:
            async with httpx.AsyncClient(headers=self.headers, timeout=15.0) as client:
                params = {'maxResults': max_results}
                response = await client.get(f"{self.base_url}/drafts", params=params)
                response.raise_for_status()
                drafts = response.json().get('drafts', [])
                
                # Drafts endpoint returns a list of objects with 'id' and 'message'
                messages = [d['message'] for d in drafts if 'message' in d]
                return await self._process_messages(messages, client)
        except Exception as e:
            logger.exception(f"Error fetching drafts: {e}")
            raise e


    async def get_email_thread(self, thread_id: str) -> List[Dict]:
        """
        Fetch all messages in a thread and return them as a structured list.
        """
        try:
            async with httpx.AsyncClient(headers=self.headers, timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/threads/{thread_id}", params={'format': 'full'})
                response.raise_for_status()
                thread_data = response.json()
                
                messages = []
                for msg in thread_data.get('messages', []):
                    payload = msg.get('payload', {})
                    headers = payload.get('headers', [])
                    
                    subject = next((h['value'] for h in headers if h['name'] == 'Subject'), 'No Subject')
                    from_email = next((h['value'] for h in headers if h['name'] == 'From'), 'Unknown')
                    date_str = next((h['value'] for h in headers if h['name'] == 'Date'), None)
                    msg_id_header = next((h['value'] for h in headers if h['name'] == 'Message-ID'), None)
                    references = next((h['value'] for h in headers if h['name'] == 'References'), "")
                    
                    # Body extraction
                    plain_body = ""
                    html_body = ""

                    def parse_parts(parts):
                        nonlocal plain_body, html_body
                        for part in parts:
                            mime_type = part.get('mimeType')
                            body_data = part.get('body', {}).get('data')
                            if mime_type == 'text/plain' and body_data:
                                try: plain_body = base64.urlsafe_b64decode(body_data).decode()
                                except: pass
                            elif mime_type == 'text/html' and body_data:
                                try: html_body = base64.urlsafe_b64decode(body_data).decode()
                                except: pass
                            elif 'parts' in part:
                                parse_parts(part['parts'])

                    if 'parts' in payload:
                        parse_parts(payload['parts'])
                    else:
                        body_data = payload.get('body', {}).get('data')
                        if body_data:
                            if payload.get('mimeType') == 'text/html':
                                try: html_body = base64.urlsafe_b64decode(body_data).decode()
                                except: pass
                            else:
                                try: plain_body = base64.urlsafe_b64decode(body_data).decode()
                                except: pass

                    cleaned_body, quoted_body = self.split_email_body(plain_body)
                    
                    messages.append({
                        "id": msg['id'],
                        "message_id_header": msg_id_header,
                        "references": references,
                        "from": from_email,
                        "subject": subject,
                        "date": date_str,
                        "body": cleaned_body,
                        "quoted_body": quoted_body,
                        "html_body": html_body
                    })
                return messages
        except Exception as e:
            logger.error(f"Error fetching thread: {e}")
            return []

    async def mark_as_read(self, message_id: str):
        """
        Mark a message as read by removing the UNREAD label.
        """
        try:
            async with httpx.AsyncClient(headers=self.headers, timeout=10.0) as client:
                response = await client.post(
                    f"{self.base_url}/messages/{message_id}/modify",
                    json={'removeLabelIds': ['UNREAD']}
                )
                response.raise_for_status()
        except Exception as e:
            logger.error(f"Error marking as read: {e}")

    async def send_email(self, recipient: str, subject: str, body_text: str, html_content: str = None, reply_to: str = None, in_reply_to: str = None, references: str = None) -> str:
        """
        Send a plain text or HTML email via the Gmail API.
        """
        try:
            from email.message import EmailMessage

            message = EmailMessage()
            message["To"] = recipient
            message["Subject"] = subject
            if reply_to:
                message["Reply-To"] = reply_to
            if in_reply_to:
                message["In-Reply-To"] = in_reply_to
            if references:
                message["References"] = references

            if html_content:
                message.set_content(body_text) # Fallback
                message.add_alternative(html_content, subtype='html')
            else:
                message.set_content(body_text)
            
            encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            
            async with httpx.AsyncClient(headers=self.headers, timeout=15.0) as client:
                response = await client.post(
                    f"{self.base_url}/messages/send",
                    json={'raw': encoded_message}
                )
                response.raise_for_status()
                return response.json().get('id', '')
        except Exception as e:
            logger.error(f"Error sending email: {e}")
            raise e

    async def send_delegation_report(self, recipient: str, original_from: str, original_subject: str, original_body: str, intel_report: dict, user_instructions: str, thread_history: List[Dict] = None):
        """
        Send a formatted delegation report containing AI intelligence and full thread context.
        """
        clean_subject = original_subject
        if clean_subject.lower().startswith("re: "):
            clean_subject = clean_subject[4:]
        elif clean_subject.lower().startswith("re:"):
            clean_subject = clean_subject[3:]
            
        subject = f"[DELEGATED] {clean_subject}"
        
        history_html = ""
        if thread_history:
            history_html = '<h3 style="font-size: 14px; color: #4b5563; margin-top: 30px;">Conversation History:</h3>'
            for msg in thread_history:
                msg_body = msg.get('body', '').replace('\n', '<br/>')
                history_html += f"""
                <div style="border-left: 2px solid #e5e7eb; padding-left: 15px; margin-bottom: 20px;">
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 5px;">
                        <b>{msg.get('from')}</b> • {msg.get('date')}
                    </div>
                    <div style="font-size: 13px; color: #374151;">
                        {msg_body}
                    </div>
                </div>
                """

        html_body = f"""
<div style="font-family: sans-serif; max-width: 600px; line-height: 1.5; color: #1f2937;">
  <h2 style="color: #4f46e5;">Decision Intelligence Delegation</h2>
  <hr style="border: 0; border-top: 1px solid #eee;" />
  
  <p><b>SOURCE:</b> {original_from}</p>
  <p><b>DIRECTIVE:</b><br/>{user_instructions}</p>
  
  <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
    <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #6b7280;">AI Intelligence Report</h3>
    <table style="width: 100%; font-size: 13px;">
      <tr><td><b>Intent:</b></td><td>{", ".join(intel_report.get('detected_intents', ['Unknown']))}</td></tr>
      <tr><td><b>Importance:</b></td><td>{intel_report.get('obligation_score', 'N/A')}/100</td></tr>
      <tr><td><b>Opportunity:</b></td><td>{intel_report.get('opportunity_score', 'N/A')}/100</td></tr>
    </table>
    
    <p style="margin-top: 15px;"><b>Strategic Summary:</b><br/>
    {intel_report.get('summary', ['No summary provided'])[0] if isinstance(intel_report.get('summary'), list) else intel_report.get('summary')}</p>
  </div>
  
  {history_html if history_html else f'<p style="font-size: 14px; color: #4b5563;"><b>Latest Message:</b></p><div style="color: #6b7280; font-style: italic; border-left: 3px solid #e5e7eb; padding-left: 15px; font-size: 13px; margin-bottom: 30px;">{original_body}</div>'}
  
  <hr style="border: 0; border-top: 1px solid #eee; margin-top: 40px;" />
  <p style="font-size: 11px; color: #9ca3af; text-align: center;">Processed by Antigravity Decision Intelligence</p>
</div>
"""
        plain_body = f"Delegation ID: {original_subject}\nSource: {original_from}\nDirective: {user_instructions}\n\nPlease check the HTML version for full AI intelligence."
        
        return await self.send_email(recipient, subject, plain_body, html_content=html_body, reply_to=original_from)

    async def reply_to_thread(self, thread_id: str, recipient: str, subject: str, body_text: str, in_reply_to: str = None, references: str = None) -> str:
        """
        Reply specifically to a thread with enhanced Gmail-style formatting.
        """
        try:
            # Clean subject for cleaner threads
            reply_subject = subject
            if not reply_subject.lower().startswith("re:"):
                reply_subject = f"Re: {reply_subject}"

            body_html = body_text.replace('\n', '<br/>')
            html_content = f"""
<div dir="ltr">
  <div style="font-family: sans-serif; font-size: 14px; color: #374151;">
    {body_html}
  </div>
</div>
"""
            from email.message import EmailMessage
            message = EmailMessage()
            message["To"] = recipient
            message["Subject"] = subject
            if in_reply_to:
                message["In-Reply-To"] = in_reply_to
            if references:
                message["References"] = references

            message.set_content(body_text)
            message.add_alternative(html_content, subtype='html')
            
            encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            
            async with httpx.AsyncClient(headers=self.headers, timeout=15.0) as client:
                response = await client.post(
                    f"{self.base_url}/messages/send",
                    json={
                        'raw': encoded_message,
                        'threadId': thread_id
                    }
                )
                response.raise_for_status()
                return response.json().get('id', '')
        except Exception as e:
            logger.error(f"Error replying to thread: {e}")
            raise e

    async def get_attachment(self, message_id: str, attachment_id: str) -> bytes:
        """Download an attachment by its ID"""
        try:
            async with httpx.AsyncClient(headers=self.headers, timeout=30.0) as client:
                response = await client.get(
                    f"{self.base_url}/messages/{message_id}/attachments/{attachment_id}"
                )
                response.raise_for_status()
                data = response.json()
                return base64.urlsafe_b64decode(data['data'])
        except Exception as e:
            logger.error(f"Error downloading attachment: {e}")
            raise e

    async def send_email_with_attachments(self, recipient: str, subject: str, body_text: str, 
                                         attachments: List[Dict] = None, thread_id: str = None,
                                         in_reply_to: str = None, references: str = None) -> str:
        """
        Send an email with attachments.
        attachments: List of dicts with 'filename', 'data' (bytes), and 'mime_type'
        """
        try:
            from email.message import EmailMessage
            
            message = EmailMessage()
            message["To"] = recipient
            message["Subject"] = subject
            if in_reply_to:
                message["In-Reply-To"] = in_reply_to
            if references:
                message["References"] = references
            
            message.set_content(body_text)
            
            if attachments:
                for att in attachments:
                    maintype, subtype = att['mime_type'].split('/', 1) if '/' in att['mime_type'] else ('application', 'octet-stream')
                    message.add_attachment(
                        att['data'],
                        maintype=maintype,
                        subtype=subtype,
                        filename=att['filename']
                    )
            
            encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            
            payload = {'raw': encoded_message}
            if thread_id:
                payload['threadId'] = thread_id
            
            async with httpx.AsyncClient(headers=self.headers, timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/messages/send",
                    json=payload
                )
                response.raise_for_status()
                return response.json().get('id', '')
        except Exception as e:
            logger.error(f"Error sending email with attachments: {e}")
            raise e

