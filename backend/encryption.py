"""
Encryption utilities for securing sensitive data like API keys
"""
import os
from cryptography.fernet import Fernet
from typing import Optional

class EncryptionService:
    def __init__(self):
        encryption_key = os.getenv('ENCRYPTION_KEY')
        if not encryption_key:
            raise ValueError("ENCRYPTION_KEY environment variable is required")
        self.cipher = Fernet(encryption_key.encode())
    
    def encrypt(self, plaintext: str) -> str:
        """Encrypt a string and return base64 encoded ciphertext"""
        if not plaintext:
            return ""
        return self.cipher.encrypt(plaintext.encode()).decode()
    
    def decrypt(self, ciphertext: str) -> str:
        """Decrypt a base64 encoded ciphertext and return plaintext"""
        if not ciphertext:
            return ""
        try:
            return self.cipher.decrypt(ciphertext.encode()).decode()
        except Exception as e:
            raise ValueError(f"Decryption failed: {str(e)}")

# Global instance
_encryption_service: Optional[EncryptionService] = None

def get_encryption_service() -> EncryptionService:
    """Get or create the global encryption service instance"""
    global _encryption_service
    if _encryption_service is None:
        _encryption_service = EncryptionService()
    return _encryption_service
