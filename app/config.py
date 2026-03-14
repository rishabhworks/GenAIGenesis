import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """Application configuration"""
    
    # App Settings
    APP_NAME = "TradePass"
    APP_VERSION = "1.0.0"
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tradepass.db")
    
    # Google Gemini API (for All AI operations including speech-to-text)
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")  # or gemini-1.5-flash for faster, cheaper responses
    
    # Moorcheh API (for RAG chatbot and recommendations)
    MOORCHEH_API_KEY = os.getenv("MOORCHEH_API_KEY", "")
    MOORCHEH_BASE_URL = os.getenv("MOORCHEH_BASE_URL", "https://api.moorcheh.ai/v1")
    
    # Job Board APIs (for data collection)
    LINKEDIN_API_KEY = os.getenv("LINKEDIN_API_KEY", "")
    INDEED_API_KEY = os.getenv("INDEED_API_KEY", "")
    
    # Wage Data API (for pay fairness)
    STATS_CANADA_API_KEY = os.getenv("STATS_CANADA_API_KEY", "")
    
    # API Settings
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,http://localhost:5173,http://localhost:8000").split(",")
    MAX_UPLOAD_SIZE = 25 * 1024 * 1024  # 25MB
    
    # Wage Fairness Detection
    WAGE_THRESHOLD_PERCENTAGE = float(os.getenv("WAGE_THRESHOLD_PERCENTAGE", "20"))  # Alert if 20% below market
    
    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

settings = Settings()
