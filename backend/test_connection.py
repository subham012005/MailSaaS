import requests
import sys

print("Testing connection to http://127.0.0.1:8000/delegations ...")
try:
    r = requests.get(
        "http://127.0.0.1:8000/delegations", 
        headers={"X-User-Email": "test@example.com"},
        timeout=5
    )
    print(f"Status Code: {r.status_code}")
    print(f"Response: {r.text[:500]}") # Truncate incase huge
except Exception as e:
    print(f"Connection Failed: {e}")
