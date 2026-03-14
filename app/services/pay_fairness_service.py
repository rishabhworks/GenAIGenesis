import logging
from typing import Dict
from sqlalchemy.orm import Session
from app.models.job import Job
from app.services.moorcheh_service import MoorchehRAGService

logger = logging.getLogger(__name__)

class PayFairnessService:
    """Service for detecting underpaid job postings using Moorcheh AI + wage-data namespace"""
    
    # Fallback market wages in case Moorcheh wage-data namespace is empty
    MARKET_WAGE_DATA = {
        "electrician": 32.50,
        "plumber": 34.00,
        "carpenter": 28.50,
        "hvac": 30.75,
        "welder": 28.00,
        "ironworker": 35.00,
        "heavy equipment operator": 32.00,
        "construction laborer": 22.00,
        "roofer": 33.50,
        "painter": 26.00,
        "mason": 29.00,
        "pipefitter": 32.50,
        "excavator operator": 30.00,
        "general contractor": 35.00,
        "mechanic": 31.00,
    }

    _moorcheh_service = None

    @classmethod
    def _get_moorcheh(cls):
        if cls._moorcheh_service is None:
            cls._moorcheh_service = MoorchehRAGService()
        return cls._moorcheh_service
    
    @staticmethod
    def get_market_rate(trade: str, location: str = "Canada") -> float:
        trade_lower = trade.lower()
        if trade_lower in PayFairnessService.MARKET_WAGE_DATA:
            return PayFairnessService.MARKET_WAGE_DATA[trade_lower]
        for market_trade, rate in PayFairnessService.MARKET_WAGE_DATA.items():
            if trade_lower in market_trade or market_trade in trade_lower:
                return rate
        return 28.00
    
    @staticmethod
    def analyze_pay_fairness(
        db: Session,
        job_id: str,
        wage_threshold_percentage: float = 20
    ) -> Dict:
        """Analyze if a job is underpaid using Moorcheh AI with wage-data namespace"""
        try:
            job = db.query(Job).filter(Job.id == job_id).first()
            if not job:
                return {"status": "not_found", "alert": False}
            
            moorcheh = PayFairnessService._get_moorcheh()
            
            if moorcheh.client:
                # Use Moorcheh AI to analyze pay fairness against wage-data namespace
                result = moorcheh.analyze_pay_fairness(
                    trade=job.trade,
                    hourly_rate=job.hourly_rate,
                    location=job.location or "Canada"
                )
                
                market_rate = result.get("market_rate", 0)
                status = result.get("status", "unknown")
                alert = result.get("alert", False)
                recommendation = result.get("recommendation", "")
                
                if market_rate > 0:
                    job.market_rate = market_rate
                    job.pay_fairness_status = status
                    db.add(job)
                    db.commit()
                    
                    difference = job.hourly_rate - market_rate
                    difference_pct = (difference / market_rate) * 100 if market_rate > 0 else 0
                    
                    return {
                        "job_id": job_id,
                        "hourly_rate": job.hourly_rate,
                        "market_rate": market_rate,
                        "difference": difference,
                        "difference_percentage": difference_pct,
                        "status": status,
                        "alert": alert,
                        "recommendation": recommendation
                    }
            
            # Fallback to static data if Moorcheh unavailable or returned no market_rate
            market_rate = PayFairnessService.get_market_rate(job.trade, job.location)
            job.market_rate = market_rate
            
            difference = job.hourly_rate - market_rate
            difference_pct = (difference / market_rate) * 100 if market_rate > 0 else 0
            
            if difference_pct < -wage_threshold_percentage:
                status = "underpaid"
                alert = True
                recommendation = f"This job pays {abs(difference_pct):.1f}% below market rate. Consider negotiating or looking for better offers."
            elif difference_pct < 0:
                status = "slightly_underpaid"
                alert = False
                recommendation = f"This job pays {abs(difference_pct):.1f}% below market average."
            elif difference_pct <= 10:
                status = "fair"
                alert = False
                recommendation = "This job offers a fair market rate."
            else:
                status = "competitive"
                alert = False
                recommendation = f"This job pays {difference_pct:.1f}% above market rate."
            
            job.pay_fairness_status = status
            db.add(job)
            db.commit()
            
            return {
                "job_id": job_id,
                "hourly_rate": job.hourly_rate,
                "market_rate": market_rate,
                "difference": difference,
                "difference_percentage": difference_pct,
                "status": status,
                "alert": alert,
                "recommendation": recommendation
            }
            
        except Exception as e:
            logger.error(f"Pay fairness analysis failed: {e}")
            raise
    
    @staticmethod
    def batch_analyze_jobs(db: Session, wage_threshold_percentage: float = 20) -> Dict:
        try:
            jobs = db.query(Job).filter(Job.is_active == True).all()
            fairness_analysis = {
                "total_jobs": len(jobs),
                "underpaid": 0,
                "fair": 0,
                "competitive": 0,
                "jobs_analyzed": []
            }
            for job in jobs:
                analysis = PayFairnessService.analyze_pay_fairness(db, job.id, wage_threshold_percentage)
                if analysis['status'] == "underpaid":
                    fairness_analysis["underpaid"] += 1
                    fairness_analysis["jobs_analyzed"].append({
                        "job_id": job.id, "title": job.title, "alert": True
                    })
                elif analysis['status'] in ("fair", "slightly_underpaid"):
                    fairness_analysis["fair"] += 1
                else:
                    fairness_analysis["competitive"] += 1
            return fairness_analysis
        except Exception as e:
            logger.error(f"Batch pay fairness analysis failed: {e}")
            raise
