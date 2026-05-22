from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List
from app.rag.chunker import SemanticChunker
from app.services.embedding_service import EmbeddingService
from app.utils.logger import logger
from app.utils.logger import logger

router = APIRouter()

class ChunkRequest(BaseModel):
    text: str = Field(..., description="The raw text to be chunked.")
    chunk_size: int = Field(1000, description="Maximum characters per chunk.")
    chunk_overlap: int = Field(200, description="Number of overlapping characters between chunks.")

class EmbedRequest(BaseModel):
    chunks: List[str] = Field(..., description="List of text chunks to be embedded into vectors.")

def get_embedding_service():
    return EmbeddingService()

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

@router.post("/embed")
async def generate_embeddings(
    request: EmbedRequest,
    embedding_service: EmbeddingService = Depends(get_embedding_service)
):
    """
    Generate dense vector embeddings for a list of semantic chunks.
    """
    if not request.chunks:
        raise HTTPException(status_code=400, detail="Chunks list cannot be empty.")
        
    try:
        embeddings = embedding_service.generate_embeddings(request.chunks)
        
        # Metadata generation
        embedding_metadata = {
            "model": "all-MiniLM-L6-v2",
            "vector_dimension": len(embeddings[0]) if embeddings else 0,
            "total_chunks_processed": len(request.chunks)
        }
        
        return {
            "status": "success",
            "message": "Embeddings successfully generated.",
            "data": {
                "metadata": embedding_metadata,
                "embeddings": embeddings
            }
        }
        
    except Exception as e:
        logger.error(f"Embedding endpoint failed: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while generating embeddings.")
