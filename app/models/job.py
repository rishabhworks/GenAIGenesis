from sqlalchemy import Column, String, Integer, DateTime, Float, Text, Boolean
from sqlalchemy.sql import func
from app.database import Base
from datetime import datetime

class Job(Base):
    """Job posting model"""
    __tablename__ = "jobs"
    
    id = Column(String(36), primary_key=True, index=True)
    title = Column(String(255), index=True)
    trade = Column(String(100), index=True)
    description = Column(Text)
    required_experience_years = Column(Integer)
    required_certifications = Column(Text)  # JSON string
    location = Column(String(255), index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Compensation
    hourly_rate = Column(Float)
    salary_annual = Column(Float, nullable=True)
    market_rate = Column(Float, nullable=True)  # Average market rate for this trade/location
    pay_fairness_status = Column(String(20))  # "fair", "underpaid", "competitive"
    
    # Job Details
    job_type = Column(String(50))  # Full-time, Part-time, Contract
    company_name = Column(String(255))
    job_board_source = Column(String(100))  # LinkedIn, Indeed, local
    external_url = Column(String(500))
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    def __repr__(self):
        return f"<Job(id={self.id}, title={self.title}, trade={self.trade})>"
