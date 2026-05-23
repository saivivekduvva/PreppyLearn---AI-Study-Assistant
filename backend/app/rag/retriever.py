from typing import List, Dict, Any, Tuple
from app.services.embedding_service import EmbeddingService
from app.vectorstore.pinecone_client import PineconeClient
from app.utils.logger import logger

class RAGRetriever:
    """
    RAG (Retrieval-Augmented Generation) Workflow Explanation:
    1. A user asks a question.
    2. Semantic Retrieval: We convert this question into a vector (embedding) and 
       search our vector database (Pinecone) for the closest matching chunks of knowledge.
       This is an "embedding-based search", meaning we search by meaning rather than exact keywords.
    3. Hallucination Reduction: By feeding these retrieved, factual chunks to the LLM 
       as 'context', we anchor the AI to reality and drastically reduce hallucinations.
    4. Prompt Building: We inject this context into a structured prompt before sending it to the LLM.
    """
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.vector_store = PineconeClient()

    def retrieve_context(self, query: str, top_k: int = 5, user_id: int = None) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Executes embedding-based search to find contextually relevant information.
        Returns the formatted context string and the raw retrieved chunks for debugging.
        """
        logger.info(f"Retrieving context for query: {query}")
        
        try:
            # Step 1: Embed user query
            # We must convert the textual query into the same mathematical space as our chunks
            query_embeddings = self.embedding_service.generate_embeddings([query])
            
            if not query_embeddings:
                logger.warning("Failed to generate embeddings for query.")
                return "", []

            # Step 2: Retrieve relevant chunks
            # We search for the nearest neighbors in high-dimensional space
            where_filter = {"user_id": user_id} if user_id else None
            
            search_results = self.vector_store.similarity_search(
                query_embeddings=query_embeddings,
                n_results=top_k,
                where=where_filter
            )

            raw_chunks = []
            context_pieces = []
            
            # Format the raw chunks for our testing utilities
            if search_results and "ids" in search_results and search_results["ids"]:
                # We only have one query, so we look at index 0
                for i in range(len(search_results["ids"][0])):
                    doc_text = search_results["documents"][0][i] if search_results.get("documents") else ""
                    metadata = search_results["metadatas"][0][i] if search_results.get("metadatas") else {}
                    score = search_results["distances"][0][i] if search_results.get("distances") else 0.0
                    
                    chunk_data = {
                        "id": search_results["ids"][0][i],
                        "document": doc_text,
                        "metadata": metadata,
                        "similarity_score": score
                    }
                    raw_chunks.append(chunk_data)
                    
                    # Step 3: Build contextual prompt pieces
                    # Prefixing each piece of context cleanly
                    context_pieces.append(f"--- Document Snippet ---\n{doc_text}\n")
            
            # Combine the pieces into a single context block
            combined_context = "\n".join(context_pieces)
            logger.info(f"Successfully retrieved {len(raw_chunks)} relevant chunks.")
            
            return combined_context, raw_chunks

        except Exception as e:
            logger.error(f"Error during context retrieval: {str(e)}")
            raise e

    def build_prompt(self, query: str, context: str) -> str:
        """
        Builds the final prompt combining the context and the user's query.
        """
        # This prompt structure instructs the LLM to rely strictly on the provided context
        prompt = f"""You are an AI Study Assistant. Answer the user's question based strictly on the context provided below. 
If the context does not contain the answer, say "I don't have enough information in the uploaded documents to answer this."

Context:
{context}

User Question: {query}
Answer:"""
        return prompt
