import os
import uuid
import aiofiles
from fastapi import UploadFile
from app.utils.logger import logger
from app.utils.exceptions import InvalidFileTypeException, FileUploadException

class UploadService:
    def __init__(self):
        self.upload_dir = os.path.join(os.getcwd(), "uploads")
        # Ensure upload directory exists
        os.makedirs(self.upload_dir, exist_ok=True)

    def validate_document(self, file: UploadFile):
        """Validates that the uploaded file is a supported document."""
        allowed_content_types = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain"
        ]
        
        allowed_extensions = (".pdf", ".docx", ".pptx", ".txt")
        
        if file.content_type not in allowed_content_types:
            logger.warning(f"Invalid file upload attempt: {file.filename} ({file.content_type})")
            raise InvalidFileTypeException(detail=f"Unsupported file type: {file.content_type}")
            
        if not file.filename.lower().endswith(allowed_extensions):
            logger.warning(f"Invalid file extension: {file.filename}")
            raise InvalidFileTypeException(detail=f"File must have one of the following extensions: {', '.join(allowed_extensions)}")

    async def save_file_async(self, file: UploadFile) -> dict:
        """Asynchronously saves the file to the uploads directory."""
        self.validate_document(file)
        
        file_id = str(uuid.uuid4())
        safe_filename = f"{file_id}_{file.filename}"
        file_path = os.path.join(self.upload_dir, safe_filename)
        
        try:
            async with aiofiles.open(file_path, 'wb') as out_file:
                # Read chunks to handle large files efficiently
                while content := await file.read(1024 * 1024):  # 1MB chunks
                    await out_file.write(content)
                    
            logger.info(f"Successfully saved file {file.filename} as {safe_filename}")
            
            return {
                "file_id": file_id,
                "original_filename": file.filename,
                "saved_filename": safe_filename,
                "path": file_path
            }
        except Exception as e:
            logger.error(f"Error saving file {file.filename}: {str(e)}")
            raise FileUploadException()
