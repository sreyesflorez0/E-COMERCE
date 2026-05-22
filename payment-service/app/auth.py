import jwt
from fastapi import Request, HTTPException
from typing import Optional
from pydantic import BaseModel
from uuid import UUID
from app.config import settings

class UserData(BaseModel):
    id: UUID
    role: str

def get_token_from_request(request: Request) -> Optional[str]:
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    
    cookie_token = request.cookies.get("accessToken")
    if cookie_token:
        return cookie_token
        
    return None

import logging

logger = logging.getLogger(__name__)

def get_current_user(request: Request) -> UserData:
    token = get_token_from_request(request)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        
        # Log keys for debugging (safe, no token/sensitive data exposed)
        logger.info(f"JWT Payload keys received: {list(payload.keys())}")
        
        # Auth-service sets userId as the 'sub' (subject) claim
        user_id = payload.get("sub")
        
        # Auth-service sets role as 'role'. Fallback to 'CLIENT' just in case it is missing 
        # (safe default for least privilege during testing)
        role = payload.get("role", "CLIENT")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload: missing 'sub'")
            
        return UserData(id=UUID(user_id), role=role)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_token_for_downstream(request: Request) -> Optional[str]:
    return get_token_from_request(request)
