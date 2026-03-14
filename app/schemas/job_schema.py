from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class JobCreate(BaseModel):
    """Job creation schema"""
    title: str
    trade: str
    description: str
    required_experience_years: int
    required_certifications: Optional[List[str]] = []
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    hourly_rate: float
    salary_annual: Optional[float] = None
    job_type: str
    company_name: str
    job_board_source: str
    external_url: str

class JobResponse(BaseModel):
    """Job response schema"""
    id: str
    title: str
    trade: str
    location: str
    hourly_rate: float
    salary_annual: Optional[float]
    market_rate: Optional[float]
    pay_fairness_status: str
    job_type: str
    company_name: str
    external_url: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class JobMatchRequest(BaseModel):
    """Request for job matching"""
    worker_id: str
    max_results: int = Field(default=10, ge=1, le=50)
    radius_km: Optional[int] = Field(default=50, description="Search radius in kilometers")

class JobMatchResponse(BaseModel):
    """Matched jobs with relevance scores"""
    job: JobResponse
    match_score: float  # 0-100, match percentage
    reason: str  # Why this job matches
    pay_status: str  # fair, underpaid, competitive
    wage_comparison: Optional[float] = None  # % above/below market rate

class PayFairnessRequest(BaseModel):
    """Request for pay fairness check"""
    job_id: str
    trade: str
    location: str

class PayFairnessResponse(BaseModel):
    """Pay fairness analysis result"""
    job_id: str
    hourly_rate: float
    market_rate: float
    difference_percentage: float
    status: str  # "fair", "underpaid", "competitive"
    alert: bool
    recommendation: str

class ContractExplanationRequest(BaseModel):
    """Request for contract explanation"""
    contract_text: str = Field(..., description="Contract clause or full contract text")
    language: str = Field(default="simple", description="Explanation language level: simple, intermediate, detailed")

class ContractExplanationResponse(BaseModel):
    """Explained contract clause"""
    original_text: str
    simplified_explanation: str
    key_points: List[str]
    potential_risks: List[str]
    recommendations: List[str]
