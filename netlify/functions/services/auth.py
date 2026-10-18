from fastapi import HTTPException, status
from pwdlib import PasswordHash

from config.settings import settings

from schemas.auth import User, ChangePasswordInfo, RoleChangeRequest, BanRequest, UnbanRequest

"""
This is the class that will manage the authentication information & jwt of users
"""
class Auth_Service:
    """
    Constructor for the Auth_Manager
    Params: database (User_DB)
    """
    def __init__ (self, database):
        self.password_hash = PasswordHash.recommended()
        self.auth = database.collection

    """
    Function that creates users and stores them in the database
    Params: user (User) 
    """
    async def create_user(self, user : User):
        user_data = user.model_dump()
        user_object['password'] = self.hash_password(user.password)
        return await self.auth.insert_one(user_object)

    """
    Function that gets users
    Params: username (str)
    Returns: result of whether they can find an entry with that username
    """
    async def get_user(self, username : str):
        return await self.auth.find_one({"username" : username})

    """
    Function that sets uuids
    Params: username (str)
            uuid (uuid)
    Returns: result of whether the uuid has been updated
    """
    async def set_uuid(self, username : str, uuid : str):
        result = await self.auth.update_one({"username" : username}, 
                                                    {"$set" : {"uuid" : uuid}})
        return result.modified_count > 0

    """
    Function that confirms a user's uuid
    Params: username (str)
            uuid (uuid)
    """
    async def confirm_uuid(self, uuid : str):
        return await self.auth.find_one({"uuid" : uuid})

    """
    Function that gets users
    Params: username (str)
            old_password (str)
            new_password (str)
    """
    async def change_password(self, change_password_info : ChangePasswordInfo):
        user = await self.auth.find_one({"username" : change_password_info.username})

        if not user or not self.verify_password(change_password_info.old_password, user['password']):
            return False

        hashed_new_password = self.hash_password(change_password_info.new_password)

        query_filter = {'username' : change_password_info.username}
        update_operation = { '$set' : 
            { 'password' : hashed_new_password }
        }

        return (await self.auth.update_one(query_filter, update_operation)).modified_count > 0

    """
    Function that hashes the password
    Params: password (str)
    """
    def hash_password(self, password):
        return self.password_hash.hash(password)

    """
    Function that verifies the passwords 
    Params: plain_password (str) -- unhashed password
            hashed_password (str) -- hashed version of the password
    Returns: boolean of whether the passwords match
    """
    def verify_password(self, plain_password, hashed_password):
        return self.password_hash.verify(plain_password, hashed_password)

    """
    Function that authenticates users
    Params: username (str)
            password (str)
    Returns: user object
    """
    async def authenticate_user(self, username : str, password : str):
        user = await self.get_user(username)

        if not user or not self.verify_password(password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if user.banned:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"User is banned. Reason: {str(user.reason)}",
            )
        return True

    """
    Function that checks if the user is an admin
    """
    async def confirm_role(self, username : str, role : str):
        user = await self.get(username)
        return user and user['role'] == role

    """
    Function that changes the roles of a user
    """
    async def change_role(self, request : RoleChangeRequest):
        result = await self.auth.update_one({"username" : request.target}, 
                                            {"$set" : {"role" : request.role}})
        return result.modified_count > 0

    """
    Function that bans users
    Params: request : BanRequest
    Returns: whether the user was banned
    """
    async def update_ban_status(self, request : BanRequest):
        result = await self.auth.update_one({"username" : request.target},
                                            {"$set" : {"banned" : request.banned, "reason" : request.reason}})
        return result.modified_count > 0