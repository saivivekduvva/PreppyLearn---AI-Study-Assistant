from typing import List, Dict, Any, Optional
from pinecone import Pinecone, ServerlessSpec
from app.utils.logger import logger
from app.utils.exceptions import VectorDBException
from app.config.settings import get_settings

settings = get_settings()

class PineconeClient:
    def __init__(self, index_name: str = "preppylearn"):
        """
        Initializes the Pinecone client and gets/creates the index.
        """
        self.index_name = settings.PINECONE_INDEX_NAME or index_name
        self.api_key = settings.PINECONE_API_KEY
        
        if not self.api_key:
            logger.warning("PINECONE_API_KEY is not set. Vector DB operations will fail.")
            return

        try:
            self.pc = Pinecone(api_key=self.api_key)
            
            # Check if index exists, create if not
            existing_indexes = [index_info["name"] for index_info in self.pc.list_indexes()]
            
            if self.index_name not in existing_indexes:
                logger.info(f"Creating new Pinecone index: {self.index_name}")
                self.pc.create_index(
                    name=self.index_name,
                    dimension=768, # Gemini embedding dimension
                    metric="cosine",
                    spec=ServerlessSpec(
                        cloud="aws",
                        region="us-east-1"
                    )
                )
            
            self.index = self.pc.Index(self.index_name)
            logger.info(f"Initialized Pinecone client with index: {self.index_name}")
        except Exception as e:
            logger.error(f"Failed to initialize Pinecone client: {str(e)}")
            raise VectorDBException(detail=f"Failed to initialize Pinecone client: {str(e)}")

    def store_embeddings(
        self, 
        ids: List[str], 
        embeddings: List[List[float]], 
        documents: List[str], 
        metadatas: Optional[List[Dict[str, Any]]] = None
    ) -> bool:
        """
        Stores embeddings, corresponding text chunks, and metadata in Pinecone.
        """
        if not hasattr(self, 'index'):
            raise VectorDBException(detail="Pinecone client not properly initialized. Check API key.")
            
        try:
            logger.info(f"Storing {len(ids)} embeddings in Pinecone...")
            
            vectors = []
            for i in range(len(ids)):
                # Pinecone stores metadata, so we put the document text inside the metadata
                meta = metadatas[i] if metadatas and i < len(metadatas) else {}
                meta["text"] = documents[i]
                
                vectors.append({
                    "id": ids[i],
                    "values": embeddings[i],
                    "metadata": meta
                })
                
            # Upsert in batches of 100 to avoid request limits
            batch_size = 100
            for i in range(0, len(vectors), batch_size):
                self.index.upsert(vectors=vectors[i:i + batch_size])
                
            logger.info("Successfully stored embeddings in Pinecone.")
            return True
        except Exception as e:
            logger.error(f"Error storing embeddings in Pinecone: {str(e)}")
            raise VectorDBException(detail=str(e))

    def similarity_search(
        self, 
        query_embeddings: List[List[float]], 
        n_results: int = 5,
        where: Optional[Dict[str, Any]] = None
    ) -> dict:
        """
        Performs a similarity search using query embeddings.
        """
        if not hasattr(self, 'index'):
            raise VectorDBException(detail="Pinecone client not properly initialized. Check API key.")
            
        try:
            logger.info(f"Performing similarity search for top {n_results} results...")
            
            # Pinecone queries one vector at a time typically. We assume query_embeddings has 1 item.
            query_vector = query_embeddings[0]
            
            results = self.index.query(
                vector=query_vector,
                top_k=n_results,
                include_metadata=True,
                filter=where
            )
            
            # Format the results to match ChromaDB's format for compatibility with the rest of the app
            formatted_results = {
                "ids": [[match.id for match in results.matches]],
                "distances": [[match.score for match in results.matches]],
                "metadatas": [[match.metadata for match in results.matches]],
                "documents": [[match.metadata.get("text", "") for match in results.matches]]
            }
            
            logger.info("Similarity search completed successfully.")
            return formatted_results
        except Exception as e:
            logger.error(f"Error performing similarity search in Pinecone: {str(e)}")
            raise VectorDBException(detail=str(e))

    def delete_collection(self) -> None:
        """Deletes the entire index (use with caution)."""
        try:
            logger.warning(f"Deleting Pinecone index: {self.index_name}")
            self.pc.delete_index(self.index_name)
        except Exception as e:
            logger.error(f"Error deleting Pinecone index: {str(e)}")
            raise VectorDBException(detail=str(e))
