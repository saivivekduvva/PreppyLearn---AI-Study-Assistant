import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.utils.logger import logger

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log request
        logger.info(f"Incoming Request: {request.method} {request.url.path}")
        
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            
            # Log response
            logger.info(
                f"Completed Request: {request.method} {request.url.path} "
                f"- Status: {response.status_code} "
                f"- Duration: {process_time:.4f}s"
            )
            return response
            
        except Exception as e:
            process_time = time.time() - start_time
            logger.error(
                f"Failed Request: {request.method} {request.url.path} "
                f"- Error: {str(e)} "
                f"- Duration: {process_time:.4f}s"
            )
            raise e
