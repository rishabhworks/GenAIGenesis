from sqlalchemy import Column, String, Integer, DateTime, Float, Text, Boolean
from sqlalchemy.sql import func
from app.database import Base

class Worker(Base):
    """Worker profile model"""
    __tablename__ = "workers"
    
    id = Column(String(36), primary_key=True, index=True)
    trade = Column(String(100), index=True)
    experience_years = Column(Integer)
    certifications = Column(Text)
    specialties = Column(Text)
    location = Column(String(255), index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    voice_transcript = Column(Text)
    profile_summary = Column(Text)
    availability = Column(String(50))
    hourly_rate_expectation = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)

    def __repr__(self):
        return f"<Worker(id={self.id}, trade={self.trade}, location={self.location})>"