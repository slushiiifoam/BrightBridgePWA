from routers.auth import router as auth_router
from routers.resources import router as resource_router
from routers.test import router as test_router

from infrastructure.cookie_processor import verify_auth_cookie

from fastapi import Depends

"""
Setup routers for fastapi app
"""
def setup_routers(app):
    public_routers = [auth_router]

    protected_routers = [resource_router, test_router]

    for router in public_routers:
        app.include_router(router)

    for router in protected_routers:
        app.include_router(router, dependencies=[Depends(verify_auth_cookie)])
