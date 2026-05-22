from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.utils.logger import logger

async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """
    Handles standard HTTP exceptions and custom HTTP exceptions from our application.
    """
    logger.warning(f"HTTP Exception at {request.url.path}: {exc.detail}")
    
    # Check if the exception already provides a structured detail dict
    if isinstance(exc.detail, dict) and "code" in exc.detail:
        error_payload = exc.detail
    else:
        error_payload = {
            "code": getattr(exc, "error_code", "HTTP_ERROR"),
            "message": exc.detail
        }
        
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "error": error_payload
        }
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handles Pydantic validation errors (422 Unprocessable Entity).
    """
    logger.warning(f"Validation Error at {request.url.path}: {exc.errors()}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "status": "error",
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid request parameters.",
                "details": exc.errors()
            }
        }
    )

async def global_exception_handler(request: Request, exc: Exception):
    """
    Catch-all handler for unhandled exceptions to prevent the server from crashing 
    and to ensure we always return a standard JSON format instead of a raw 500 HTML page.
    """
    logger.error(f"Unhandled Exception at {request.url.path}: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "error",
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred. Please try again later.",
                "details": str(exc) # Consider removing this in strict production to avoid leaking info
            }
        }
    )
