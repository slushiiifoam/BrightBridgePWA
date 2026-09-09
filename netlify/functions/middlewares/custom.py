# app/api/middleware/security.py
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

"""
Middlware class for adding secure response headers
"""
class SecureResponseMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Allow the request to travel down to the router endpoint
        response = await call_next(request)
        
        # Inject your strict security headers onto the outgoing response
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Content-Security-Policy"] = "default-src 'none'"

        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response

class MonitoringMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        url = request.url.path
        ignored_endpoints = {"/metrics", "/", "/health"}

        if url in ignored_endpoints:
            return await call_next(request)

        try:
            response = await call_next(request)
            return response
        except Exception as e:
            raise