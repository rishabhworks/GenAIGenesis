import logging
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.models.worker import Worker
from app.services.moorcheh_service import MoorchehRAGService, MoorchehRecommendationService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/chatbot", tags=["chatbot"])

rag_service = MoorchehRAGService()
recommendation_service = MoorchehRecommendationService()


class ChatMessage(BaseModel):
    worker_id: str
    message: str


class ChatResponse(BaseModel):
    worker_id: str
    user_message: str
    bot_response: str
    source: str = "moorcheh-rag"


class PayCheckRequest(BaseModel):
    trade: str
    hourly_rate: float
    location: str = "Canada"


class ContractRequest(BaseModel):
    contract_text: str
    language: str = "simple"


class RecommendationRequest(BaseModel):
    worker_id: str
    trade: str
    experience_years: int
    certifications: list = []
    location: str
    num_recommendations: int = 5


class JobRecommendation(BaseModel):
    job_id: str
    relevance_score: float
    title: str
    company: str
    location: str
    hourly_rate: float


def get_worker_profile_text(worker_id: str, db: Session) -> str:
    """Helper to get worker profile text from DB"""
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if worker:
        return f"""Worker ID: {worker.id}
Trade: {worker.trade}
Experience: {worker.experience_years} years
Certifications: {worker.certifications or 'None'}
Specialties: {worker.specialties or 'None'}
Location: {worker.location}
Availability: {worker.availability}
Expected Rate: ${worker.hourly_rate_expectation or 0}/hr"""
    return None


@router.post("/ask", response_model=ChatResponse)
async def ask_chatbot(request: ChatMessage, db: Session = Depends(get_db)):
    """
    Smart chatbot that auto-detects intent and routes to the right Moorcheh feature.
    """
    try:
        message_lower = request.message.lower()

        pay_keywords = ["underpaid", "pay fair", "wage", "salary fair", "market rate", "am i being paid", "is this pay", "pay check", "underpaying"]
        is_pay_query = any(kw in message_lower for kw in pay_keywords)

        contract_keywords = ["contract", "clause", "agreement", "terms", "legal", "employment agreement", "non-compete", "termination clause"]
        is_contract_query = any(kw in message_lower for kw in contract_keywords)

        job_keywords = ["job", "match", "employment", "hire", "position", "opportunity", "posting", "work for me", "companies", "find me", "skills"]
        is_job_query = any(kw in message_lower for kw in job_keywords)

        if is_contract_query and len(request.message) > 100:
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
            answer = rag_service.generate_answer_from_context(
                request.message, namespace="wage-data"
            )
            source = "moorcheh-pay-fairness"

        elif is_job_query:
            worker_profile_text = get_worker_profile_text(request.worker_id, db)
            if not worker_profile_text:
                worker_profile_text = request.worker_id

            answer = rag_service.find_jobs_for_worker(
                worker_query=worker_profile_text,
                job_query=request.message
            )
            source = "moorcheh-job-matching"

        else:
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
    """Check pay fairness using Moorcheh AI + wage-data namespace"""
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
    """Explain employment contract using Moorcheh AI"""
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
        worker_profile_text = get_worker_profile_text(worker_id, db)
        if not worker_profile_text:
            worker_profile_text = f"I am a {trade} with {experience_years} years of experience located in {location}."

        recommendations = recommendation_service.get_job_recommendations(
            worker_profile_text, num_recommendations
        )

        if not recommendations:
            return []

        result = []
        for rec in recommendations:
            job_text = rec.get("job_details", "")

            title = "Unknown Job"
            company = "Unknown Company"
            location_val = "Canada"
            hourly_rate = 0.0

            for line in job_text.split('\n'):
                line = line.strip()
                if line.startswith("Job Title:"):
                    title = line.replace("Job Title:", "").strip()
                elif line.startswith("Company:"):
                    company = line.replace("Company:", "").strip()
                elif line.startswith("Location:"):
                    location_val = line.replace("Location:", "").strip()
                elif line.startswith("Hourly Rate:"):
                    try:
                        hourly_rate = float(
                            line.replace("Hourly Rate:", "").replace("$", "").strip()
                        )
                    except ValueError:
                        hourly_rate = 0.0

            result.append(
                JobRecommendation(
                    job_id=rec.get("job_id", ""),
                    relevance_score=rec.get("relevance_score", 0),
                    title=title,
                    company=company,
                    location=location_val,
                    hourly_rate=hourly_rate
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