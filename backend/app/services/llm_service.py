import google.generativeai as genai
from app.config.settings import get_settings
from app.utils.logger import logger
from app.utils.exceptions import LLMServiceException

class GeminiLLMService:
    def __init__(self):
        self.settings = get_settings()
        self.api_key = self.settings.GEMINI_API_KEY
        
        if not self.api_key:
            logger.warning("GEMINI_API_KEY is not set in environment variables.")
        else:
            genai.configure(api_key=self.api_key)
            logger.info("Gemini LLM Service initialized successfully.")
            
        # Default model for standard text generation tasks
        self.model_name = "gemini-flash-lite-latest"

    async def generate_response(self, prompt: str, context: list[str] = None) -> str:
        """
        Generates an AI response based on a prompt and optional context.
        """
        try:
            if not self.api_key:
                raise LLMServiceException(detail="Gemini API Key is missing. Please configure your .env file.")
                
            model = genai.GenerativeModel(self.model_name)
            
            # Construct the final prompt if context is provided
            if context and len(context) > 0:
                context_str = "\n\n".join(context)
                final_prompt = (
                    f"You are a helpful AI Study Assistant. Context information is below.\n"
                    f"---------------------\n"
                    f"{context_str}\n"
                    f"---------------------\n"
                    f"Given the context information and not prior knowledge, answer the query.\n"
                    f"Query: {prompt}\n"
                    f"Answer: "
                )
            else:
                final_prompt = (
                    f"You are a helpful AI Study Assistant. The user asked a question, but no relevant context was found in their uploaded documents.\n"
                    f"If the user is just saying hello, greeting you, or making small talk, respond politely and conversationally.\n"
                    f"If the user is asking a factual question or for information, politely inform them that the answer cannot be found in the uploaded documents.\n"
                    f"Query: {prompt}\n"
                    f"Answer: "
                )

            logger.info(f"Generating response using {self.model_name}...")
            
            # Note: We use the synchronous generate_content because the current
            # genai python SDK's async support can be tricky depending on the version.
            # For a production robust system, wrapping in a threadpool is best, 
            # but this native call is standard.
            response = model.generate_content(final_prompt)
            
            logger.info("Successfully generated AI response.")
            return response.text
            
        except Exception as e:
            logger.error(f"Error generating response from Gemini API: {str(e)}")
            raise LLMServiceException(detail=f"An error occurred while generating the response: {str(e)}")

    async def generate_summary(self, text: str, summary_type: str = "short") -> str:
        """
        Generates a summary of the provided text based on the requested type.
        """
        try:
            if not self.api_key:
                raise LLMServiceException(detail="Gemini API Key is missing. Please configure your .env file.")
                
            model = genai.GenerativeModel(self.model_name)
            
            prompts = {
                "short": "Provide a concise, 3-5 sentence summary of the following text focusing strictly on the main ideas.",
                "detailed": "Provide a comprehensive, highly detailed summary of the following text, broken down by key themes or sections.",
                "exam": "Convert the following text into highly structured exam revision notes. Use bullet points, highlight key terms, and emphasize concepts likely to be tested."
            }
            
            system_instruction = prompts.get(summary_type, prompts["short"])
            final_prompt = f"{system_instruction}\n\nText to summarize:\n{text}"
            
            logger.info(f"Generating {summary_type} summary...")
            response = model.generate_content(final_prompt)
            return response.text
            
        except Exception as e:
            logger.error(f"Error generating summary: {str(e)}")
            raise LLMServiceException(detail=str(e))

    async def generate_structured_flashcards(self, text: str) -> str:
        """
        Generates structured JSON flashcards from text.
        Returns a JSON string containing an array of {question, answer} objects.
        """
        try:
            if not self.api_key:
                raise LLMServiceException(detail="API Key is missing.")
                
            model = genai.GenerativeModel(
                self.model_name,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json"
                )
            )
            
            prompt = (
                "You are an expert study assistant. Generate exactly 10 highly effective study flashcards "
                "based on the following text. "
                "Return the response strictly as a JSON array of objects, where each object has "
                "'question' and 'answer' string fields.\n\n"
                f"Text:\n{text}"
            )
            
            logger.info("Generating structured JSON flashcards...")
            response = model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            logger.error(f"Error generating flashcards: {str(e)}")
            raise LLMServiceException(detail=str(e))

    async def generate_structured_mcqs(self, text: str) -> str:
        """
        Generates structured JSON multiple choice questions from text.
        Returns a JSON string containing an array of {question, options[], correct_answer} objects.
        """
        try:
            if not self.api_key:
                raise LLMServiceException(detail="API Key is missing.")
                
            model = genai.GenerativeModel(
                self.model_name,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json"
                )
            )
            
            prompt = (
                "You are an expert examiner. Generate exactly 5 challenging multiple-choice questions "
                "based on the following text to test deep understanding. "
                "Return the response strictly as a JSON array of objects, where each object has: "
                "'question' (string), 'options' (array of 4 distinct strings), and 'correct_answer' "
                "(string, must exactly match one of the options).\n\n"
                f"Text:\n{text}"
            )
            
            logger.info("Generating structured JSON MCQs...")
            response = model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            logger.error(f"Error generating MCQs: {str(e)}")
            raise LLMServiceException(detail=str(e))
