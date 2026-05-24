from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List
from app.services.llm_service import GeminiLLMService
from pydantic import BaseModel, Field
from typing import List
from app.rag.chunker import SemanticChunker
from app.services.embedding_service import EmbeddingService
from app.utils.logger import logger
from app.models.user import User
from app.api.deps import get_current_user

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
async def generate_chunks(request: ChunkRequest, current_user: User = Depends(get_current_user)):
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
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    current_user: User = Depends(get_current_user)
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
            "model": "models/text-embedding-004",
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

from app.rag.retriever import RAGRetriever

class RetrievalTestRequest(BaseModel):
    query: str = Field(..., description="The user query to test retrieval against.")
    top_k: int = Field(5, description="Number of top chunks to retrieve.")

@router.post("/test-retrieval")
async def test_retrieval(request: RetrievalTestRequest, current_user: User = Depends(get_current_user)):
    """
    Developer Utility: Test retrieval quality in the RAG pipeline.
    Displays retrieved chunks, their similarity scores, and the formulated prompt.
    Useful for debugging retrieval relevance.
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
        
    try:
        retriever = RAGRetriever()
        
        # Get context and debug chunks
        context, retrieved_chunks = retriever.retrieve_context(
            query=request.query, 
            top_k=request.top_k,
            user_id=current_user.id
        )
        
        # Build the theoretical prompt
        prompt = retriever.build_prompt(request.query, context)
        
        return {
            "status": "success",
            "message": "Retrieval test completed.",
            "data": {
                "query": request.query,
                "retrieved_chunks_count": len(retrieved_chunks),
                "chunks": retrieved_chunks,
                "generated_prompt": prompt
            }
        }
    except Exception as e:
        logger.error(f"Retrieval testing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred during retrieval test: {str(e)}")

class ChatRequest(BaseModel):
    query: str = Field(..., description="User's chat message/question.")
    top_k: int = Field(5, description="Number of top chunks to retrieve.")

@router.post("/chat")
async def chat_endpoint(request: ChatRequest, current_user: User = Depends(get_current_user)):
    """
    RAG Chat endpoint. Retrieves context from Vector DB and generates an answer using Gemini.
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
        
    retriever = RAGRetriever()
    llm_service = GeminiLLMService()
    
    # 1. Retrieve raw chunks
    _, raw_chunks = retriever.retrieve_context(query=request.query, top_k=request.top_k, user_id=current_user.id)
    
    # 2. Filter out irrelevant chunks (distance >= 0.6)
    # Cosine distance: 0.0 is exact match, 1.0+ is orthogonal/unrelated
    relevant_chunks = []
    context_list = []
    for chunk in raw_chunks:
        if chunk.get("similarity_score", 1.0) < 0.6:
            relevant_chunks.append(chunk)
            context_list.append(chunk.get("document", ""))
            
    # 3. Generate Answer
    answer = await llm_service.generate_response(prompt=request.query, context=context_list)
        
    return {
        "status": "success",
        "data": {
            "answer": answer,
            "sources": relevant_chunks
        }
    }
