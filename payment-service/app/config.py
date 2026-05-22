from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PORT: int = 8086
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS512"
    ORDER_SERVICE_URL: str = "http://order-service:8084"
    PAYMENT_ALLOW_UNVERIFIED_ORDERS: bool = True
    ENABLE_RABBITMQ: bool = False
    RABBITMQ_URL: str = "amqp://guest:guest@rabbitmq:5672"
    RABBITMQ_EXCHANGE: str = "ecommerce.events"
    RABBITMQ_PAYMENT_COMPLETED_ROUTING_KEY: str = "payment_completed"
    RABBITMQ_PAYMENT_FAILED_ROUTING_KEY: str = "payment_failed"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
