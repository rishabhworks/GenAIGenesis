from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import logging
from pathlib import Path

from app.config import settings
from app.routes import voice_router, contract_router, chatbot_router, onboarding_router

# Configure logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered career assistant for skilled trades workers"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(voice_router)
app.include_router(contract_router)
app.include_router(chatbot_router)
app.include_router(onboarding_router)

# Health check endpoint
@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - API documentation"""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": "AI Career Assistant for Skilled Trades Workers",
        "docs": "/docs",
        "redoc": "/redoc",
        "endpoints": {
            "speech_to_text": "/api/v1/workers/speech-to-text",
            "chatbot": "/api/v1/chatbot/ask",
            "recommendations": "/api/v1/chatbot/recommendations/{worker_id}",
            "pay_check": "/api/v1/chatbot/check-pay",
            "explain_contract": "/api/v1/chatbot/explain-contract",
            "onboarding": "/api/v1/onboarding/register"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )

# Serve the STT test page at /test-stt
@app.get("/test-stt")
async def stt_test_page():
    return FileResponse(Path(__file__).resolve().parent.parent / "test_stt.html", media_type="text/html")
