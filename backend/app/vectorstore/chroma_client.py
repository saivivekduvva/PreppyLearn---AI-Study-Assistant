import chromadb
from chromadb.config import Settings as ChromaSettings
from typing import List, Dict, Any, Optional
from app.utils.logger import logger

class ChromaClient:
    def __init__(self, collection_name: str = "documents"):
        """
        Initializes the ChromaDB client and gets/creates the collection.
        Uses persistent storage in the 'chroma_data' directory.
        """
        try:
            self.client = chromadb.PersistentClient(path="./chroma_data")
            self.collection = self.client.get_or_create_collection(
                name=collection_name,
                metadata={"hnsw:space": "cosine"} # Using cosine similarity
            )
            logger.info(f"Initialized ChromaDB client with collection: {collection_name}")
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB client: {str(e)}")
            raise e

    def store_embeddings(
        self, 
        ids: List[str], 
        embeddings: List[List[float]], 
        documents: List[str], 
        metadatas: Optional[List[Dict[str, Any]]] = None
    ) -> bool:
        """
        Stores embeddings, corresponding text chunks, and metadata in ChromaDB.
        """
        try:
            logger.info(f"Storing {len(ids)} embeddings in ChromaDB...")
            self.collection.add(
                ids=ids,
                embeddings=embeddings,
                documents=documents,
                metadatas=metadatas
            )
            logger.info("Successfully stored embeddings in ChromaDB.")
            return True
        except Exception as e:
            logger.error(f"Error storing embeddings in ChromaDB: {str(e)}")
            raise e

    def similarity_search(
        self, 
        query_embeddings: List[List[float]], 
        n_results: int = 5,
        where: Optional[Dict[str, Any]] = None
    ) -> dict:
        """
        Performs a similarity search using query embeddings.
        """
        try:
            logger.info(f"Performing similarity search for top {n_results} results...")
            results = self.collection.query(
                query_embeddings=query_embeddings,
                n_results=n_results,
                where=where
            )
            logger.info("Similarity search completed successfully.")
            return results
        except Exception as e:
            logger.error(f"Error performing similarity search in ChromaDB: {str(e)}")
            raise e

    def delete_collection(self) -> None:
        """Deletes the entire collection (use with caution)."""
        try:
            logger.warning(f"Deleting collection: {self.collection.name}")
            self.client.delete_collection(self.collection.name)
        except Exception as e:
            logger.error(f"Error deleting collection: {str(e)}")
            raise e
