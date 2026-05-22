from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def health_check():
    """
    Basic health check endpoint.
    Used by load balancers and orchestrators to ensure the API is running.
    """
    return {
        "status": "ok",
        "message": "Service is healthy"
    }
