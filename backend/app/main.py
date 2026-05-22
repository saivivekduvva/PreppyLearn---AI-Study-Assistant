from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import get_settings
from app.api.routers import health, documents, rag, vectorstore

settings = get_settings()

def create_app() -> FastAPI:
    """
    Factory function to create the FastAPI application instance.
    This allows for easier testing and modularity.
    """
    app = FastAPI(
        title=settings.APP_NAME,
        description="Backend API for the AI-powered study assistant",
        version="0.1.0",
        openapi_url=f"{settings.API_V1_STR}/openapi.json"
    )

    # Configure CORS - adjust origins for production!
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"], # In production, replace with specific domains
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    # The health check is mounted at the root and API prefix
    app.include_router(health.router, prefix="/health", tags=["Health"])
    
    # Example of including an API router
    # app.include_router(study.router, prefix=f"{settings.API_V1_STR}/study", tags=["Study"])
    
    app.include_router(documents.router, prefix=f"{settings.API_V1_STR}/documents", tags=["Documents"])
    app.include_router(rag.router, prefix=f"{settings.API_V1_STR}/rag", tags=["RAG"])
    app.include_router(vectorstore.router, prefix=f"{settings.API_V1_STR}/vectorstore", tags=["Vector Store"])

    return app

app = create_app()

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint providing basic API info."""
    return {
        "message": f"Welcome to the {settings.APP_NAME}",
        "docs": "/docs",
        "health": "/health"
    }
