from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    """
    Application settings and configuration.
    Uses pydantic_settings to load from environment variables or .env file.
    """
    APP_NAME: str = "AI Study Assistant API"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    
    # Add your specific configurations here, e.g., API keys, DB URLs
    GEMINI_API_KEY: str = ""
    # VECTOR_DB_URL: str = ""

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    """
    Returns a cached instance of the settings.
    lru_cache ensures we don't read the .env file multiple times.
    """
    return Settings()
