from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.upload_service import UploadService
from app.services.extraction_service import ExtractionService
from app.config.database import get_db
from app.models.document import Document
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()

def get_upload_service():
    return UploadService()

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    upload_service: UploadService = Depends(get_upload_service),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a document (PDF, DOCX, PPTX, TXT).
    """
    result = await upload_service.save_file_async(file)
    
    return {
        "status": "success",
        "message": "File uploaded successfully",
        "data": result
    }

def get_extraction_service():
    return ExtractionService()

@router.get("/extract/{filename}")
async def extract_document_text(
    filename: str,
    extraction_service: ExtractionService = Depends(get_extraction_service),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Extract text from a previously uploaded document and save it to the database.
    """
    # Check if document already exists
    existing_doc = db.query(Document).filter(Document.filename == filename, Document.user_id == current_user.id).first()
    if existing_doc:
        extracted_text = existing_doc.extracted_text
    else:
        # Extract and save
        extracted_text = extraction_service.extract_text(filename)
        new_doc = Document(filename=filename, extracted_text=extracted_text, user_id=current_user.id)
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
async def get_document_library(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Fetch a list of all previously extracted documents.
    """
    docs = db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.upload_date.desc()).all()
    
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
async def get_document_by_id(doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Fetch the full extracted text of a specific document.
    """
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
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
