import logging
import json
from typing import Dict, List, Optional
from app.config import settings

logger = logging.getLogger(__name__)


def _get_moorcheh_client():
    """Create and return a MoorchehClient instance"""
    from moorcheh_sdk import MoorchehClient
    return MoorchehClient(
        api_key=settings.MOORCHEH_API_KEY,
        base_url=settings.MOORCHEH_BASE_URL
    )


def _ensure_namespace(client, namespace_name: str) -> None:
    """Create namespace if it doesn't exist"""
    try:
        from moorcheh_sdk import ConflictError
    except ImportError:
        ConflictError = Exception
    try:
        client.namespaces.create(namespace_name, type="text")
        logger.info(f"Created namespace: {namespace_name}")
    except ConflictError:
        logger.debug(f"{namespace_name} namespace already exists")
    except Exception as e:
        if "already exists" in str(e).lower() or "409" in str(e):
            logger.debug(f"{namespace_name} namespace already exists")
        else:
            logger.warning(f"Namespace creation issue: {e}")


# ===========================================================================
# Worker Profile Service (Moorcheh namespace: worker-profiles)
# ===========================================================================

class MoorchehRAGService:
    """Core Moorcheh service for worker profiles, job matching, and chatbot Q&A"""

    def __init__(self):
        try:
            self.client = _get_moorcheh_client()
            logger.info("MoorchehRAGService initialized")
        except Exception as e:
            logger.error(f"Failed to initialize MoorchehRAGService: {e}")
            self.client = None

    # ---- Worker Profiles ----

    def upload_user_profile_to_knowledge_base(self, worker_id: str, worker_data: Dict) -> bool:
        if not self.client:
            return False
        try:
            _ensure_namespace(self.client, "worker-profiles")

            profile_text = f"""Worker ID: {worker_id}
Name: {worker_data.get('name', 'N/A')}
Email: {worker_data.get('email', 'N/A')}
Phone: {worker_data.get('phone', 'N/A')}
Trade: {worker_data.get('trade', 'N/A')}
Experience: {worker_data.get('experience_years', 0)} years
Certifications: {', '.join(worker_data.get('certifications', []))}
Location: {worker_data.get('location', 'N/A')}
Specialized Skills: {', '.join(worker_data.get('specialties', []))}
Availability: {worker_data.get('availability', 'N/A')}
Expected Hourly Rate: ${worker_data.get('hourly_rate_expectation', 0)}"""

            self.client.documents.upload(
                namespace_name="worker-profiles",
                documents=[{"id": f"worker-{worker_id}", "text": profile_text}]
            )
            logger.info(f"Worker profile uploaded: {worker_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to upload worker profile: {e}")
            return False

    def query_worker_knowledge_base(self, query: str, top_k: int = 5) -> List[Dict]:
        if not self.client:
            return []
        try:
            results = self.client.similarity_search.query(
                namespaces=["worker-profiles"], query=query, top_k=top_k
            )
            matches = []
            for m in results.get("results", []):
                matches.append({
                    "worker_id": m.get("metadata", {}).get("worker_id", m.get("id")),
                    "relevance_score": m.get("score", 0),
                    "text": m.get("text"),
                    "metadata": m.get("metadata", {})
                })
            return matches
        except Exception as e:
            logger.error(f"Failed to query worker knowledge base: {e}")
            return []

    # ---- Chatbot Q&A (RAG over worker-profiles) ----

    def generate_answer_from_context(self, query: str, namespace: str = "worker-profiles") -> str:
        if not self.client:
            return "RAG service not available"
        try:
            response = self.client.answer.generate(
                namespace=namespace,
                query=query,
                top_k=5,
                temperature=0.7,
                header_prompt="You are TradePass, an AI career assistant for skilled trades workers. Answer questions helpfully based on worker profiles and job data."
            )
            return response.get("answer", "No answer generated.")
        except Exception as e:
            logger.error(f"Failed to generate answer: {e}")
            return f"Error generating answer: {str(e)}"

    # ---- Feature 1: Intelligent Job Matching (Moorcheh semantic search + AI) ----

    def find_jobs_for_worker(self, worker_query: str, job_query: str = None) -> str:
        if not self.client:
            return "RAG service not available"
        try:
            if job_query is None:
                job_query = worker_query

            worker_results = self.client.similarity_search.query(
                namespaces=["worker-profiles"], query=worker_query, top_k=3
            )
            job_results = self.client.similarity_search.query(
                namespaces=["job-postings"], query=job_query, top_k=5
            )

            worker_context = "\n".join(
                f"Worker Profile:\n{m.get('text', '')}" for m in worker_results.get("results", [])
            )
            job_context = "\n".join(
                f"Job Opportunity:\n{m.get('text', '')}" for m in job_results.get("results", [])
            )

            if not worker_context:
                return "Worker profile not found in knowledge base."
            if not job_context:
                return "No matching jobs found. Try different search terms."

            combined_query = f"""You are a job matching expert for TradePass. Based on the worker profile and available jobs,
identify the best job matches and explain why they're suitable.

WORKER PROFILE:
{worker_context}

AVAILABLE JOBS:
{job_context}

Please:
1. Rank jobs by match quality (best first)
2. Give each a match score (0-100%)
3. Explain why each job fits
4. Note any certification gaps
5. Include pay rate info

Format as a clear, easy-to-read recommendation list."""

            response = self.client.answer.generate(
                namespace="",  # Direct AI Mode
                query=combined_query,
                temperature=0.5
            )
            return response.get("answer", "No answer generated.")
        except Exception as e:
            logger.error(f"Failed to find jobs for worker: {e}")
            return f"Error finding jobs: {str(e)}"

    # ---- Feature 2: Pay Fairness Detection (Moorcheh AI) ----

    def analyze_pay_fairness(self, trade: str, hourly_rate: float, location: str = "Canada") -> Dict:
        """Use Moorcheh to analyze whether a job's pay is fair vs market data"""
        if not self.client:
            return {"status": "error", "alert": False, "recommendation": "Service unavailable"}
        try:
            # First search wage-data namespace for relevant market data
            wage_results = self.client.similarity_search.query(
                namespaces=["wage-data"],
                query=f"{trade} wages in {location}",
                top_k=3
            )
            wage_context = "\n".join(
                m.get("text", "") for m in wage_results.get("results", [])
            )

            query = f"""You are a pay fairness analyst for Canadian skilled trades workers.

MARKET WAGE DATA:
{wage_context}

ANALYSIS REQUEST:
- Trade: {trade}
- Offered Hourly Rate: ${hourly_rate:.2f} CAD
- Location: {location}

Based on the market wage data above, analyze whether ${hourly_rate:.2f}/hr is fair for a {trade} in {location}.

Return your analysis as JSON with these exact fields:
{{
  "market_rate": <average market hourly rate as number>,
  "difference_percentage": <percentage difference, negative if underpaid>,
  "status": "<one of: underpaid, slightly_underpaid, fair, competitive>",
  "alert": <true if significantly underpaid (>20% below market), false otherwise>,
  "recommendation": "<actionable advice for the worker>"
}}

Return ONLY the JSON object, no other text."""

            response = self.client.answer.generate(
                namespace="",  # Direct AI Mode - context in query
                query=query,
                temperature=0.2
            )

            answer_text = response.get("answer", "{}")
            # Parse JSON from response
            try:
                # Strip markdown code fences if present
                clean = answer_text.strip()
                if clean.startswith("```"):
                    clean = clean.split("\n", 1)[1] if "\n" in clean else clean[3:]
                    clean = clean.rsplit("```", 1)[0]
                result = json.loads(clean.strip())
                result["hourly_rate"] = hourly_rate
                result["trade"] = trade
                result["location"] = location
                return result
            except json.JSONDecodeError:
                return {
                    "hourly_rate": hourly_rate,
                    "market_rate": 0,
                    "difference_percentage": 0,
                    "status": "unknown",
                    "alert": False,
                    "recommendation": answer_text,
                    "trade": trade,
                    "location": location
                }
        except Exception as e:
            logger.error(f"Pay fairness analysis failed: {e}")
            return {"status": "error", "alert": False, "recommendation": str(e)}

    # ---- Feature 3: Contract Explanation (Moorcheh Direct AI) ----

    def explain_contract(self, contract_text: str, language_level: str = "simple") -> Dict:
        """Use Moorcheh AI to explain employment contracts in plain language"""
        if not self.client:
            return {"simplified_explanation": "Service unavailable", "key_points": [], "potential_risks": [], "recommendations": []}
        try:
            language_instruction = {
                "simple": "Explain in very simple language, as if speaking to someone with no legal background.",
                "intermediate": "Explain clearly with some legal terms defined.",
                "detailed": "Provide a detailed legal explanation."
            }.get(language_level, "Explain in very simple language.")

            query = f"""You are a legal expert helping skilled trades workers understand employment contracts.

{language_instruction}

CONTRACT TEXT:
{contract_text}

Analyze this contract and return your response as JSON with these exact fields:
{{
  "simplified_explanation": "Easy-to-understand explanation of what this contract means",
  "key_points": ["important point 1", "important point 2", ...],
  "potential_risks": ["risk 1", "risk 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}}

Return ONLY the JSON object, no other text."""

            response = self.client.answer.generate(
                namespace="",  # Direct AI Mode
                query=query,
                temperature=0.3,
                header_prompt="You are a legal expert specialized in employment law for skilled trades in Canada. Always protect workers' interests."
            )

            answer_text = response.get("answer", "{}")
            try:
                clean = answer_text.strip()
                if clean.startswith("```"):
                    clean = clean.split("\n", 1)[1] if "\n" in clean else clean[3:]
                    clean = clean.rsplit("```", 1)[0]
                return json.loads(clean.strip())
            except json.JSONDecodeError:
                return {
                    "simplified_explanation": answer_text,
                    "key_points": [],
                    "potential_risks": [],
                    "recommendations": []
                }
        except Exception as e:
            logger.error(f"Contract explanation failed: {e}")
            return {"simplified_explanation": str(e), "key_points": [], "potential_risks": [], "recommendations": []}

    # ---- Feature 4: Voice Profile Extraction (Moorcheh Direct AI) ----

    def extract_profile_from_transcript(self, transcript: str) -> Dict:
        """Use Moorcheh AI to extract structured worker profile from voice transcript"""
        if not self.client:
            return None
        try:
            query = f"""Extract structured worker profile information from this voice transcript.

TRANSCRIPT:
{transcript}

Return a JSON object with these exact fields:
{{
  "trade": "type of skilled trade",
  "experience_years": <integer>,
  "certifications": ["cert1", "cert2"],
  "specialties": ["specialty1", "specialty2"],
  "location": "city, province",
  "availability": "Full-time or Part-time or Contract",
  "summary": "Brief 1-2 sentence professional summary",
  "confidence_score": <0.0 to 1.0, how confident in extraction>
}}

Return ONLY the JSON object."""

            response = self.client.answer.generate(
                namespace="",  # Direct AI Mode
                query=query,
                temperature=0.2,
                header_prompt="You are a profile extraction specialist. Extract accurate structured data from worker descriptions."
            )

            answer_text = response.get("answer", "{}")
            try:
                clean = answer_text.strip()
                if clean.startswith("```"):
                    clean = clean.split("\n", 1)[1] if "\n" in clean else clean[3:]
                    clean = clean.rsplit("```", 1)[0]
                return json.loads(clean.strip())
            except json.JSONDecodeError:
                return None
        except Exception as e:
            logger.error(f"Profile extraction failed: {e}")
            return None


# ===========================================================================
# Job Recommendations Service (Moorcheh namespace: job-postings)
# ===========================================================================

class MoorchehRecommendationService:
    """Service for job recommendations using Moorcheh semantic search"""

    def __init__(self):
        try:
            self.client = _get_moorcheh_client()
            logger.info("MoorchehRecommendationService initialized")
        except Exception as e:
            logger.error(f"Failed to initialize MoorchehRecommendationService: {e}")
            self.client = None

    def upload_job_to_index(self, job_id: str, job_data: Dict) -> bool:
        if not self.client:
            return False
        try:
            _ensure_namespace(self.client, "job-postings")

            job_text = f"""Job Title: {job_data.get('title', 'N/A')}
Trade Required: {job_data.get('trade', 'N/A')}
Description: {job_data.get('description', 'N/A')}
Required Experience: {job_data.get('required_experience_years', 0)} years
Required Certifications: {', '.join(job_data.get('required_certifications', []))}
Location: {job_data.get('location', 'N/A')}
Hourly Rate: ${job_data.get('hourly_rate', 0)}
Job Type: {job_data.get('job_type', 'N/A')}
Company: {job_data.get('company') or job_data.get('company_name', 'N/A')}
Specialties: {', '.join(job_data.get('specialties', []))}"""

            self.client.documents.upload(
                namespace_name="job-postings",
                documents=[{"id": f"job-{job_id}", "text": job_text}]
            )
            logger.info(f"Job uploaded: {job_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to upload job: {e}")
            return False

    def get_job_recommendations(self, worker_profile_text: str, num_recommendations: int = 5) -> List[Dict]:
        if not self.client:
            return []
        try:
            results = self.client.similarity_search.query(
                namespaces=["job-postings"],
                query=worker_profile_text,
                top_k=num_recommendations
            )
            recommendations = []
            for m in results.get("results", []):
                recommendations.append({
                    "job_id": m.get("metadata", {}).get("job_id", m.get("id")),
                    "relevance_score": m.get("score", 0),
                    "job_details": m.get("text"),
                    "metadata": m.get("metadata", {})
                })
            return recommendations
        except Exception as e:
            logger.error(f"Failed to get recommendations: {e}")
            return []


# ===========================================================================
# Wage Data Service (Moorcheh namespace: wage-data)
# ===========================================================================

class MoorchehWageDataService:
    """Service for managing Canadian trade wage data in Moorcheh"""

    def __init__(self):
        try:
            self.client = _get_moorcheh_client()
            logger.info("MoorchehWageDataService initialized")
        except Exception as e:
            logger.error(f"Failed to initialize MoorchehWageDataService: {e}")
            self.client = None

    def upload_wage_data(self, wage_records: List[Dict]) -> bool:
        if not self.client:
            return False
        try:
            _ensure_namespace(self.client, "wage-data")
            documents = []
            for record in wage_records:
                doc_text = f"""Trade: {record['trade']}
Location: {record.get('location', 'Canada')}
Province: {record.get('province', 'National')}
Average Hourly Rate: ${record['average_hourly']:.2f} CAD
Median Hourly Rate: ${record.get('median_hourly', record['average_hourly']):.2f} CAD
25th Percentile: ${record.get('percentile_25', record['average_hourly'] * 0.85):.2f} CAD
75th Percentile: ${record.get('percentile_75', record['average_hourly'] * 1.15):.2f} CAD
Annual Salary (avg): ${record.get('annual_salary', record['average_hourly'] * 2080):.0f} CAD
Source: {record.get('source', 'Canadian Labour Market Data 2025-2026')}
Last Updated: {record.get('updated', '2026-01')}"""

                documents.append({
                    "id": f"wage-{record['trade'].lower().replace(' ', '-')}-{record.get('province', 'nat').lower()}",
                    "text": doc_text
                })

            self.client.documents.upload(namespace_name="wage-data", documents=documents)
            logger.info(f"Uploaded {len(documents)} wage data records")
            return True
        except Exception as e:
            logger.error(f"Failed to upload wage data: {e}")
            return False
