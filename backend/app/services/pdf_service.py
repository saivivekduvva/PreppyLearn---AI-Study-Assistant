import os
import re
import pdfplumber
from app.utils.logger import logger
from app.utils.exceptions import FileNotFoundException, PDFExtractionException, InvalidPDFException
from pdfminer.pdfparser import PDFSyntaxError

class PDFService:
    def __init__(self):
        self.upload_dir = os.path.join(os.getcwd(), "uploads")

    def extract_text(self, filename: str) -> str:
        """
        Extracts clean text from a PDF file located in the uploads directory.
        Handles corrupted PDFs and excessive whitespace.
        """
        file_path = os.path.join(self.upload_dir, filename)
        
        if not os.path.exists(file_path):
            logger.warning(f"Extraction failed: File not found -> {file_path}")
            raise FileNotFoundException(detail=f"File '{filename}' not found.")
            
        try:
            logger.info(f"Starting text extraction from {filename}...")
            text_content = []
            
            # Using pdfplumber to extract text safely
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_content.append(page_text)
                        
            if not text_content:
                logger.warning(f"No text could be extracted from {filename}. It might be an image-only PDF.")
                return ""
                
            # Join all pages
            raw_text = "\n".join(text_content)
            
            # Clean up whitespace to ensure high quality LLM context
            # Replace multiple spaces with a single space
            clean_text = re.sub(r'[ \t]+', ' ', raw_text)
            # Replace 3 or more newlines with 2 newlines (to preserve paragraphs but remove huge vertical gaps)
            clean_text = re.sub(r'\n{3,}', '\n\n', clean_text)
            
            clean_text = clean_text.strip()
            
            logger.info(f"Successfully extracted {len(clean_text)} characters from {filename}.")
            return clean_text
            
        except PDFSyntaxError as e:
            logger.error(f"Invalid or corrupted PDF file {filename}: {str(e)}")
            raise InvalidPDFException()
        except Exception as e:
            logger.error(f"Failed to extract text from {filename}: {str(e)}")
            raise PDFExtractionException()
