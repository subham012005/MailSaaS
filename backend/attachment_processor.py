"""
Attachment processing utilities for reading PDFs, DOCX, and images with LLM
"""
import base64
import io
from typing import Optional, Dict
import logging

logger = logging.getLogger(__name__)

class AttachmentProcessor:
    """Process attachments for LLM reading with size/page limits"""
    
    # Size limits
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    MAX_PDF_PAGES = 50
    MAX_TEXT_LENGTH = 50000  # characters
    
    def __init__(self, llm_client=None):
        self.llm_client = llm_client
    
    def can_process(self, filename: str, size_bytes: int) -> tuple[bool, str]:
        """Check if file can be processed"""
        if size_bytes > self.MAX_FILE_SIZE:
            return False, f"File too large ({size_bytes / 1024 / 1024:.1f}MB > 10MB limit)"
        
        ext = filename.lower().split('.')[-1]
        if ext not in ['pdf', 'docx', 'doc', 'txt', 'png', 'jpg', 'jpeg']:
            return False, f"Unsupported file type: {ext}"
        
        return True, "OK"
    
    def extract_text_from_pdf(self, file_data: bytes) -> Optional[str]:
        """Extract text from PDF with page limit"""
        try:
            import PyPDF2
            pdf_file = io.BytesIO(file_data)
            reader = PyPDF2.PdfReader(pdf_file)
            
            num_pages = len(reader.pages)
            if num_pages > self.MAX_PDF_PAGES:
                logger.warning(f"PDF has {num_pages} pages, limiting to {self.MAX_PDF_PAGES}")
            
            text_parts = []
            for i in range(min(num_pages, self.MAX_PDF_PAGES)):
                page = reader.pages[i]
                text_parts.append(page.extract_text())
            
            full_text = "\n\n".join(text_parts)
            
            if len(full_text) > self.MAX_TEXT_LENGTH:
                full_text = full_text[:self.MAX_TEXT_LENGTH] + "\n\n[... truncated for length ...]"
            
            return full_text
        except Exception as e:
            logger.error(f"Failed to extract PDF text: {e}")
            return None
    
    def extract_text_from_docx(self, file_data: bytes) -> Optional[str]:
        """Extract text from DOCX"""
        try:
            import docx
            doc_file = io.BytesIO(file_data)
            doc = docx.Document(doc_file)
            
            text_parts = [para.text for para in doc.paragraphs]
            full_text = "\n\n".join(text_parts)
            
            if len(full_text) > self.MAX_TEXT_LENGTH:
                full_text = full_text[:self.MAX_TEXT_LENGTH] + "\n\n[... truncated for length ...]"
            
            return full_text
        except Exception as e:
            logger.error(f"Failed to extract DOCX text: {e}")
            return None
    
    def extract_text_from_image(self, file_data: bytes) -> Optional[str]:
        """Extract text from image using OCR"""
        try:
            import pytesseract
            from PIL import Image
            
            image = Image.open(io.BytesIO(file_data))
            text = pytesseract.image_to_string(image)
            
            if len(text) > self.MAX_TEXT_LENGTH:
                text = text[:self.MAX_TEXT_LENGTH] + "\n\n[... truncated for length ...]"
            
            return text
        except Exception as e:
            logger.error(f"Failed to extract image text: {e}")
            return None
    
    def process_attachment(self, filename: str, file_data: bytes) -> Dict:
        """Process attachment and extract text if possible"""
        size = len(file_data)
        can_process, reason = self.can_process(filename, size)
        
        result = {
            "filename": filename,
            "size_bytes": size,
            "can_process": can_process,
            "reason": reason,
            "extracted_text": None
        }
        
        if not can_process:
            return result
        
        ext = filename.lower().split('.')[-1]
        
        if ext == 'pdf':
            result["extracted_text"] = self.extract_text_from_pdf(file_data)
        elif ext in ['docx', 'doc']:
            result["extracted_text"] = self.extract_text_from_docx(file_data)
        elif ext in ['png', 'jpg', 'jpeg']:
            result["extracted_text"] = self.extract_text_from_image(file_data)
        elif ext == 'txt':
            try:
                text = file_data.decode('utf-8')
                if len(text) > self.MAX_TEXT_LENGTH:
                    text = text[:self.MAX_TEXT_LENGTH] + "\n\n[... truncated for length ...]"
                result["extracted_text"] = text
            except Exception as e:
                logger.error(f"Failed to decode text file: {e}")
        
        return result
