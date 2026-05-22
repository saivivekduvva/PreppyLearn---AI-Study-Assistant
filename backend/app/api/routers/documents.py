from fastapi import APIRouter, File, UploadFile, Depends
from app.services.upload_service import UploadService
from app.services.pdf_service import PDFService

router = APIRouter()

def get_upload_service():
    return UploadService()

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    upload_service: UploadService = Depends(get_upload_service)
):
    """
    Upload a PDF document.
    """
    result = await upload_service.save_file_async(file)
    
    return {
        "status": "success",
        "message": "File uploaded successfully",
        "data": result
    }

def get_pdf_service():
    return PDFService()

@router.get("/extract/{filename}")
async def extract_pdf_text(
    filename: str,
    pdf_service: PDFService = Depends(get_pdf_service)
):
    """
    Extract text from a previously uploaded PDF.
    """
    extracted_text = pdf_service.extract_text(filename)
    
    return {
        "status": "success",
        "message": "Text extracted successfully",
        "data": {
            "filename": filename,
            "text": extracted_text,
            "length": len(extracted_text)
        }
    }
