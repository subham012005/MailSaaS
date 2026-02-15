import hashlib

def hash_token(token: str) -> str:
    """Hash a token for secure storage/lookup."""
    return hashlib.sha256(token.encode()).hexdigest()
