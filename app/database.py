from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Database setup
# Can use SQLite for development or Db2 for production
DATABASE_URL = settings.DATABASE_URL

# For SQLite (development)
if "sqlite" in DATABASE_URL:
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False},
        echo=settings.DEBUG
    )
# For Db2 (production - requires ibm_db_sa driver)
elif "db2" in DATABASE_URL.lower():
    try:
        engine = create_engine(
            DATABASE_URL,
            echo=settings.DEBUG,
            pool_pre_ping=True,
            pool_recycle=3600
        )
        logger.info("Connected to IBM Db2")
    except Exception as e:
        logger.error(f"Failed to connect to Db2: {e}")
        raise
else:
    engine = create_engine(DATABASE_URL, echo=settings.DEBUG)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized")
