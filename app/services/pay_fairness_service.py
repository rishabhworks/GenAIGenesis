import logging
from typing import Dict
from sqlalchemy.orm import Session
from app.models.job import Job

logger = logging.getLogger(__name__)

class PayFairnessService:
    """Service for detecting underpaid job postings"""
    
    # Typical market wages for different trades in Canada (hourly rates)
    # This should be updated with real data from Statistics Canada or labor surveys
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
    
    @staticmethod
    def get_market_rate(trade: str, location: str = "Canada") -> float:
        """
        Get market wage for a trade
        
        Args:
            trade: Trade type
            location: Location (for future integration with regional data)
        
        Returns:
            Market hourly rate in CAD
        """
        trade_lower = trade.lower()
        
        # Direct match
        if trade_lower in PayFairnessService.MARKET_WAGE_DATA:
            return PayFairnessService.MARKET_WAGE_DATA[trade_lower]
        
        # Partial match
        for market_trade, rate in PayFairnessService.MARKET_WAGE_DATA.items():
            if trade_lower in market_trade or market_trade in trade_lower:
                return rate
        
        # Default to general trades if no match
        logger.warning(f"Trade '{trade}' not in market data, using default")
        return 28.00
    
    @staticmethod
    def analyze_pay_fairness(
        db: Session,
        job_id: str,
        wage_threshold_percentage: float = 20
    ) -> Dict:
        """
        Analyze if a job is underpaid compared to market rate
        
        Args:
            db: Database session
            job_id: Job ID to analyze
            wage_threshold_percentage: Alert if pay is X% below market
        
        Returns:
            dict with fairness analysis
        """
        try:
            # Get job
            job = db.query(Job).filter(Job.id == job_id).first()
            if not job:
                logger.warning(f"Job not found: {job_id}")
                return {
                    "status": "not_found",
                    "alert": False
                }
            
            # Get market rate
            market_rate = PayFairnessService.get_market_rate(job.trade, job.location)
            
            # Store market rate in job
            job.market_rate = market_rate
            
            # Calculate difference
            salary_to_check = job.hourly_rate
            difference = salary_to_check - market_rate
            difference_percentage = (difference / market_rate) * 100 if market_rate > 0 else 0
            
            # Determine status
            if difference_percentage < -wage_threshold_percentage:
                status = "underpaid"
                alert = True
                recommendation = f"This job pays {abs(difference_percentage):.1f}% below market rate. Consider negotiating or looking for better offers."
            elif difference_percentage < 0:
                status = "slightly_underpaid"
                alert = False
                recommendation = f"This job pays {abs(difference_percentage):.1f}% below market average, but might be acceptable if benefits are good."
            elif difference_percentage <= 10:
                status = "fair"
                alert = False
                recommendation = "This job offers a fair market rate."
            else:
                status = "competitive"
                alert = False
                recommendation = f"Excellent! This job pays {difference_percentage:.1f}% above market rate."
            
            job.pay_fairness_status = status
            db.add(job)
            db.commit()
            
            return {
                "job_id": job_id,
                "hourly_rate": salary_to_check,
                "market_rate": market_rate,
                "difference": difference,
                "difference_percentage": difference_percentage,
                "status": status,
                "alert": alert,
                "recommendation": recommendation
            }
            
        except Exception as e:
            logger.error(f"Pay fairness analysis failed: {e}")
            raise
    
    @staticmethod
    def batch_analyze_jobs(
        db: Session,
        wage_threshold_percentage: float = 20
    ) -> Dict:
        """
        Analyze all jobs in database for pay fairness
        
        Args:
            db: Database session
            wage_threshold_percentage: Alert threshold
        
        Returns:
            Analysis summary
        """
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
                analysis = PayFairnessService.analyze_pay_fairness(
                    db, job.id, wage_threshold_percentage
                )
                
                if analysis['status'] == "underpaid":
                    fairness_analysis["underpaid"] += 1
                    fairness_analysis["jobs_analyzed"].append({
                        "job_id": job.id,
                        "title": job.title,
                        "alert": True
                    })
                elif analysis['status'] == "fair":
                    fairness_analysis["fair"] += 1
                else:
                    fairness_analysis["competitive"] += 1
            
            return fairness_analysis
            
        except Exception as e:
            logger.error(f"Batch pay fairness analysis failed: {e}")
            raise
