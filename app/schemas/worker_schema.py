from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime


class WorkerProfileRequest(BaseModel):
    audio_file_url: str = Field(..., description="URL or path to audio file")
    audio_format: str = Field(default="wav", description="Audio format")


class WorkerCreate(BaseModel):
    trade: str
    experience_years: int
    certifications: Optional[List[str]] = []
    specialties: Optional[List[str]] = []
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    voice_transcript: str
    availability: str = "Full-time"
    hourly_rate_expectation: Optional[float] = None


class WorkerResponse(BaseModel):
    id: str
    trade: str
    experience_years: int
    certifications: Optional[List[str]] = []
    specialties: Optional[List[str]] = []
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    profile_summary: Optional[str] = None
    availability: str
    hourly_rate_expectation: Optional[float] = None
    created_at: datetime
    is_active: bool

    @field_validator('certifications', 'specialties', mode='before')
    @classmethod
    def parse_comma_separated(cls, v):
        if v is None:
            return []
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            return [s.strip() for s in v.split(',') if s.strip()]
        return []

    model_config = {"from_attributes": True}


class WorkerProfileResponse(BaseModel):
    trade: str = "General Trades"
    experience_years: int = 0
    certifications: List[str] = []
    specialties: List[str] = []
    location: str = "Canada"
    availability: str = "Full-time"
    summary: str = ""
    confidence_score: float = 0.0