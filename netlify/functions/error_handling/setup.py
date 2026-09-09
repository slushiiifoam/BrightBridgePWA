from fastapi import  HTTPException
from pydantic import ValidationError

from error_handling.general_error_handlers import exception_handler, runtime_error_handler, http_exception_handler, validation_error_handler

def setup_error_handlers(app):

    errors = [
        (ValidationError, validation_error_handler),
        (Exception, exception_handler),
        (RuntimeError, runtime_error_handler),
        (HTTPException, http_exception_handler),
    ]

    for error in errors:
        app.add_exception_handler(error[0], error[1])