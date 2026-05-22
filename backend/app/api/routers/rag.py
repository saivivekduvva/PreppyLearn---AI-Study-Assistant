from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.rag.chunker import SemanticChunker
from app.utils.logger import logger

router = APIRouter()

class ChunkRequest(BaseModel):
    text: str = Field(..., description="The raw text to be chunked.")
    chunk_size: int = Field(1000, description="Maximum characters per chunk.")
    chunk_overlap: int = Field(200, description="Number of overlapping characters between chunks.")

@router.post("/chunk")
async def generate_chunks(request: ChunkRequest):
    """
    Generate semantic chunks from extracted text.
    """
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Provided text cannot be empty.")
        
    try:
        # Initialize the chunker with requested parameters
        chunker = SemanticChunker(
            chunk_size=request.chunk_size, 
            chunk_overlap=request.chunk_overlap
        )
        
        # Generate chunks
        chunks = chunker.create_chunks(request.text)
        
        # Generate rich metadata for each chunk
        chunk_metadata = [
            {"index": i, "length": len(chunk)} 
            for i, chunk in enumerate(chunks)
        ]
        
        return {
            "status": "success",
            "message": "Text successfully chunked.",
            "data": {
                "chunk_count": len(chunks),
                "chunks": chunks,
                "metadata": chunk_metadata
            }
        }
        
    except Exception as e:
        logger.error(f"Chunking endpoint failed: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while generating semantic chunks.")
