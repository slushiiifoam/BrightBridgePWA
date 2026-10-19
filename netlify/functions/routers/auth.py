import logging
from datetime import datetime, timezone
import uuid

from fastapi import APIRouter, Request, status, HTTPException, Depends, BackgroundTasks, Response, Cookie
from pydantic import ValidationError

from typing import Annotated

from infrastructure.jwt_provider import Jwt_Manager

from schemas.auth import ChangePasswordInfo

from services.auth import Auth_Service

from pydantic import BaseModel

class GetJWT(BaseModel):
    email : str

from infrastructure.ratelimiter import limiter

router = APIRouter(prefix='/auth')
logger = logging.getLogger(__name__)

def log_user_activity(email: str, action: str):
    logger.info(f"{datetime.now(timezone.utc)}: User {email} has {action}")

def get_auth_service(request : Request) -> Auth_Service:
    return request.app.state.auth_service

def get_jwt_manager(request : Request) -> Jwt_Manager:
    return request.app.state.jwt_manager

"""
Route for logging in users
"""
@router.post("/getJWTTokens", status_code=status.HTTP_200_OK)
@limiter.limit("10/minute")
async def getJWT(login_info : GetJWT, 
                background_tasks: BackgroundTasks, 
                auth_service: Annotated[Auth_Service, Depends(get_auth_service)],
                request: Request,
                response: Response):
          
    jwt = auth_service.create_jwt(login_info.email)

    background_tasks.add_task(log_user_activity, login_info.email, "SUCCESSFUL LOGIN")

    response.set_cookie(key="access_token",
                   value=jwt,
                   samesite="Strict",
                   secure=True,
                   httponly=True,
                   max_age=1800)

    user_uuid = auth_service.create_refresh_uuid(login_info.email)

    response.set_cookie(key="refresponseh_token",
                   value=user_uuid,
                   samesite="Strict",
                   secure=True,
                   httponly=True,
                   max_age=604800)

    return {"detail" : "users successfully authenticated"}

"""
Route for refreashing tokens
"""
@limiter.limit("10/minute")
@router.get("/refresponseh", status_code=status.HTTP_200_OK)
async def refresh_token(
    auth_service: Annotated[Auth_Service, Depends(get_auth_service)],
    request: Request,
    response: Response,
    refresponseh_token: Annotated[str | None, Cookie(alias="refresponseh_token")] = None,
):

    logger.info(f"refreash token is {refresponseh_token}")
    
    jwt = auth_service.refresh_jwt(refresponseh_token)

    response.set_cookie(key="access_token",
                    value=jwt,
                    samesite="Strict",
                    secure=True,
                    httponly=True,
                    max_age=1800)

    user_uuid = auth_service.refresh_uuid(refresponseh_token)
    
    response.set_cookie(key="refresponseh_token",
                    value=user_uuid,
                    samesite="Strict",
                    secure=True,
                    httponly=True,
                    max_age=604800)

    return {"detail" : "successfully refresponsehed token"}