from bson import ObjectId
import structlog
from app.database import get_notifications_collection
from app.models import serialize_doc

logger = structlog.get_logger()

def get_user_notifications(user_id: str, unread_only: bool = False, event_type: str = None, limit: int = 20, offset: int = 0):
    collection = get_notifications_collection()
    if collection is None:
        return []
        
    query = {"user_id": user_id}
    
    if unread_only:
        query["read"] = False
        
    if event_type:
        query["event_type"] = event_type
        
    cursor = collection.find(query).sort("created_at", -1).skip(offset).limit(limit)
    return [serialize_doc(doc) for doc in cursor]

def get_notification_by_id(notification_id: str):
    collection = get_notifications_collection()
    if collection is None:
        return None
        
    try:
        doc = collection.find_one({"_id": ObjectId(notification_id)})
        return serialize_doc(doc) if doc else None
    except Exception:
        return None

def mark_notification_as_read(notification_id: str) -> bool:
    collection = get_notifications_collection()
    if collection is None:
        return False
        
    try:
        result = collection.update_one(
            {"_id": ObjectId(notification_id)},
            {"$set": {"read": True}}
        )
        return result.modified_count > 0
    except Exception:
        return False

def mark_all_as_read(user_id: str) -> int:
    collection = get_notifications_collection()
    if collection is None:
        return 0
        
    result = collection.update_many(
        {"user_id": user_id, "read": False},
        {"$set": {"read": True}}
    )
    return result.modified_count

def delete_notification(notification_id: str) -> bool:
    collection = get_notifications_collection()
    if collection is None:
        return False
        
    try:
        result = collection.delete_one({"_id": ObjectId(notification_id)})
        return result.deleted_count > 0
    except Exception:
        return False

def create_notification(notification_doc: dict) -> str:
    collection = get_notifications_collection()
    if collection is None:
        return None
        
    result = collection.insert_one(notification_doc)
    return str(result.inserted_id)
