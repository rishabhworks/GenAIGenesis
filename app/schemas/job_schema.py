from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class JobCreate(BaseModel):
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
    id: str
    title: str
    trade: str
    location: str
    hourly_rate: float
    salary_annual: Optional[float] = None
    market_rate: Optional[float] = None
    pay_fairness_status: str = "unknown"
    job_type: str
    company_name: str
    external_url: str
    created_at: datetime

    model_config = {"from_attributes": True}


class JobMatchRequest(BaseModel):
    worker_id: str
    max_results: int = Field(default=10, ge=1, le=50)
    radius_km: Optional[int] = Field(default=50)


class JobMatchResponse(BaseModel):
    job: JobResponse
    match_score: float
    reason: str
    pay_status: str
    wage_comparison: Optional[float] = None


class PayFairnessRequest(BaseModel):
    job_id: str
    trade: str
    location: str


class PayFairnessResponse(BaseModel):
    job_id: str
    hourly_rate: float
    market_rate: float
    difference_percentage: float
    status: str
    alert: bool
    recommendation: str


class DirectPayCheckRequest(BaseModel):
    trade: str
    hourly_rate: float
    location: str = "Canada"


class DirectPayCheckResponse(BaseModel):
    trade: str
    hourly_rate: float
    market_rate: float
    difference_percentage: float
    status: str
    alert: bool
    recommendation: str
    location: str


class ContractExplanationRequest(BaseModel):
    contract_text: str = Field(..., description="Contract clause or full contract text")
    language: str = Field(default="simple")


class ContractExplanationResponse(BaseModel):
    original_text: str
    simplified_explanation: str
    key_points: List[str]
    potential_risks: List[str]
    recommendations: List[str]