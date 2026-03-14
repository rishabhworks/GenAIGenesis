import logging
from fastapi import APIRouter, HTTPException, Depends

from app.schemas.job_schema import ContractExplanationRequest, ContractExplanationResponse
from app.services.contract_explainer_service import ContractExplainerService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/contracts", tags=["contracts"])

# Initialize service
contract_service = ContractExplainerService()

@router.post("/explain", response_model=ContractExplanationResponse)
async def explain_contract(
    request: ContractExplanationRequest
):
    """
    Explain employment contract in simple language
    
    - **contract_text**: The contract clause or full contract to explain
    - **language**: "simple", "intermediate", or "detailed"
    
    Returns:
    - simplified_explanation: Easy to understand explanation
    - key_points: Important things to know
    - potential_risks: Things to watch out for
    - recommendations: Suggested actions
    """
    try:
        explanation = contract_service.explain_contract(
            contract_text=request.contract_text,
            language_level=request.language
        )
        
        return explanation
        
    except Exception as e:
        logger.error(f"Contract explanation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extract-clauses")
async def extract_important_clauses(
    request: ContractExplanationRequest
):
    """
    Extract important clauses from contract
    
    Identifies key sections like salary, benefits, termination, etc.
    """
    try:
        clauses = contract_service.extract_key_clauses(request.contract_text)
        
        return {
            "total_clauses_found": len(clauses),
            "clauses": clauses
        }
        
    except Exception as e:
        logger.error(f"Clause extraction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/identify-risks")
async def identify_risky_clauses(
    request: ContractExplanationRequest
):
    """
    Identify potentially risky clauses in contract
    
    Flags clauses that workers should pay special attention to
    """
    try:
        risky_clauses = contract_service.flag_risky_clauses(request.contract_text)
        
        return {
            "risky_clauses_found": len(risky_clauses),
            "high_severity": len([c for c in risky_clauses if c['severity'] == 'high']),
            "risky_clauses": risky_clauses
        }
        
    except Exception as e:
        logger.error(f"Risk identification failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
