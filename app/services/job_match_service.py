import logging
from typing import List, Dict
from math import radians, cos, sin, asin, sqrt
from sqlalchemy.orm import Session
from app.models.job import Job
from app.models.worker import Worker

logger = logging.getLogger(__name__)

class JobMatchService:
    """Service for matching workers to jobs"""
    
    @staticmethod
    def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate distance between two coordinates in kilometers using Haversine formula
        
        Args:
            lat1, lon1: First coordinate
            lat2, lon2: Second coordinate
        
        Returns:
            Distance in kilometers
        """
        if not all([lat1, lon1, lat2, lon2]):
            return float('inf')
        
        lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        km = 6371 * c
        return km
    
    @staticmethod
    def match_worker_to_jobs(
        db: Session,
        worker_id: str,
        radius_km: int = 50,
        max_results: int = 10
    ) -> List[Dict]:
        """
        Find matching jobs for a worker within radius
        
        Args:
            db: Database session
            worker_id: Worker ID
            radius_km: Search radius in kilometers
            max_results: Maximum number of results to return
        
        Returns:
            List of matched jobs with scores
        """
        try:
            # Get worker
            worker = db.query(Worker).filter(Worker.id == worker_id).first()
            if not worker:
                logger.warning(f"Worker not found: {worker_id}")
                return []
            
            # Get all active jobs
            all_jobs = db.query(Job).filter(Job.is_active == True).all()
            
            matches = []
            
            for job in all_jobs:
                # Distance check
                if worker.latitude and worker.longitude and job.latitude and job.longitude:
                    distance = JobMatchService.calculate_distance(
                        worker.latitude, worker.longitude,
                        job.latitude, job.longitude
                    )
                    if distance > radius_km:
                        continue
                
                # Calculate match score
                score = JobMatchService._calculate_match_score(worker, job)
                
                if score > 0:
                    matches.append({
                        "job": job,
                        "match_score": score,
                        "reason": JobMatchService._generate_match_reason(worker, job, score)
                    })
            
            # Sort by score and return top results
            matches.sort(key=lambda x: x['match_score'], reverse=True)
            return matches[:max_results]
            
        except Exception as e:
            logger.error(f"Job matching failed: {e}")
            return []
    
    @staticmethod
    def _calculate_match_score(worker: Worker, job: Job) -> float:
        """
        Calculate match score between 0-100
        
        Args:
            worker: Worker object
            job: Job object
        
        Returns:
            Match score (0-100)
        """
        score = 0.0
        
        # Trade match (40 points)
        if worker.trade.lower() in job.trade.lower() or job.trade.lower() in worker.trade.lower():
            score += 40
        
        # Experience match (30 points)
        if worker.experience_years >= job.required_experience_years:
            experience_match = min(100, (worker.experience_years / max(job.required_experience_years, 1)) * 100)
            score += (experience_match / 100) * 30
        
        # Certifications match (20 points)
        if job.required_certifications:
            required_certs = set(str(job.required_certifications).lower().split(','))
            worker_certs = set(str(worker.certifications).lower().split(',')) if worker.certifications else set()
            if required_certs:
                cert_overlap = len(required_certs & worker_certs) / len(required_certs)
                score += cert_overlap * 20
        else:
            score += 20  # No certifications required
        
        # Specialties match (10 points)
        if job.description and worker.specialties:
            job_keywords = set(job.description.lower().split())
            worker_specialties = set(str(worker.specialties).lower().split(','))
            if job_keywords and worker_specialties:
                specialty_overlap = len(job_keywords & worker_specialties) / len(worker_specialties)
                score += specialty_overlap * 10
        
        return min(100, max(0, score))
    
    @staticmethod
    def _generate_match_reason(worker: Worker, job: Job, score: float) -> str:
        """
        Generate human-readable reason for match
        
        Args:
            worker: Worker object
            job: Job object
            score: Match score
        
        Returns:
            Reason string
        """
        reasons = []
        
        if worker.trade.lower() in job.trade.lower():
            reasons.append(f"Trade match: {job.trade}")
        
        if worker.experience_years >= job.required_experience_years:
            reasons.append(f"Experience sufficient: {worker.experience_years} years")
        
        if job.pay_fairness_status == "competitive":
            reasons.append(f"Fair wage: ${job.hourly_rate:.2f}/hr")
        
        return "; ".join(reasons) if reasons else "Skills partially match"
