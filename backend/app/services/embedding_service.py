from app.utils.logger import logger
from app.utils.exceptions import EmbeddingGenerationException
from typing import List

class EmbeddingService:
    _model = None  # Class-level model variable for lazy-loading (Singleton pattern)

    @classmethod
    def get_model(cls):
        """
        Lazy-loads the sentence-transformers model.
        This ensures that the massive Torch/Transformers libraries and the model weights
        are only loaded into memory when the very first embedding request hits the server,
        rather than blocking the server's initial startup sequence.
        """
        if cls._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                logger.info("Lazy-loading embedding model 'all-MiniLM-L6-v2'. This might take a moment on first run...")
                
                # all-MiniLM-L6-v2 is an incredibly fast, lightweight, and highly effective model for semantic search
                cls._model = SentenceTransformer('all-MiniLM-L6-v2')
                
                logger.info("Embedding model loaded successfully into memory.")
            except ImportError:
                logger.error("sentence-transformers is not installed. Please add it to requirements.")
                raise EmbeddingGenerationException(detail="sentence-transformers module not found.")
            except Exception as e:
                logger.error(f"Failed to load embedding model: {str(e)}")
                raise EmbeddingGenerationException(detail=f"Failed to load embedding model: {str(e)}")
        return cls._model

    def generate_embeddings(self, chunks: List[str]) -> List[List[float]]:
        """
        Generates vector embeddings for a list of text chunks.
        """
        if not chunks:
            logger.warning("Empty chunk list provided to embedding service.")
            return []
            
        try:
            model = self.get_model()
            logger.info(f"Generating vector embeddings for {len(chunks)} chunks...")
            
            # SentenceTransformer.encode returns numpy arrays. 
            # We convert them to standard Python lists for JSON serialization.
            embeddings = model.encode(chunks, show_progress_bar=False)
            
            logger.info("Successfully generated embeddings.")
            return embeddings.tolist()
            
        except Exception as e:
            logger.error(f"Error generating embeddings: {str(e)}")
            raise EmbeddingGenerationException()
