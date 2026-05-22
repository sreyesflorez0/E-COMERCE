from pymongo import MongoClient
import structlog
from app.config import config

logger = structlog.get_logger()

# Global variables to hold db and client
client = None
db = None
notifications_collection = None

def init_db():
    global client, db, notifications_collection
    try:
        client = MongoClient(config.MONGO_URI, serverSelectionTimeoutMS=5000)
        db = client[config.MONGO_DB]
        notifications_collection = db["notifications"]
        
        # Test connection
        client.admin.command('ping')
        logger.info("Successfully connected to MongoDB", uri=config.MONGO_URI, db=config.MONGO_DB)
        
        # Create indexes
        create_indexes()
        
    except Exception as e:
        logger.error("Failed to connect to MongoDB", error=str(e))
        raise e

def create_indexes():
    if notifications_collection is not None:
        try:
            notifications_collection.create_index("user_id")
            notifications_collection.create_index("event_type")
            notifications_collection.create_index("read")
            notifications_collection.create_index([("created_at", -1)])
            logger.info("MongoDB indexes created successfully")
        except Exception as e:
            logger.error("Failed to create MongoDB indexes", error=str(e))

def get_db():
    return db

def get_notifications_collection():
    return notifications_collection
