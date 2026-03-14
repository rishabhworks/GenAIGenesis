import logging
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.services.moorcheh_service import MoorchehRAGService, MoorchehRecommendationService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/chatbot", tags=["chatbot"])

# Initialize services
rag_service = MoorchehRAGService()
recommendation_service = MoorchehRecommendationService()


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


class PayCheckRequest(BaseModel):
    """Pay fairness check via chatbot"""
    trade: str
    hourly_rate: float
    location: str = "Canada"


class ContractRequest(BaseModel):
    """Contract explanation request via chatbot"""
    contract_text: str
    language: str = "simple"


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
async def ask_chatbot(request: ChatMessage, db: Session = Depends(get_db)):
    """
    Smart chatbot that auto-detects intent and routes to the right Moorcheh feature:
    - Job matching queries -> Moorcheh semantic search + AI job matching
    - Pay fairness queries -> Moorcheh AI pay analysis
    - Contract queries -> Moorcheh AI contract explanation
    - General queries -> Moorcheh RAG over worker-profiles
    """
    try:
        message_lower = request.message.lower()

        # Detect pay fairness queries
        pay_keywords = ["underpaid", "pay fair", "wage", "salary fair", "market rate", "am i being paid", "is this pay", "pay check", "underpaying"]
        is_pay_query = any(kw in message_lower for kw in pay_keywords)

        # Detect contract queries
        contract_keywords = ["contract", "clause", "agreement", "terms", "legal", "employment agreement", "non-compete", "termination clause"]
        is_contract_query = any(kw in message_lower for kw in contract_keywords)

        # Detect job queries
        job_keywords = ["job", "match", "employment", "hire", "position", "opportunity", "posting", "work for me", "companies", "find me"]
        is_job_query = any(kw in message_lower for kw in job_keywords)

        if is_contract_query and len(request.message) > 100:
            # Long message with contract keywords => contract explanation
            result = rag_service.explain_contract(request.message, "simple")
            answer = f"**Contract Explanation:**\n\n{result.get('simplified_explanation', '')}"
            if result.get('key_points'):
                answer += "\n\n**Key Points:**\n" + "\n".join(f"* {p}" for p in result['key_points'])
            if result.get('potential_risks'):
                answer += "\n\n**Potential Risks:**\n" + "\n".join(f"* {r}" for r in result['potential_risks'])
            if result.get('recommendations'):
                answer += "\n\n**Recommendations:**\n" + "\n".join(f"* {r}" for r in result['recommendations'])
            source = "moorcheh-contract-ai"

        elif is_pay_query:
            # Pay fairness query - use Moorcheh AI analysis
            answer = rag_service.generate_answer_from_context(request.message, namespace="wage-data")
            source = "moorcheh-pay-fairness"

        elif is_job_query:
            # Job matching - search both namespaces
            answer = rag_service.find_jobs_for_worker(
                worker_query=request.worker_id,
                job_query=request.message
            )
            source = "moorcheh-job-matching"

        else:
            # General Q&A using worker profiles
            answer = rag_service.generate_answer_from_context(request.message)
            source = "moorcheh-rag"

        return ChatResponse(
            worker_id=request.worker_id,
            user_message=request.message,
            bot_response=answer,
            source=source
        )

    except Exception as e:
        logger.error(f"Chatbot error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/check-pay")
async def check_pay_fairness_chat(request: PayCheckRequest):
    """
    Check pay fairness using Moorcheh AI + wage-data namespace
    """
    try:
        result = rag_service.analyze_pay_fairness(
            trade=request.trade,
            hourly_rate=request.hourly_rate,
            location=request.location
        )
        return result
    except Exception as e:
        logger.error(f"Pay check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/explain-contract")
async def explain_contract_chat(request: ContractRequest):
    """
    Explain employment contract using Moorcheh AI (Direct AI Mode)
    """
    try:
        result = rag_service.explain_contract(
            contract_text=request.contract_text,
            language_level=request.language
        )
        return result
    except Exception as e:
        logger.error(f"Contract explanation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommendations/{worker_id}")
async def get_job_recommendations(
    worker_id: str,
    trade: str = "general",
    experience_years: int = 0,
    location: str = "",
    num_recommendations: int = 5,
    db: Session = Depends(get_db)
):
    """Get job recommendations using Moorcheh semantic search"""
    try:
        worker_profile = f"I am a {trade} with {experience_years} years of experience located in {location}."
        recommendations = recommendation_service.get_job_recommendations(
            worker_profile, num_recommendations
        )
        if not recommendations:
            return []
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
        return result
    except Exception as e:
        logger.error(f"Recommendation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search-workers")
async def search_workers(query: str, top_k: int = 5, db: Session = Depends(get_db)):
    """Search workers using Moorcheh semantic search"""
    try:
        results = rag_service.query_worker_knowledge_base(query, top_k)
        return {"query": query, "result_count": len(results), "results": results}
    except Exception as e:
        logger.error(f"Worker search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
