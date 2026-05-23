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
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7" # Example key
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Cloud Databases
    DATABASE_URL: str = "" # e.g. postgresql://user:pass@host/db
    PINECONE_API_KEY: str = ""
    PINECONE_INDEX_NAME: str = "preppylearn"

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    """
    Returns a cached instance of the settings.
    lru_cache ensures we don't read the .env file multiple times.
    """
    return Settings()
