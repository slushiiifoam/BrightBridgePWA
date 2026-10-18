from fastapi import Request, status, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exception_handlers import http_exception_handler
from pydantic import ValidationError

import logging

logger = logging.getLogger(__name__)

"""
Global error handler for miscellaneous, uncategorized errors
"""
def exception_handler(request: Request, e : Exception):
    logger.critical(f"An unexpected error has occured during runtime: {str(e)}")

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail" : "There was an unexpected runtime error"}
    )

"""
Global error handler for runtime errors
"""
def runtime_error_handler(request: Request, e : RuntimeError):
    logger.error(f"A runtime error has triggered: {str(e)}")

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail" : "A rntime error has triggered"}
    )

"""
Global error handler for HTTP exceptions
"""
async def http_exception_handler(request: Request, e: HTTPException):
    # Just let FastAPI handle it normally so 401s, 404s, etc., stay intact
    logger.error(f"HTTPException detected! {str(e)}")
    return await http_exception_handler(request, exc)

"""
Global error handler for validation errors
"""
def validation_error_handler(request: Request, e: ValidationError):
    logger.error(f"Invalid datatypes! {str(e)}")

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail" : "Invalid datatypes were detected in your request"}
    )