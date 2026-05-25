from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PORT: int = 8088
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    PRODUCT_SERVICE_URL: str = "http://product-service:8083"
    CART_SERVICE_URL: str = "http://cart-service:8085"
    JWT_SECRET: str = "ecommerce-super-secret-jwt-key-change-this-in-production-must-be-256-bits"
    JWT_ALGORITHM: str = "HS512"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
