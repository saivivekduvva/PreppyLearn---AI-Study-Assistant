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

class PDFExtractionException(HTTPException):
    def __init__(self, detail: str = "An error occurred while extracting text from the PDF."):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)

