import logging
import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List, Optional

from app.services.moorcheh_service import MoorchehRAGService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/onboarding", tags=["onboarding"])

rag_service = MoorchehRAGService()


class OnboardingProfile(BaseModel):
    """User onboarding profile data"""
    name: str
    email: str
    phone: str
    trade: str
    experience_years: int
    specialties: List[str] = []
    location: str
    availability: str  # "full-time" or "part-time"
    hourly_rate_expectation: float
    skill_summary: str


class OnboardingResponse(BaseModel):
    """Response after onboarding"""
    worker_id: str
    profile: dict
    uploaded_to_knowledge_base: bool
    existing_user: bool = False


@router.post("/register", response_model=OnboardingResponse)
async def register_worker(profile: OnboardingProfile):
    """
    Register a new worker from the onboarding flow.
    If email already exists in knowledge base, return the existing profile.
    """
    try:
        # Check if email already exists
        existing = rag_service.find_profile_by_email(profile.email)
        if existing:
            worker_id = existing.pop("worker_id", f"worker-{profile.email}")
            logger.info(f"Existing profile found for {profile.email} as {worker_id}")
            return OnboardingResponse(
                worker_id=worker_id,
                profile=existing,
                uploaded_to_knowledge_base=True,
                existing_user=True,
            )

        # Generate a unique worker ID
        worker_id = f"worker-{uuid.uuid4().hex[:8]}"

        worker_data = {
            "name": profile.name,
            "email": profile.email,
            "phone": profile.phone,
            "trade": profile.trade,
            "experience_years": profile.experience_years,
            "specialties": profile.specialties,
            "location": profile.location,
            "availability": profile.availability,
            "hourly_rate_expectation": profile.hourly_rate_expectation,
            "skill_summary": profile.skill_summary,
            "certifications": profile.specialties,  # use specialties as certs too
        }

        # Upload to Moorcheh knowledge base
        uploaded = rag_service.upload_user_profile_to_knowledge_base(worker_id, worker_data)

        logger.info(f"Onboarding complete for {profile.name} as {worker_id}")

        return OnboardingResponse(
            worker_id=worker_id,
            profile=worker_data,
            uploaded_to_knowledge_base=uploaded,
        )

    except Exception as e:
        logger.error(f"Onboarding error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
