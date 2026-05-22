import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    PORT = int(os.getenv("PORT", 8087))
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    MONGO_DB = os.getenv("MONGO_DB", "notification_db")
    JWT_SECRET = os.getenv("JWT_SECRET", "ecommerce-super-secret-jwt-key-change-this-in-production-must-be-256-bits")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS512")
    
    # RabbitMQ Config
    ENABLE_RABBITMQ = os.getenv("ENABLE_RABBITMQ", "false").lower() == "true"
    RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672")
    RABBITMQ_EXCHANGE = os.getenv("RABBITMQ_EXCHANGE", "ecommerce.events")
    RABBITMQ_QUEUE = os.getenv("RABBITMQ_QUEUE", "notification_service_queue")
    RABBITMQ_ROUTING_KEYS = os.getenv("RABBITMQ_ROUTING_KEYS", "cart_updated,order_created,order_confirmed,payment_completed,payment_failed")
    
    ENABLE_NOTIFICATION_SENT_EVENT = os.getenv("ENABLE_NOTIFICATION_SENT_EVENT", "false").lower() == "true"
    RABBITMQ_NOTIFICATION_SENT_ROUTING_KEY = os.getenv("RABBITMQ_NOTIFICATION_SENT_ROUTING_KEY", "notification_sent")

config = Config()
