from fastapi import HTTPException, status
import uuid
from config.settings import settings
from infrastructure.jwt_provider import Jwt_Manager
from schemas.auth import User, ChangePasswordInfo, RoleChangeRequest, BanRequest, UnbanRequest
from infrastructure.supabase_repository import SupabaseRepository
"""
This is the class that will manage the authentication information & jwt of users
"""
class Auth_Service:
    """
    Constructor for the Auth_Manager
    Params: database (User_DB)
    """
    def __init__(self, db: SupabaseRepository, jwt_manager: Jwt_Manager):
        self.db = db
        self.jwt_manager = jwt_manager

    """
    Function that checks if the user is an admin
    """
    async def confirm_role(self, username : str, role : str):
        user = await self.get(username)
        return user and user['role'] == role

    """
    Function that creates a JWT for a user
    params: email (str)
    returns: jwt (str)
    """
    def create_jwt(self, email : str)-> str:
        email = email.strip().lower()
        token = self.jwt_manager.create_access_token(email, duration=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        return token.access_token
    
    """
    Function that creates a refresh uuid and stores it for the user
    params: email (str)
    returns: the refresh uuid (str)
    """
    def create_refresh_uuid(self, email : str)-> str:
        email = email.strip().lower()
        user = self.db.search("users", fields="email", column="email", value=email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        refresh_uuid = str(uuid.uuid4())
        self.db.upsert("refresh_tokens", {"token": refresh_uuid, "email": email})
        return refresh_uuid

    def confirm_uuid(self, uuid: str) -> str:
        user = self.db.search("users", fields="email", column="uuid", value=uuid)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="invalid request"
            )

        return user
    
    """
    Function that creates a new jwt for a user if the refresh uuid is valid
    params: refresh_uuid (str)
    returns: new jwt (str)
    """
    def refresh_jwt(self, refresponseh_token : str)-> str:
        if not refresponseh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresponseh token cookie is missing."
            )
        
        confirmed_email = self.confirm_uuid(refresponseh_token)

        jwt = self.create_jwt({"sub" : confirmed_email})

        return jwt
    