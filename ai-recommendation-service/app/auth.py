from fastapi import Request, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import logging
from app.config import settings

logger = logging.getLogger("ai_recommendation.auth")
security = HTTPBearer(auto_error=False)

def get_current_user(request: Request, credentials: HTTPAuthorizationCredentials = Security(security)):
    token = None
    
    if credentials:
        token = credentials.credentials
    elif "accessToken" in request.cookies:
        token = request.cookies.get("accessToken")
        
    if not token:
        logger.warning("No token found in request")
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
            
        return {"user_id": user_id, "role": role}
    except jwt.ExpiredSignatureError:
        logger.warning("Expired token")
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        logger.error(f"Auth error: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication failed")
