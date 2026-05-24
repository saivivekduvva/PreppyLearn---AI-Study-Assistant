from app.utils.logger import logger
from app.utils.exceptions import EmbeddingGenerationException
from app.config.settings import get_settings
from typing import List
import google.generativeai as genai

class EmbeddingService:
    def __init__(self):
        self.settings = get_settings()
        self.api_key = self.settings.GEMINI_API_KEY
        
        if not self.api_key:
            logger.warning("GEMINI_API_KEY is not set in environment variables.")
        else:
            genai.configure(api_key=self.api_key)
            logger.info("Gemini Embedding Service initialized successfully.")
            
        # Standard Gemini embedding model compatible with google-generativeai
        self.model_name = "models/gemini-embedding-2"

    def generate_embeddings(self, chunks: List[str]) -> List[List[float]]:
        """
        Generates vector embeddings for a list of text chunks using Gemini.
        """
        if not chunks:
            logger.warning("Empty chunk list provided to embedding service.")
            return []
            
        try:
            if not self.api_key:
                raise EmbeddingGenerationException(detail="Gemini API Key is missing.")
                
            logger.info(f"Generating vector embeddings for {len(chunks)} chunks using {self.model_name}...")
            
            # Use the Gemini API to embed the chunks
            response = genai.embed_content(
                model=self.model_name,
                content=chunks,
                task_type="retrieval_document"
            )
            
            # The API returns a dictionary where 'embedding' contains the list of vectors
            embeddings = response['embedding']
            
            logger.info("Successfully generated embeddings.")
            return embeddings
            
        except Exception as e:
            logger.error(f"Error generating embeddings with Gemini: {str(e)}")
            raise EmbeddingGenerationException(detail=str(e))
