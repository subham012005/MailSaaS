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

                    email_data.append({
                        "message_id": msg['id'],
                        "thread_id": msg['threadId'],
                        "from_email": from_email,
                        "to_emails": [], 
                        "subject": subject,
                        "body": plain_body[:500],
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

    async def get_email_thread(self, thread_id: str) -> str:
        # Full thread logic for context engine (Simplified placeholder)
        try:
             with requests.Session() as session:
                session.headers.update(self.headers)
                response = session.get(f"{self.base_url}/threads/{thread_id}", params={'format': 'full'}, timeout=10)
                if response.ok:
                    thread = response.json()
                    # Logic to parse thread messages...
                    return str(thread.get('messages', []))
                return ""
        except Exception as e:
            print(f"Error fetching thread: {e}")
            return ""
