from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserRegister(BaseModel):
    full_name: Optional[str] = None
    email: str
    password: str

class UserLogin(BaseModel):
    email:EmailStr
    password:str    


class UserResponse(BaseModel):
    id: int
    full_name: Optional[str] = None
    email: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True    

class TokenResponse(BaseModel):
    access_token: str
    token_type: str 