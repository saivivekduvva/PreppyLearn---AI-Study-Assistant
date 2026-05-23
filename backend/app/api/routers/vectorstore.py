from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from app.utils.logger import logger
from app.vectorstore.pinecone_client import PineconeClient
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()

# Dependency to get PineconeClient
def get_pinecone_client():
    return PineconeClient()

@router.get("/count")
async def get_collection_count(client: PineconeClient = Depends(get_pinecone_client), current_user: User = Depends(get_current_user)):
    """
    Returns the total number of items stored in the vector database collection.
    """
    try:
        # Pinecone index stats
        stats = client.index.describe_index_stats()
        count = stats.total_vector_count
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
    client: PineconeClient = Depends(get_pinecone_client),
    current_user: User = Depends(get_current_user)
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

    # Inject user_id into metadatas
    if request.metadatas is None:
        request.metadatas = [{"user_id": current_user.id} for _ in request.ids]
    else:
        for meta in request.metadatas:
            meta["user_id"] = current_user.id

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
    client: PineconeClient = Depends(get_pinecone_client),
    current_user: User = Depends(get_current_user)
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
        # Inject user_id into where filter
        where_filter = request.where or {}
        where_filter["user_id"] = current_user.id

        results = client.similarity_search(
            query_embeddings=request.query_embeddings,
            n_results=request.n_results,
            where=where_filter
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
