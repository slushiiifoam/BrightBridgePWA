from fastapi import HTTPException, status
import uuid
import hashlib
import hmac
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

    def hash_uuid(self, plain_uuid: str) -> str:
        """Hashes a raw UUID string into a fast 64-character SHA-256 hex string."""
        return hashlib.sha256(plain_uuid.encode("utf-8")).hexdigest()

    def verify_uuid(self, cls, plain_uuid: str, hashed_uuid: str) -> bool:
        """Verifies a raw UUID against its SHA-256 hash in constant time."""
        computed_hash = cls.hash_uuid(plain_uuid)
        return hmac.compare_digest(computed_hash, hashed_uuid)


    """
    Function that checks if the user is an admin
    """
    def confirm_role(self, username : str, role : str):
        user = self.get(username)
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

    def is_valid_jwt(self, jwt):
        return self.jwt_manager.is_valid_jwt(jwt)
    
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

        hashed_uuid = self.hash_uuid(refresh_uuid)

        self.db.update("users", "email", email,  {"refresh_token": hashed_uuid})
        return refresh_uuid

    def refresh_uuid(self, old_uuid : str) -> str:
        hashed_old_uuid = self.hash_uuid(old_uuid)

        new_uuid = str(uuid.uuid4())
        hashed_new_uuid = self.hash_uuid(new_uuid)

        result = self.db.update("users", "refresh_token", hashed_old_uuid, {"refresh_token" : hashed_new_uuid})

        if result:
            return new_uuid

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    def confirm_uuid(self, uuid: str) -> str:
        hashed_old_uuid = self.hash_uuid(uuid)

        user = self.db.search("users", fields="email", column="refresh_token", value=hashed_old_uuid)

        if not user or len(user) <= 0:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="invalid request"
            )

        return user[0]["email"]
    
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

        jwt = self.jwt_manager.create_access_token(confirmed_email, duration=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

        return jwt.access_token
    