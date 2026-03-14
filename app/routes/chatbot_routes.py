import logging
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

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
    Ask the AI chatbot questions about your profile, jobs, or recommendations
    
    - **worker_id**: Your worker ID
    - **message**: Your question (e.g., "What jobs match my electrician skills?")
    
    Returns: AI-generated answer from knowledge base
    """
    try:
        # Generate answer using RAG
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
    num_recommendations: int = 5,
    db: Session = Depends(get_db)
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
async def search_workers(query: str, top_k: int = 5, db: Session = Depends(get_db)):
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
