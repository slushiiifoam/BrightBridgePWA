from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
import jwt
from jwt.exceptions import InvalidTokenError
from datetime import datetime, timedelta, timezone
from typing import Annotated

from config.settings import settings

from pydantic import BaseModel

class AuthToken(BaseModel):
    access_token : str
    token_type : str

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

"""
Class for managing jwts
"""
class Jwt_Manager:
    def __init__ (self):
        self.secret_key = settings.SECRET_KEY
        self.hash_function = settings.HASH_ALGORITHM

    """
    Function that creates the jwt for the user
    Params: data (dict) -- data of access token attributes like username
            expires_delta -- ttl of data token
    Returns: an encoded jwt
    """
    def create_access_token(self, data: dict, duration=30):
        expires_delta = timedelta(minutes=duration)
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + expires_delta
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.hash_function)
        return AuthToken(access_token=encoded_jwt, token_type="bearer")

    """
    Function that decodes the jwt
    Params: token (jwttoken) -- jwt to decode
    Returns: a decoded jwt
    """
    def decode(self, token):
        return jwt.decode(token, self.secret_key, algorithms=[self.hash_function])

        """
    Function for decoding jwts
    Params: token ()
    Returns: user object that contains user information
    """
    async def get_current_user(self, token: Annotated[str, Depends(oauth2_scheme)]):
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = self.decode(token)
            username = payload.get("sub")
            if username is None:
                raise credentials_exception
            token_data = TokenData(username=username)
        except InvalidTokenError:
            raise credentials_exception
        user = await self.get_user(username=token_data.username)
        if user is None:
            raise credentials_exception
        return user