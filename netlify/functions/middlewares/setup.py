from middlewares.cors import setup_corsmiddleware
from middlewares.custom import SecureResponseMiddleware

def setup_middlewares(app):
    setup_corsmiddleware(app)
    app.add_middleware(SecureResponseMiddleware)
