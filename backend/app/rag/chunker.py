from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.utils.logger import logger

class SemanticChunker:
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        """
        Initializes the Semantic Chunker using LangChain's RecursiveCharacterTextSplitter.
        
        ---
        Why Chunk Overlap?
        Chunk overlap (e.g., 200 characters) acts as a safety net. If an important sentence 
        or paragraph gets cleanly sliced at the boundary of a chunk, the overlap ensures 
        that the surrounding context bleeds into both the preceding and succeeding chunks. 
        This prevents the AI from losing the meaning of split sentences.
        
        Semantic Retrieval Benefits:
        By breaking massive documents into smaller, cohesive chunks (~1000 chars), 
        the resulting Vector Embeddings become highly concentrated and specific. 
        When a user asks a question, the vector database can retrieve the exact paragraph 
        containing the answer, rather than retrieving an entire vague page, 
        drastically reducing LLM hallucination and token costs.
        ---
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        
        # The Recursive splitter tries to split by paragraphs first, then sentences, then words
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", "? ", "! ", " ", ""],
            is_separator_regex=False,
        )

    def create_chunks(self, text: str) -> list[str]:
        """
        Takes raw text and splits it into a list of semantic chunks.
        """
        try:
            logger.info(f"Splitting text into chunks (size={self.chunk_size}, overlap={self.chunk_overlap})...")
            
            if not text.strip():
                logger.warning("Empty text provided to chunker.")
                return []
                
            chunks = self.splitter.split_text(text)
            
            logger.info(f"Successfully created {len(chunks)} chunks.")
            return chunks
            
        except Exception as e:
            logger.error(f"Error during semantic chunking: {str(e)}")
            raise
