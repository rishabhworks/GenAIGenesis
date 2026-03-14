import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
import uuid

from app.database import get_db
from app.schemas.worker_schema import WorkerCreate, WorkerResponse, WorkerProfileRequest, WorkerProfileResponse
from app.models.worker import Worker
from app.services.voice_service import VoiceService
from app.services.ai_service import AIService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/workers", tags=["workers"])

# Initialize services
voice_service = VoiceService()
ai_service = AIService()

@router.post("/voice-profile", response_model=WorkerResponse)
async def create_worker_from_voice(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Create worker profile from voice recording
    
    - **file**: Audio file (wav, mp3, flac, opus, webm)
    Returns: Worker profile with extracted information
    """
    try:
        # Save uploaded file temporarily
        temp_file_path = f"/tmp/{uuid.uuid4()}.{file.filename.split('.')[-1]}"
        
        with open(temp_file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Transcribe audio
        transcription = await voice_service.transcribe_from_file(temp_file_path)
        
        if transcription['status'] != 'success':
            raise HTTPException(status_code=400, detail="Failed to transcribe audio")
        
        transcript = transcription['transcript']
        
        # Extract worker profile using AI
        profile = ai_service.extract_worker_profile(transcript)
        
        # Create worker record
        worker_id = str(uuid.uuid4())
        worker = Worker(
            id=worker_id,
            trade=profile.trade,
            experience_years=profile.experience_years,
            certifications=",".join(profile.certifications),
            specialties=",".join(profile.specialties),
            location=profile.location,
            voice_transcript=transcript,
            profile_summary=profile.summary,
            availability=profile.availability
        )
        
        db.add(worker)
        db.commit()
        db.refresh(worker)
        
        logger.info(f"Worker profile created: {worker_id}")
        
        return worker
        
    except Exception as e:
        logger.error(f"Voice profile creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/manual-profile", response_model=WorkerResponse)
async def create_worker_manual(
    worker_data: WorkerCreate,
    db: Session = Depends(get_db)
):
    """
    Manually create worker profile (without voice)
    
    Useful for testing or manual data entry
    """
    try:
        worker_id = str(uuid.uuid4())
        worker = Worker(
            id=worker_id,
            trade=worker_data.trade,
            experience_years=worker_data.experience_years,
            certifications=",".join(worker_data.certifications) if worker_data.certifications else "",
            specialties=",".join(worker_data.specialties) if worker_data.specialties else "",
            location=worker_data.location,
            latitude=worker_data.latitude,
            longitude=worker_data.longitude,
            voice_transcript=worker_data.voice_transcript,
            availability=worker_data.availability,
            hourly_rate_expectation=worker_data.hourly_rate_expectation
        )
        
        db.add(worker)
        db.commit()
        db.refresh(worker)
        
        logger.info(f"Manual worker profile created: {worker_id}")
        return worker
        
    except Exception as e:
        logger.error(f"Manual profile creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{worker_id}", response_model=WorkerResponse)
async def get_worker(
    worker_id: str,
    db: Session = Depends(get_db)
):
    """Get worker profile by ID"""
    try:
        worker = db.query(Worker).filter(Worker.id == worker_id).first()
        if not worker:
            raise HTTPException(status_code=404, detail="Worker not found")
        return worker
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get worker failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=list[WorkerResponse])
async def list_workers(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """List all workers (paginated)"""
    try:
        workers = db.query(Worker).filter(Worker.is_active == True).offset(skip).limit(limit).all()
        return workers
    except Exception as e:
        logger.error(f"List workers failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{worker_id}", response_model=WorkerResponse)
async def update_worker(
    worker_id: str,
    worker_data: WorkerCreate,
    db: Session = Depends(get_db)
):
    """Update worker profile"""
    try:
        worker = db.query(Worker).filter(Worker.id == worker_id).first()
        if not worker:
            raise HTTPException(status_code=404, detail="Worker not found")
        
        worker.trade = worker_data.trade
        worker.experience_years = worker_data.experience_years
        worker.certifications = ",".join(worker_data.certifications) if worker_data.certifications else ""
        worker.specialties = ",".join(worker_data.specialties) if worker_data.specialties else ""
        worker.location = worker_data.location
        worker.latitude = worker_data.latitude
        worker.longitude = worker_data.longitude
        worker.availability = worker_data.availability
        worker.hourly_rate_expectation = worker_data.hourly_rate_expectation
        
        db.commit()
        db.refresh(worker)
        
        logger.info(f"Worker profile updated: {worker_id}")
        return worker
        
    except Exception as e:
        logger.error(f"Update worker failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{worker_id}")
async def delete_worker(
    worker_id: str,
    db: Session = Depends(get_db)
):
    """Soft delete worker profile"""
    try:
        worker = db.query(Worker).filter(Worker.id == worker_id).first()
        if not worker:
            raise HTTPException(status_code=404, detail="Worker not found")
        
        worker.is_active = False
        db.commit()
        
        logger.info(f"Worker deleted: {worker_id}")
        return {"message": "Worker deleted successfully"}
        
    except Exception as e:
        logger.error(f"Delete worker failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
