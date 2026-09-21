from fastapi import APIRouter, Depends, status, Request, Cookie
from typing import Annotated

from infrastructure.ratelimiter import limiter
from infrastructure.jwt_provider import Jwt_Manager

router = APIRouter(prefix='/resources')

@limiter.limit("10/minute")
@router.get("/", staus_code=status.HTTP_200_OK)
def health():
    return {"detail":"resources router is healthy"}

@limiter.limit("10/minute")
@router.get("/retrieve", status_code=status.HTTP_200_OK)
def retrieve_resrouces(request : Request):

    #resources = resource_service.retrieve_resources(limit=12)

    return {}

@limiter.limit("10/minute")
@router.get("/upsert", status_code=status.HTTP_200_OK)
def upsert_resources(request : Request):
    user = request.state.user

    #if user is in editors or admins, let their changes go through
    #otherwise raise an unauthorized error

    return {}

@limiter.limit("10/minute")
@router.delete("/delete", status_code=status.HTTP_200_OK)
def delete_resources(request : Request):

    #if the user is an editor or admin, let their games go through
    #otherwise, raise and unauthorized error

    return {}