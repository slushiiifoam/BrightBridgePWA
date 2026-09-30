from fastapi import APIRouter, Depends, status, Request
from typing import Annotated
from pydantic import BaseModel

from infrastructure.ratelimiter import limiter

from services.privileges import Privileges_Service

"""
The body for granting or revoking a privilege
"""
class Privilege_Body(BaseModel):
    target_uuid: str
    role: str  # "admin" or "editor"

router = APIRouter(prefix='/privileges')

def get_privileges_service(request: Request):
    return request.app.state.privileges_service

def get_user(request: Request):
    return request.state.user

"""
Endpoint for checking the health of the router
"""
@limiter.limit("10/minute")
@router.get("/", status_code=status.HTTP_200_OK)
def health():
    return {"detail": "privileges router is healthy"}

"""
Endpoint for getting the calling user's own role
"""
@limiter.limit("10/minute")
@router.get("/me", status_code=status.HTTP_200_OK)
def get_my_role(request: Request,
                 user: Annotated[str, Depends(get_user)],
                 privileges_service: Annotated[Privileges_Service, Depends(get_privileges_service)]):

    role = privileges_service.get_role(user)
    return {"uuid": user, "role": role}

"""
Endpoint for granting a privilege to another user. Caller must already be an admin.
"""
@limiter.limit("10/minute")
@router.post("/grant", status_code=status.HTTP_200_OK)
def grant_privilege(request: Request,
                     body: Privilege_Body,
                     user: Annotated[str, Depends(get_user)],
                     privileges_service: Annotated[Privileges_Service, Depends(get_privileges_service)]):

    result = privileges_service.grant_privilege(user, body.target_uuid, body.role)
    return {"status": result}

"""
Endpoint for revoking a privilege from another user. Caller must already be an admin.
"""
@limiter.limit("10/minute")
@router.post("/revoke", status_code=status.HTTP_200_OK)
def revoke_privilege(request: Request,
                      body: Privilege_Body,
                      user: Annotated[str, Depends(get_user)],
                      privileges_service: Annotated[Privileges_Service, Depends(get_privileges_service)]):

    result = privileges_service.revoke_privilege(user, body.target_uuid, body.role)
    return {"status": result}
