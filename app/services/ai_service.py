import logging
import json
from typing import Dict, List
import google.generativeai as genai
from app.config import settings
from app.schemas.worker_schema import WorkerProfileResponse

logger = logging.getLogger(__name__)

class AIService:
    """Service for AI operations using Google Gemini API"""
    
    def __init__(self):
        """Initialize Gemini API client"""
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model_name = settings.GEMINI_MODEL
            logger.info(f"AI Service initialized with Google Gemini ({self.model_name})")
        except Exception as e:
            logger.error(f"Failed to initialize AI Service: {e}")
            raise
    
    def extract_worker_profile(self, transcript: str) -> WorkerProfileResponse:
        """
        Extract structured worker profile from voice transcript
        
        Args:
            transcript: Voice-to-text transcript
        
        Returns:
            WorkerProfileResponse with extracted information
        """
        try:
            prompt = f"""Extract the following information from the worker's description and return as JSON:
- trade (type of skilled trade)
- experience_years (years of experience as integer)
- certifications (list of certifications)
- specialties (list of specialties/skills)
- location (city and province/state)
- availability (Full-time, Part-time, or Contract)
- summary (brief 1-2 sentence summary of the worker)
- confidence_score (0-1, how confident in extraction)

Worker's description:
{transcript}

Return ONLY valid JSON in this exact format:
{{
  "trade": "trade name",
  "experience_years": 5,
  "certifications": ["cert1", "cert2"],
  "specialties": ["spec1", "spec2"],
  "location": "city, province",
  "availability": "Full-time",
  "summary": "Brief summary",
  "confidence_score": 0.9
}}"""

            result = self._invoke_gemini_model(prompt)
            
            # Parse JSON response
            try:
                profile_data = json.loads(result)
                profile_data['confidence_score'] = profile_data.get('confidence_score', 0.85)
                return WorkerProfileResponse(**profile_data)
            except json.JSONDecodeError:
                logger.warning(f"Failed to parse AI response as JSON: {result}")
                # Fallback response
                return WorkerProfileResponse(
                    trade="General Trades",
                    experience_years=0,
                    certifications=[],
                    specialties=[],
                    location="Canada",
                    availability="Full-time",
                    summary=transcript[:100],
                    confidence_score=0.5
                )
                
        except Exception as e:
            logger.error(f"Worker profile extraction failed: {e}")
            raise
    
    def explain_contract(self, contract_text: str, language_level: str = "simple") -> Dict:
        """
        Explain legal contract in simple language
        
        Args:
            contract_text: Contract clause or full contract
            language_level: "simple", "intermediate", or "detailed"
        
        Returns:
            dict with simplified explanation, key points, and potential risks
        """
        try:
            language_instruction = {
                "simple": "Explain in very simple language, like explaining to someone with no legal background",
                "intermediate": "Explain in clear language with some legal terms explained",
                "detailed": "Provide a detailed explanation maintaining legal terminology"
            }.get(language_level, "simple")
            
            prompt = f"""You are a legal expert helping workers understand employment contracts.

{language_instruction}

Contract clause:
{contract_text}

Provide your response in the following JSON format:
{{
  "simplified_explanation": "Simple explanation of what this means",
  "key_points": ["point 1", "point 2", "point 3"],
  "potential_risks": ["risk 1", "risk 2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}}

Return ONLY valid JSON, no other text."""

            result = self._invoke_gemini_model(prompt)
            
            try:
                explanation = json.loads(result)
                return explanation
            except json.JSONDecodeError:
                logger.warning(f"Failed to parse contract explanation as JSON")
                return {
                    "simplified_explanation": result,
                    "key_points": [],
                    "potential_risks": [],
                    "recommendations": []
                }
                
        except Exception as e:
            logger.error(f"Contract explanation failed: {e}")
            raise
    
    def match_jobs_to_worker(self, worker_profile: Dict, job_postings: List[Dict]) -> List[Dict]:
        """
        Match worker to jobs and calculate relevance scores
        
        Args:
            worker_profile: Worker information
            job_postings: List of job postings
        
        Returns:
            List of matched jobs with scores
        """
        try:
            jobs_text = "\n".join([
                f"Job {i+1}: {job.get('title')} - {job.get('description')}"
                for i, job in enumerate(job_postings)
            ])
            
            prompt = f"""Analyze job matches for a worker with the following profile:
Trade: {worker_profile.get('trade')}
Experience: {worker_profile.get('experience_years')} years
Certifications: {', '.join(worker_profile.get('certifications', []))}
Specialties: {', '.join(worker_profile.get('specialties', []))}

Available jobs:
{jobs_text}

For each job, provide a JSON array with:
- job_index (0-based position)
- match_score (0-100)
- reason (why it matches)

Return ONLY valid JSON array like this:
[
  {{"job_index": 0, "match_score": 95, "reason": "Excellent match..."}}
]

No other text."""

            result = self._invoke_gemini_model(prompt)
            
            try:
                matches = json.loads(result)
                return matches
            except json.JSONDecodeError:
                logger.warning("Failed to parse job matches as JSON")
                return []
                
        except Exception as e:
            logger.error(f"Job matching failed: {e}")
            raise
    
    def _invoke_gemini_model(self, prompt: str) -> str:
        """
        Internal method to invoke Gemini model
        
        Args:
            prompt: The prompt to send to the model
        
        Returns:
            Model response text
        """
        try:
            model = genai.GenerativeModel(self.model_name)
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    top_p=0.9,
                    top_k=40,
                )
            )
            
            return response.text
            
        except Exception as e:
            logger.error(f"Gemini model invocation failed: {e}")
            raise

