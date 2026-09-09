import logging
from datetime import datetime, timezone
import uuid

from fastapi import APIRouter, Request, status, HTTPException, Depends, BackgroundTasks, Response, Cookie
from pydantic import ValidationError

from typing import Annotated

from infrastructure.jwt import Jwt_Manager

from schemas.auth import ChangePasswordInfo

from services.auth import Auth_Service

from pydantic import BaseModel

class User(BaseModel):
    username : str
    password : str
    banned : bool = False
    time_preference : str = "3 months"

class Login(BaseModel):
    username : str
    password : str

class ChangeInfo(BaseModel):
    username : str
    oldpassword : str
    newpassword : str

from infrastructure.ratelimiter import limiter

router = APIRouter()
logger = logging.getLogger(__name__)

def log_user_activity(username: str, action: str):
    logger.info(f"{datetime.now(timezone.utc)}: User {username} has {action}")

def get_auth_service(request : Request) -> Auth_Service:
    return request.app.state.auth_router

def get_jwt_manager(request : Request) -> Jwt_Manager:
    return request.app.state.jwt_manager

"""
Route for logging in users
"""
@router.post("/login", status_code=status.HTTP_200_OK)
@limiter.limit("10/minute")
async def login(login_info : Login, 
                background_tasks: BackgroundTasks, 
                auth_service: Annotated[Auth_Service, Depends(get_auth_service)],
                jwt_manager : Annotated[Jwt_Manager, Depends(get_jwt_manager)],
                request: Request,
                response: Response):
          
    login_response = await auth_service.authenticate_user(login_info.username, login_info.password)
    jwt = jwt_manager.create_access_token({"sub" : login_info.username})

    background_tasks.add_task(log_user_activity, login_info.username, "SUCCESSFUL LOGIN")

    response.set_cookie(key="access_token",
                   value=jwt.access_token,
                   samesite="Strict",
                   secure=True,
                   httponly=True,
                   max_age=1800)

    user_uuid = str(uuid.uuid4())
    await auth_service.set_uuid(login_info.username, user_uuid)

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
async def refreash_token(
    Auth_Service: Annotated[Auth_Service, Depends(get_auth_service)],
    jwt_manager: Annotated[Jwt_Manager, Depends(get_jwt_manager)],
    request: Request,
    response: Response,
    refresponseh_token: Annotated[str | None, Cookie(alias="refresponseh_token")] = None,
):

    if not refresponseh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresponseh token cookie is missing."
        )

    confirmed = await Auth_Service.confirm_uuid(refresponseh_token)
    if not confirmed:
        raise HTTPException(
            status_code= status.HTTP_401_UNAUTHORIZED,
            detail="This is an invalid refresponseh token"
        )

    jwt = jwt_manager.create_access_token({"sub" : confirmed['username']})

    response.set_cookie(key="access_token",
                    value=jwt.access_token,
                    samesite="Strict",
                    secure=True,
                    httponly=True,
                    max_age=1800)

    return {"detail" : "successfully refresponsehed token"}

"""
Route for creating users
"""
@limiter.limit("10/minute")
@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create(user: User, 
                Auth_Service: Annotated[Auth_Service, Depends(get_auth_service)],
                request: Request):

    create_response = await Auth_Service.create_user(user)

    if not create_response:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The account wasn't created successfully",
        )

    return {"detail" : "The account was successfully created"}

