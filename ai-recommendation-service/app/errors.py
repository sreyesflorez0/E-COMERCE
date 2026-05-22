from fastapi import Request
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger("ai_recommendation")

async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing {request.method} {request.url.path}: {str(exc)}")
    # Be careful not to expose sensitive info in 500 errors
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error"},
    )
