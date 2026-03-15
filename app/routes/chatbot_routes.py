import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from app.services.moorcheh_service import MoorchehRAGService, MoorchehRecommendationService
from app.services.pay_fairness_service import PayFairnessService
from app.services.contract_explainer_service import ContractExplainerService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/chatbot", tags=["chatbot"])

# Initialize services
rag_service = MoorchehRAGService()
recommendation_service = MoorchehRecommendationService()
contract_explainer = ContractExplainerService()


class ChatMessage(BaseModel):
    """Chat message request"""
    worker_id: str
    message: str


class ChatResponse(BaseModel):
    """Chat response"""
    worker_id: str
    user_message: str
    bot_response: str
    source: str = "moorcheh-rag"


class RecommendationRequest(BaseModel):
    """Job recommendation request"""
    worker_id: str
    trade: str
    experience_years: int
    certifications: list = []
    location: str
    num_recommendations: int = 5


class JobRecommendation(BaseModel):
    """Job recommendation response"""
    job_id: str
    relevance_score: float
    title: str
    company: str
    location: str
    hourly_rate: float


@router.post("/ask", response_model=ChatResponse)
async def ask_chatbot(request: ChatMessage):
    """
    Ask the AI chatbot questions about your profile, jobs, or recommendations
    
    - **worker_id**: Your worker ID
    - **message**: Your question (e.g., "What jobs match my electrician skills?")
    
    Returns: AI-generated answer from knowledge base
    """
    try:
        # Detect if user is asking about jobs
        job_keywords = ["job", "match", "employment", "hire", "position", "opportunity", "posting", "work", "salary", "rate", "companies"]
        is_job_query = any(keyword in request.message.lower() for keyword in job_keywords)
        
        if is_job_query:
            # Search both worker profiles and job postings
            answer = rag_service.find_jobs_for_worker(
                worker_query=request.worker_id,  # Find the worker
                job_query=request.message  # Search for matching jobs
            )
        else:
            # General Q&A using worker profiles namespace
            answer = rag_service.generate_answer_from_context(request.message)
        
        logger.info(f"Chatbot query from worker {request.worker_id}: {request.message}")
        
        return ChatResponse(
            worker_id=request.worker_id,
            user_message=request.message,
            bot_response=answer,
            source="moorcheh-rag"
        )
        
    except Exception as e:
        logger.error(f"Chatbot error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommendations/{worker_id}", response_model=list[JobRecommendation])
async def get_job_recommendations(
    worker_id: str,
    trade: str,
    experience_years: int = 0,
    location: str = "",
    num_recommendations: int = 5
):
    """
    Get personalized job recommendations for a worker
    
    - **worker_id**: Your worker ID
    - **trade**: Your trade/skill (e.g., "Electrician")
    - **experience_years**: Years of experience
    - **location**: Your location
    - **num_recommendations**: How many jobs to recommend (default: 5)
    
    Returns: List of recommended jobs ranked by relevance
    """
    try:
        # Build worker profile for recommendation
        worker_profile = f"""
        I am a {trade} with {experience_years} years of experience 
        located in {location}. I am looking for jobs in my trade.
        """
        
        # Get recommendations
        recommendations = recommendation_service.get_job_recommendations(
            worker_profile,
            num_recommendations
        )
        
        if not recommendations:
            logger.warning(f"No recommendations found for worker {worker_id}")
            return []
        
        # Format recommendations
        result = []
        for rec in recommendations:
            metadata = rec.get("metadata", {})
            result.append(
                JobRecommendation(
                    job_id=rec.get("job_id", ""),
                    relevance_score=rec.get("relevance_score", 0),
                    title=metadata.get("title", "Unknown Job"),
                    company=metadata.get("company", "Unknown Company"),
                    location=metadata.get("location", "Unknown Location"),
                    hourly_rate=metadata.get("hourly_rate", 0)
                )
            )
        
        logger.info(f"Generated {len(result)} recommendations for worker {worker_id}")
        return result
        
    except Exception as e:
        logger.error(f"Recommendation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search-workers")
async def search_workers(query: str, top_k: int = 5):
    """
    Search for workers in the knowledge base
    
    - **query**: Search query (e.g., "experienced electricians in Toronto")
    - **top_k**: Number of results to return
    
    Returns: List of matching workers
    """
    try:
        results = rag_service.query_worker_knowledge_base(query, top_k)
        
        logger.info(f"Worker search query: {query} - Found {len(results)} results")
        
        return {
            "query": query,
            "result_count": len(results),
            "results": results
        }
        
    except Exception as e:
        logger.error(f"Worker search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── Pay Check ──────────────────────────────────────────────────

class PayCheckRequest(BaseModel):
    trade: str
    hourly_rate: float
    location: str = "Canada"


class PayCheckResponse(BaseModel):
    trade: str
    your_rate: float
    market_rate: float
    difference_percentage: float
    status: str
    alert: bool
    recommendation: str


@router.post("/check-pay", response_model=PayCheckResponse)
async def check_pay(request: PayCheckRequest):
    """
    Compare a worker's pay against market rates.

    - **trade**: Trade type (e.g., "Electrician")
    - **hourly_rate**: Worker's current/expected hourly rate
    - **location**: Location (defaults to "Canada")
    """
    try:
        market_rate = PayFairnessService.get_market_rate(request.trade, request.location)
        difference = request.hourly_rate - market_rate
        difference_pct = (difference / market_rate) * 100 if market_rate > 0 else 0

        threshold = 20  # percent

        if difference_pct < -threshold:
            status = "underpaid"
            alert = True
            recommendation = (
                f"Your rate is {abs(difference_pct):.1f}% below market. "
                f"Consider negotiating for at least ${market_rate:.2f}/hr."
            )
        elif difference_pct < 0:
            status = "slightly_below"
            alert = False
            recommendation = (
                f"Your rate is {abs(difference_pct):.1f}% below market average. "
                f"Acceptable if benefits are strong."
            )
        elif difference_pct <= 10:
            status = "fair"
            alert = False
            recommendation = "Your pay is at a fair market rate."
        else:
            status = "competitive"
            alert = False
            recommendation = f"Great! You earn {difference_pct:.1f}% above market."

        return PayCheckResponse(
            trade=request.trade,
            your_rate=request.hourly_rate,
            market_rate=market_rate,
            difference_percentage=round(difference_pct, 1),
            status=status,
            alert=alert,
            recommendation=recommendation,
        )
    except Exception as e:
        logger.error(f"Pay check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── Contract Explainer ─────────────────────────────────────────

class ContractRequest(BaseModel):
    contract_text: str
    language: str = "simple"


class ContractResponse(BaseModel):
    original_text: str
    simplified_explanation: str
    key_points: List[str]
    potential_risks: List[str]
    recommendations: List[str]


@router.post("/explain-contract", response_model=ContractResponse)
async def explain_contract(request: ContractRequest):
    """
    Explain a contract clause in simple language.

    - **contract_text**: The contract text to explain
    - **language**: Language level (simple / intermediate / detailed)
    """
    try:
        result = contract_explainer.explain_contract(
            contract_text=request.contract_text,
            language_level=request.language,
        )
        return ContractResponse(
            original_text=result.original_text,
            simplified_explanation=result.simplified_explanation,
            key_points=result.key_points,
            potential_risks=result.potential_risks,
            recommendations=result.recommendations,
        )
    except Exception as e:
        logger.error(f"Contract explain error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
