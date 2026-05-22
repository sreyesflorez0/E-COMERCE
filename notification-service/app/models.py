from datetime import datetime, timezone
from bson import ObjectId

def serialize_doc(doc):
    """Convert MongoDB ObjectId and datetime to string for JSON serialization"""
    if not doc:
        return doc
    
    serialized = {}
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            serialized[k] = str(v)
        elif isinstance(v, datetime):
            serialized[k] = v.isoformat()
        else:
            serialized[k] = v
            
    # Optionally rename _id to id
    if "_id" in serialized:
        serialized["id"] = serialized.pop("_id")
        
    return serialized

def build_notification(user_id: str, event_type: str, message: str) -> dict:
    if not message or not message.strip():
        raise ValueError("Message cannot be empty")
        
    return {
        "user_id": user_id,
        "event_type": event_type,
        "message": message,
        "read": False,
        "created_at": datetime.now(timezone.utc)
    }
