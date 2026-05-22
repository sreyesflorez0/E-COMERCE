import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.recommendation_service import router as recommendation_router
from app.errors import global_exception_handler

# Configure basic safe logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ai_recommendation")
# Suppress noisy external loggers
logging.getLogger("httpx").setLevel(logging.WARNING)

app = FastAPI(
    title="AI Recommendation Service",
    description="Microservice for product recommendations using Gemini API",
    version="1.0.0"
)

# Exception handlers
app.add_exception_handler(Exception, global_exception_handler)

# CORS (handled by Gateway in prod, but good for local isolated dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommendation_router)

if __name__ == "__main__":
    import uvicorn
    from app.config import settings
    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)
