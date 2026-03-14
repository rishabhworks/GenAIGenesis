from sqlalchemy import Column, String, Integer, DateTime, Float, Text, Boolean
from sqlalchemy.sql import func
from app.database import Base
from datetime import datetime

class Worker(Base):
    """Worker profile model"""
    __tablename__ = "workers"
    
    id = Column(String(36), primary_key=True, index=True)
    trade = Column(String(100), index=True)  # e.g., Electrician, Plumber
    experience_years = Column(Integer)
    certifications = Column(Text)  # JSON string of certifications
    specialties = Column(Text)  # JSON string of specialties
    location = Column(String(255), index=True)  # City, Province
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    voice_transcript = Column(Text)  # Original voice-to-text transcript
    profile_summary = Column(Text)  # AI-generated summary
    availability = Column(String(50))  # Full-time, Part-time, Contract
    hourly_rate_expectation = Column(Float, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    def __repr__(self):
        return f"<Worker(id={self.id}, trade={self.trade}, location={self.location})>"
