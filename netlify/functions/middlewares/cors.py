from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

allowed_origins = [
    "http://localhost:8000", # If you also test locally
]

"""
Set up the cors middleware for 
"""
def setup_corsmiddleware(app : FastAPI) -> None:
    app.add_middleware(CORSMiddleware,
                        allow_origins=allowed_origins,           # Allowed domains list
                        allow_credentials=True,          # Permit cookies / auth headers
                        allow_methods=["*"],             # Allow all HTTP methods (GET, POST, etc.)
                        allow_headers=["*"],             # Allow all custom HTTP headers
                    )