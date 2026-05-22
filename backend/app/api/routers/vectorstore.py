from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from app.utils.logger import logger
from app.vectorstore.chroma_client import ChromaClient

router = APIRouter()

# Dependency to get ChromaClient
def get_chroma_client():
    return ChromaClient()

@router.get("/count")
async def get_collection_count(client: ChromaClient = Depends(get_chroma_client)):
    """
    Returns the total number of items stored in the vector database collection.
    """
    try:
        count = client.collection.count()
        return {"status": "success", "count": count}
    except Exception as e:
        logger.error(f"Error fetching collection count: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get collection count: {str(e)}"
        )

class StoreEmbeddingsRequest(BaseModel):
    ids: List[str] = Field(..., description="List of unique IDs for the chunks")
    embeddings: List[List[float]] = Field(..., description="List of vector embeddings")
    documents: List[str] = Field(..., description="List of text chunks corresponding to embeddings")
    metadatas: Optional[List[Dict[str, Any]]] = Field(None, description="Optional metadata for each chunk")

class SimilaritySearchRequest(BaseModel):
    query_embeddings: List[List[float]] = Field(..., description="Vector embeddings of the query")
    n_results: int = Field(5, description="Number of top results to return")
    where: Optional[Dict[str, Any]] = Field(None, description="Optional metadata filter")

@router.post("/store", status_code=status.HTTP_201_CREATED)
async def store_embeddings(
    request: StoreEmbeddingsRequest, 
    client: ChromaClient = Depends(get_chroma_client)
):
    """
    Stores embeddings, corresponding text chunks, and metadata in the vector database.
    """
    # Validation checks
    if not (len(request.ids) == len(request.embeddings) == len(request.documents)):
        logger.error("Length mismatch in store_embeddings request payload.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="The lengths of ids, embeddings, and documents must be equal."
        )
    
    if request.metadatas and len(request.metadatas) != len(request.ids):
        logger.error("Length mismatch in metadatas payload.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="The length of metadatas must match the length of ids."
        )

    try:
        success = client.store_embeddings(
            ids=request.ids,
            embeddings=request.embeddings,
            documents=request.documents,
            metadatas=request.metadatas
        )
        if success:
            return {
                "status": "success",
                "message": f"Successfully stored {len(request.ids)} embeddings."
            }
    except Exception as e:
        logger.error(f"Endpoint error storing embeddings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to store embeddings: {str(e)}"
        )

@router.post("/search")
async def similarity_search(
    request: SimilaritySearchRequest, 
    client: ChromaClient = Depends(get_chroma_client)
):
    """
    Retrieves similar chunks based on provided query embeddings.
    """
    if not request.query_embeddings:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Query embeddings cannot be empty."
        )

    try:
        results = client.similarity_search(
            query_embeddings=request.query_embeddings,
            n_results=request.n_results,
            where=request.where
        )
        
        # Format response into a structured JSON
        formatted_results = []
        if results and "ids" in results and results["ids"]:
            for q_idx in range(len(results["ids"])):
                q_results = []
                for i in range(len(results["ids"][q_idx])):
                    item = {
                        "id": results["ids"][q_idx][i],
                        "document": results["documents"][q_idx][i] if results.get("documents") else None,
                        "metadata": results["metadatas"][q_idx][i] if results.get("metadatas") else None,
                        "similarity_score": results["distances"][q_idx][i] if results.get("distances") else None
                    }
                    q_results.append(item)
                formatted_results.append(q_results)
                
        # If there's only one query embedding, unwrap the outer list
        if len(formatted_results) == 1:
            formatted_results = formatted_results[0]

        return {
            "status": "success",
            "results": formatted_results
        }
    except Exception as e:
        logger.error(f"Endpoint error in similarity search: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to perform similarity search: {str(e)}"
        )
