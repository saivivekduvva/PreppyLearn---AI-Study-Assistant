from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.services.upload_service import UploadService
from app.services.extraction_service import ExtractionService
from app.config.database import get_db
from app.models.document import Document
from app.models.user import User
from app.api.deps import get_current_user
from app.vectorstore.pinecone_client import PineconeClient
import os
import logging

logger = logging.getLogger(__name__)

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

def delete_document_resources(filename: str):
    """
    Background worker to delete vectors from Pinecone and clean up physical files.
    """
    try:
        # Delete from Pinecone
        pinecone_client = PineconeClient()
        pinecone_client.delete_by_metadata({"source": filename})
        logger.info(f"Successfully deleted vectors for {filename}")
        
        # Delete physical file from uploads folder if it exists
        # In this project, upload_service stores it in 'uploads/'
        upload_path = os.path.join("uploads", filename)
        if os.path.exists(upload_path):
            os.remove(upload_path)
            logger.info(f"Successfully deleted file {upload_path}")
            
    except Exception as e:
        logger.error(f"Failed to delete background resources for {filename}: {str(e)}")

@router.delete("/library/{doc_id}")
async def delete_document(
    doc_id: int, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Delete a document from the SQL database and schedule its vectors/files for background deletion.
    """
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
        
    filename = doc.filename
    
    # 1. Delete from SQL immediately
    db.delete(doc)
    db.commit()
    
    # 2. Schedule Pinecone and local file cleanup in the background
    background_tasks.add_task(delete_document_resources, filename)
    
    return {
        "status": "success",
        "message": "Document deleted successfully."
    }
