from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class WorkerProfileRequest(BaseModel):
    """Request for voice profile creation"""
    audio_file_url: str = Field(..., description="URL or path to audio file")
    audio_format: str = Field(default="wav", description="Audio format (wav, mp3, etc.)")
    
class WorkerCreate(BaseModel):
    """Worker creation schema"""
    trade: str
    experience_years: int
    certifications: Optional[List[str]] = []
    specialties: Optional[List[str]] = []
    location: str  # City, Province
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    voice_transcript: str
    availability: str = "Full-time"
    hourly_rate_expectation: Optional[float] = None

class WorkerResponse(BaseModel):
    """Worker response schema"""
    id: str
    trade: str
    experience_years: int
    certifications: Optional[List[str]]
    specialties: Optional[List[str]]
    location: str
    latitude: Optional[float]
    longitude: Optional[float]
    profile_summary: Optional[str]
    availability: str
    hourly_rate_expectation: Optional[float]
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

class WorkerProfileResponse(BaseModel):
    """Extracted worker profile from voice"""
    trade: str
    experience_years: int
    certifications: List[str]
    specialties: List[str]
    location: str
    availability: str
    summary: str
    confidence_score: float  # 0-1, how confident the AI is in extraction
