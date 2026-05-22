from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.upload_service import UploadService
from app.services.pdf_service import PDFService
from app.config.database import get_db
from app.models.document import Document

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
    pdf_service: PDFService = Depends(get_pdf_service),
    db: Session = Depends(get_db)
):
    """
    Extract text from a previously uploaded PDF and save it to the database.
    """
    # Check if document already exists
    existing_doc = db.query(Document).filter(Document.filename == filename).first()
    if existing_doc:
        extracted_text = existing_doc.extracted_text
    else:
        # Extract and save
        extracted_text = pdf_service.extract_text(filename)
        new_doc = Document(filename=filename, extracted_text=extracted_text)
        db.add(new_doc)
        db.commit()
        db.refresh(new_doc)
    
    return {
        "status": "success",
        "message": "Text extracted successfully",
        "data": {
            "filename": filename,
            "text": extracted_text,
            "length": len(extracted_text)
        }
    }

@router.get("/library")
async def get_document_library(db: Session = Depends(get_db)):
    """
    Fetch a list of all previously extracted documents.
    """
    docs = db.query(Document).order_by(Document.upload_date.desc()).all()
    
    return {
        "status": "success",
        "data": [
            {
                "id": doc.id,
                "filename": doc.filename,
                "upload_date": doc.upload_date.isoformat()
            }
            for doc in docs
        ]
    }

@router.get("/library/{doc_id}")
async def get_document_by_id(doc_id: int, db: Session = Depends(get_db)):
    """
    Fetch the full extracted text of a specific document.
    """
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
        
    return {
        "status": "success",
        "data": {
            "id": doc.id,
            "filename": doc.filename,
            "text": doc.extracted_text,
            "upload_date": doc.upload_date.isoformat()
        }
    }
