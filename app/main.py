from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import settings
from app.database import init_db
from app.routes import voice_router, job_router, pay_router, contract_router, chatbot_router

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

# Initialize database
@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise

# Include routes
app.include_router(voice_router)
app.include_router(job_router)
app.include_router(pay_router)
app.include_router(contract_router)
app.include_router(chatbot_router)

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
            "voice_profile": "/api/v1/workers/voice-profile",
            "manual_profile": "/api/v1/workers/manual-profile",
            "match_jobs": "/api/v1/jobs/match-jobs",
            "pay_check": "/api/v1/pay/check",
            "explain_contract": "/api/v1/contracts/explain"
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
