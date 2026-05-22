from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import json
from app.services.llm_service import GeminiLLMService
from app.utils.logger import logger

router = APIRouter()

class SummaryRequest(BaseModel):
    text: str = Field(..., description="The source text to summarize.")
    summary_type: str = Field("short", description="The type of summary: short, detailed, or exam.")

class GenerateRequest(BaseModel):
    text: str = Field(..., description="The source text to generate from.")

@router.post("/summary")
async def generate_summary(request: SummaryRequest):
    """Generates a text summary using the LLM."""
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Provided text cannot be empty.")
        
    llm_service = GeminiLLMService()
    summary = await llm_service.generate_summary(request.text, request.summary_type)
    return {
        "status": "success",
        "data": {
            "summary": summary
        }
    }

@router.post("/flashcards")
async def generate_flashcards(request: GenerateRequest):
    """Generates structured JSON flashcards."""
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Provided text cannot be empty.")
        
    llm_service = GeminiLLMService()
    json_str = await llm_service.generate_structured_flashcards(request.text)
    
    # Parse the JSON string from Gemini back into Python dicts so FastAPI can serialize it cleanly
    flashcards = json.loads(json_str)
    
    return {
        "status": "success",
        "data": {
            "flashcards": flashcards
        }
    }

@router.post("/mcq")
async def generate_mcq(request: GenerateRequest):
    """Generates structured JSON MCQs."""
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Provided text cannot be empty.")
        
    llm_service = GeminiLLMService()
    json_str = await llm_service.generate_structured_mcqs(request.text)
    
    # Parse the JSON string from Gemini
    mcqs = json.loads(json_str)
    
    return {
        "status": "success",
        "data": {
            "mcqs": mcqs
        }
    }
