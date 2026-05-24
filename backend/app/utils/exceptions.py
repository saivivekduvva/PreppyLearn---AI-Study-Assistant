from fastapi import HTTPException, status

class InvalidFileTypeException(HTTPException):
    def __init__(self, detail: str = "Invalid file type. Only PDF files are allowed."):
        super().__init__(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail=detail)

class FileUploadException(HTTPException):
    def __init__(self, detail: str = "An error occurred while uploading the file."):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)

class FileNotFoundException(HTTPException):
    def __init__(self, detail: str = "The requested file was not found."):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)

class DocumentExtractionException(HTTPException):
    def __init__(self, detail: str = "An error occurred while extracting text from the document."):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)

class EmbeddingGenerationException(HTTPException):
    def __init__(self, detail: str = "An error occurred while generating embeddings."):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)
        self.error_code = "EMBEDDING_GENERATION_FAILED"

class LLMServiceException(HTTPException):
    def __init__(self, detail: str = "An error occurred while communicating with the AI service."):
        super().__init__(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail)
        self.error_code = "AI_SERVICE_ERROR"

class VectorDBException(HTTPException):
    def __init__(self, detail: str = "An error occurred in the vector database."):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)
        self.error_code = "VECTOR_DB_ERROR"

class InvalidDocumentException(HTTPException):
    def __init__(self, detail: str = "The uploaded document is invalid, corrupted, or password-protected."):
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)
        self.error_code = "INVALID_DOCUMENT_FILE"
