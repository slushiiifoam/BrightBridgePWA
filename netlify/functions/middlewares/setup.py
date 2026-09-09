from middlewares.cors import setup_corsmiddleware
from middlewares.custom import SecureResponseMiddleware, MonitoringMiddleware

def setup_middlewares(app):
    setup_corsmiddleware(app)
    app.add_middleware(SecureResponseMiddleware)
    app.add_middleware(MonitoringMiddleware)