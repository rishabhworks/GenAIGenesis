import logging
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import uuid

from app.database import get_db
from app.schemas.job_schema import JobCreate, JobResponse, JobMatchRequest, JobMatchResponse
from app.models.job import Job
from app.services.job_match_service import JobMatchService
from app.services.pay_fairness_service import PayFairnessService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/jobs", tags=["jobs"])

@router.post("/", response_model=JobResponse)
async def create_job(
    job_data: JobCreate,
    db: Session = Depends(get_db)
):
    """Create a new job posting"""
    try:
        job_id = str(uuid.uuid4())
        
        job = Job(
            id=job_id,
            title=job_data.title,
            trade=job_data.trade,
            description=job_data.description,
            required_experience_years=job_data.required_experience_years,
            required_certifications=",".join(job_data.required_certifications) if job_data.required_certifications else "",
            location=job_data.location,
            latitude=job_data.latitude,
            longitude=job_data.longitude,
            hourly_rate=job_data.hourly_rate,
            salary_annual=job_data.salary_annual,
            job_type=job_data.job_type,
            company_name=job_data.company_name,
            job_board_source=job_data.job_board_source,
            external_url=job_data.external_url,
            pay_fairness_status="pending"
        )
        
        db.add(job)
        db.commit()
        db.refresh(job)
        
        # Analyze pay fairness
        PayFairnessService.analyze_pay_fairness(db, job_id)
        
        logger.info(f"Job created: {job_id}")
        return job
        
    except Exception as e:
        logger.error(f"Job creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: str,
    db: Session = Depends(get_db)
):
    """Get job posting by ID"""
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return job
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get job failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=list[JobResponse])
async def list_jobs(
    trade: str = None,
    location: str = None,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """List jobs with optional filtering"""
    try:
        query = db.query(Job).filter(Job.is_active == True)
        
        if trade:
            query = query.filter(Job.trade.ilike(f"%{trade}%"))
        if location:
            query = query.filter(Job.location.ilike(f"%{location}%"))
        
        jobs = query.offset(skip).limit(limit).all()
        return jobs
        
    except Exception as e:
        logger.error(f"List jobs failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/match-jobs", response_model=list[JobMatchResponse])
async def match_jobs(
    request: JobMatchRequest,
    db: Session = Depends(get_db)
):
    """Match worker to relevant jobs"""
    try:
        matches = JobMatchService.match_worker_to_jobs(
            db=db,
            worker_id=request.worker_id,
            radius_km=request.radius_km or 50,
            max_results=request.max_results
        )
        
        if not matches:
            logger.info(f"No jobs matched for worker: {request.worker_id}")
            return []
        
        # Format response
        response = []
        for match in matches:
            job = match['job']
            job_response = JobResponse(
                id=job.id,
                title=job.title,
                trade=job.trade,
                location=job.location,
                hourly_rate=job.hourly_rate,
                salary_annual=job.salary_annual,
                market_rate=job.market_rate,
                pay_fairness_status=job.pay_fairness_status,
                job_type=job.job_type,
                company_name=job.company_name,
                external_url=job.external_url,
                created_at=job.created_at
            )
            
            response.append(JobMatchResponse(
                job=job_response,
                match_score=match['match_score'],
                reason=match['reason'],
                pay_status=job.pay_fairness_status,
                wage_comparison=job.market_rate - job.hourly_rate if job.market_rate else None
            ))
        
        logger.info(f"Matched {len(response)} jobs for worker: {request.worker_id}")
        return response
        
    except Exception as e:
        logger.error(f"Job matching failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: str,
    job_data: JobCreate,
    db: Session = Depends(get_db)
):
    """Update job posting"""
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        job.title = job_data.title
        job.trade = job_data.trade
        job.description = job_data.description
        job.required_experience_years = job_data.required_experience_years
        job.required_certifications = ",".join(job_data.required_certifications) if job_data.required_certifications else ""
        job.location = job_data.location
        job.hourly_rate = job_data.hourly_rate
        job.salary_annual = job_data.salary_annual
        
        db.commit()
        db.refresh(job)
        
        logger.info(f"Job updated: {job_id}")
        return job
        
    except Exception as e:
        logger.error(f"Update job failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{job_id}")
async def delete_job(
    job_id: str,
    db: Session = Depends(get_db)
):
    """Soft delete job posting"""
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        job.is_active = False
        db.commit()
        
        logger.info(f"Job deleted: {job_id}")
        return {"message": "Job deleted successfully"}
        
    except Exception as e:
        logger.error(f"Delete job failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
