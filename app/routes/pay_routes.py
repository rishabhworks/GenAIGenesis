import logging
from app.schemas.job_schema import PayFairnessRequest, PayFairnessResponse, DirectPayCheckRequest, DirectPayCheckResponse
from app.services.moorcheh_service import MoorchehRAGService
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.job_schema import PayFairnessRequest, PayFairnessResponse
from app.services.pay_fairness_service import PayFairnessService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/pay", tags=["pay"])

@router.post("/check", response_model=PayFairnessResponse)
async def check_pay_fairness(
    request: PayFairnessRequest,
    db: Session = Depends(get_db)
):
    """
    Check if a job is paying fair market rate
    
    Returns:
    - status: "fair", "underpaid", "competitive", "slightly_underpaid"
    - alert: true if job is significantly underpaid
    - recommendation: actionable advice
    """
    try:
        analysis = PayFairnessService.analyze_pay_fairness(db, request.job_id)
        
        if analysis.get('status') == 'not_found':
            raise HTTPException(status_code=404, detail="Job not found")
        
        return PayFairnessResponse(**analysis)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Pay fairness check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analysis")
async def get_pay_analysis(
    db: Session = Depends(get_db)
):
    """
    Get pay fairness analysis for all jobs
    
    Returns summary of underpaid jobs and average rates
    """
    try:
        analysis = PayFairnessService.batch_analyze_jobs(db)
        return analysis
        
    except Exception as e:
        logger.error(f"Batch pay analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/market-rate/{trade}")
async def get_market_rate(
    trade: str,
    location: str = "Canada"
):
    """
    Get market wage for a specific trade
    
    Returns: Market hourly rate in CAD
    """
    try:
        market_rate = PayFairnessService.get_market_rate(trade, location)
        return {
            "trade": trade,
            "location": location,
            "market_rate_hourly": market_rate,
            "currency": "CAD"
        }
        
    except Exception as e:
        logger.error(f"Get market rate failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/direct-check", response_model=DirectPayCheckResponse)
async def direct_pay_check(request: DirectPayCheckRequest):
    """
    Check pay fairness directly using trade, hourly rate and location.
    Uses Moorcheh AI + wage data namespace — no job_id required.
    """
    try:
        rag_service = MoorchehRAGService()
        result = rag_service.analyze_pay_fairness(
            trade=request.trade,
            hourly_rate=request.hourly_rate,
            location=request.location
        )

        if result.get('status') == 'error':
            raise HTTPException(status_code=500, detail=result.get('recommendation', 'Analysis failed'))

        return DirectPayCheckResponse(
            trade=request.trade,
            hourly_rate=request.hourly_rate,
            market_rate=result.get('market_rate', 0),
            difference_percentage=result.get('difference_percentage', 0),
            status=result.get('status', 'unknown'),
            alert=result.get('alert', False),
            recommendation=result.get('recommendation', ''),
            location=request.location
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Direct pay check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))