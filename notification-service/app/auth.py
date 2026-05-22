import jwt
from functools import wraps
from flask import request, jsonify
import structlog
from app.config import config

logger = structlog.get_logger()

def extract_token_from_request():
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    
    # Try from cookies
    cookie_token = request.cookies.get("accessToken")
    if cookie_token:
        return cookie_token
        
    return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = extract_token_from_request()

        if not token:
            return jsonify({"error": "Missing authorization token"}), 401

        try:
            # The structure of the token will have 'sub' for user_id and 'role'
            data = jwt.decode(token, config.JWT_SECRET, algorithms=[config.JWT_ALGORITHM])
            current_user = {
                "user_id": data.get("sub"),
                "role": data.get("role")
            }
            if not current_user["user_id"]:
                return jsonify({"error": "Invalid token structure, missing sub"}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError as e:
            logger.warning("Invalid token", error=str(e))
            return jsonify({"error": "Invalid token"}), 401

        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    @token_required
    def decorated(current_user, *args, **kwargs):
        if current_user.get("role") != "ADMIN":
            return jsonify({"error": "Admin privileges required"}), 403
        return f(current_user, *args, **kwargs)
    return decorated
