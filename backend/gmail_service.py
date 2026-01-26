import base64
import requests
from typing import List, Dict
from datetime import datetime
import json

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

    async def fetch_latest_emails(self, max_results: int = 10) -> List[Dict]:
        """
        Fetch the actual latest emails from the inbox using direct HTTP requests.
        """
        try:
            print(f"DEBUG: Fetching emails via requests with token: {self.access_token[:10]}...")
            
            # 1. List messages
            params = {
                'maxResults': max_results,
                'labelIds': ['INBOX']
            }
            
            # Use a session for connection pooling
            with requests.Session() as session:
                session.headers.update(self.headers)
                
                response = session.get(f"{self.base_url}/messages", params=params, timeout=10)
                response.raise_for_status()
                
                data = response.json()
                print(f"DEBUG: Gmail API List Results: {data.keys()}")
                
                messages = data.get('messages', [])
                print(f"DEBUG: Found {len(messages)} messages.")
                
                email_data = []
                for msg_info in messages:
                    # 2. Get message details
                    msg_response = session.get(f"{self.base_url}/messages/{msg_info['id']}", params={'format': 'full'}, timeout=10)
                    if not msg_response.ok:
                        print(f"Failed to fetch message {msg_info['id']}: {msg_response.status_code}")
                        continue
                        
                    msg = msg_response.json()
                    
                    payload = msg.get('payload', {})
                    headers = payload.get('headers', [])
                    labels = msg.get('labelIds', [])
                    is_read = 'UNREAD' not in labels
                    
                    subject = next((h['value'] for h in headers if h['name'] == 'Subject'), 'No Subject')
                    from_email = next((h['value'] for h in headers if h['name'] == 'From'), 'Unknown')
                    date_str = next((h['value'] for h in headers if h['name'] == 'Date'), None)
                    message_id_header = next((h['value'] for h in headers if h['name'] == 'Message-ID'), None)
                    references = next((h['value'] for h in headers if h['name'] == 'References'), '')
                    
                    # Enhanced body extraction
                    plain_body = ""
                    html_body = ""

                    def parse_parts(parts):
                        nonlocal plain_body, html_body
                        for part in parts:
                            mime_type = part.get('mimeType')
                            body_data = part.get('body', {}).get('data')
                            
                            if mime_type == 'text/plain' and body_data:
                                plain_body = base64.urlsafe_b64decode(body_data).decode()
                            elif mime_type == 'text/html' and body_data:
                                html_body = base64.urlsafe_b64decode(body_data).decode()
                            elif 'parts' in part:
                                parse_parts(part['parts'])

                    if 'parts' in payload:
                        parse_parts(payload['parts'])
                    else:
                        body_data = payload.get('body', {}).get('data')
                        if body_data:
                            if payload.get('mimeType') == 'text/html':
                                html_body = base64.urlsafe_b64decode(body_data).decode()
                            else:
                                plain_body = base64.urlsafe_b64decode(body_data).decode()

                    cleaned_body, quoted_body = self.split_email_body(plain_body)
                    
                    email_data.append({
                        "message_id": msg['id'],
                        "message_id_header": message_id_header,
                        "references": references,
                        "thread_id": msg['threadId'],
                        "from_email": from_email,
                        "to_emails": [], 
                        "subject": subject,
                        "body": cleaned_body,
                        "quoted_body": quoted_body,
                        "html_body": html_body,
                        "timestamp": date_str or str(datetime.now()),
                        "is_read": is_read
                    })
                return email_data
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"Error fetching emails: {e}")
            raise e

    async def get_email_thread(self, thread_id: str) -> List[Dict]:
        """
        Fetch all messages in a thread and return them as a structured list.
        """
        try:
             with requests.Session() as session:
                session.headers.update(self.headers)
                response = session.get(f"{self.base_url}/threads/{thread_id}", params={'format': 'full'}, timeout=10)
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
                    
                    # Body extraction
                    plain_body = ""
                    html_body = ""

                    def parse_parts(parts):
                        nonlocal plain_body, html_body
                        for part in parts:
                            mime_type = part.get('mimeType')
                            body_data = part.get('body', {}).get('data')
                            if mime_type == 'text/plain' and body_data:
                                plain_body = base64.urlsafe_b64decode(body_data).decode()
                            elif mime_type == 'text/html' and body_data:
                                html_body = base64.urlsafe_b64decode(body_data).decode()
                            elif 'parts' in part:
                                parse_parts(part['parts'])

                    if 'parts' in payload:
                        parse_parts(payload['parts'])
                    else:
                        body_data = payload.get('body', {}).get('data')
                        if body_data:
                            if payload.get('mimeType') == 'text/html':
                                html_body = base64.urlsafe_b64decode(body_data).decode()
                            else:
                                plain_body = base64.urlsafe_b64decode(body_data).decode()

                    cleaned_body, quoted_body = self.split_email_body(plain_body)
                    
                    messages.append({
                        "id": msg['id'],
                        "message_id_header": msg_id_header,
                        "from": from_email,
                        "subject": subject,
                        "date": date_str,
                        "body": cleaned_body,
                        "quoted_body": quoted_body,
                        "html_body": html_body
                    })
                return messages
        except Exception as e:
            print(f"Error fetching thread: {e}")
            return []

    async def send_email(self, recipient: str, subject: str, body_text: str, html_content: str = None, reply_to: str = None, in_reply_to: str = None, references: str = None) -> str:
        """
        Send a plain text or HTML email via the Gmail API.
        """
        try:
            import base64
            from email.message import EmailMessage
            from email.utils import make_msgid

            message = EmailMessage()
            message["To"] = recipient
            message["Subject"] = subject
            if reply_to:
                message["Reply-To"] = reply_to
            if in_reply_to:
                message["In-Reply-To"] = in_reply_to
            if references:
                # References should be space-separated list of msg-ids
                message["References"] = references

            if html_content:
                message.set_content(body_text) # Fallback
                message.add_alternative(html_content, subtype='html')
            else:
                message.set_content(body_text)
            
            # Encode to base64
            encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            
            with requests.Session() as session:
                session.headers.update(self.headers)
                response = session.post(
                    f"{self.base_url}/messages/send",
                    json={'raw': encoded_message},
                    timeout=10
                )
                response.raise_for_status()
                return response.json().get('id', '')
        except Exception as e:
            print(f"Error sending email: {e}")
            raise e

    async def send_delegation_report(self, recipient: str, original_from: str, original_subject: str, original_body: str, intel_report: dict, user_instructions: str, thread_history: List[Dict] = None):
        """
        Send a formatted delegation report containing AI intelligence and full thread context.
        """
        subject = f"[DELEGATED] {original_from}: {original_subject}"
        
        history_html = ""
        if thread_history:
            history_html = '<h3 style="font-size: 14px; color: #4b5563; margin-top: 30px;">Conversation History:</h3>'
            for msg in thread_history:
                history_html += f"""
                <div style="border-left: 2px solid #e5e7eb; padding-left: 15px; margin-bottom: 20px;">
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 5px;">
                        <b>{msg.get('from')}</b> • {msg.get('date')}
                    </div>
                    <div style="font-size: 13px; color: #374151;">
                        {msg.get('body', '').replace('\\n', '<br/>')}
                    </div>
                </div>
                """

        # Build HTML report for better formatting
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
            import base64
            from email.message import EmailMessage

            if not subject.lower().startswith("re:"):
                subject = f"Re: {subject}"

            # Wrap in HTML for that professional 'Gmail' look
            html_content = f"""
<div dir="ltr">
  {body_text.replace('\\n', '<br/>')}
</div>
"""
            # To actually look like a nested reply in many clients, 
            # we'd need the original body here to wrap in a blockquote.
            # But Gmail handles threading perfectly via headers + threadId.

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
            
            with requests.Session() as session:
                session.headers.update(self.headers)
                response = session.post(
                    f"{self.base_url}/messages/send",
                    json={
                        'raw': encoded_message,
                        'threadId': thread_id
                    },
                    timeout=10
                )
                response.raise_for_status()
                return response.json().get('id', '')
        except Exception as e:
            print(f"Error replying to thread: {e}")
            raise e
