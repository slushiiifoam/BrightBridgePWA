from pydantic import BaseModel

class User(BaseModel):
    username : str
    password : str
    banned : bool = False
    time_preference : str = "3 months"

class ChangePasswordInfo(BaseModel):
    username : str
    old_password : str
    new_password : str

class RoleChangeRequest(BaseModel):
    authorizor : str
    target : str
    role : str

class BanRequest(BaseModel):
    authorizor : str
    target: str
    reason: str

class UnbanRequest(BaseModel):
    authorizor : str
    target : str
    banned: bool
    reason : str