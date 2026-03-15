import logging
from typing import Dict, List, Optional
from app.config import settings

logger = logging.getLogger(__name__)

class MoorchehRAGService:
    """Service for Moorcheh RAG (Retrieval-Augmented Generation) integration"""
    
    def __init__(self):
        """Initialize Moorcheh client"""
        try:
            # Import moorcheh_sdk
            from moorcheh_sdk import MoorchehClient
            
            self.client = MoorchehClient(
                api_key=settings.MOORCHEH_API_KEY,
                base_url=settings.MOORCHEH_BASE_URL
            )
            logger.info("Moorcheh RAG Service initialized")
        except ImportError:
            logger.warning("moorcheh_sdk not installed. Install with: pip install moorcheh-sdk")
            self.client = None
        except Exception as e:
            logger.error(f"Failed to initialize Moorcheh: {e}")
            self.client = None
    
    def upload_user_profile_to_knowledge_base(self, worker_id: str, worker_data: Dict) -> bool:
        """
        Upload worker profile to Moorcheh knowledge base
        
        Args:
            worker_id: Unique worker identifier
            worker_data: Worker profile data (name, email, phone, etc.)
        
        Returns:
            bool: Success status
        """
        if not self.client:
            logger.warning("Moorcheh client not available")
            return False
        
        try:
            # Ensure namespace exists first
            try:
                self.client.create_namespace("worker-profiles", type="text")
                logger.info("Created worker-profiles namespace")
            except Exception as ns_error:
                if "already exists" in str(ns_error).lower() or "409" in str(ns_error):
                    logger.debug("worker-profiles namespace already exists")
                else:
                    logger.debug(f"Namespace check: {ns_error}")
            
            # Format worker data as text for semantic search
            profile_text = f"""
Worker ID: {worker_id}
Name: {worker_data.get('name', 'N/A')}
Email: {worker_data.get('email', 'N/A')}
Phone: {worker_data.get('phone', 'N/A')}
Trade: {worker_data.get('trade', 'N/A')}
Experience: {worker_data.get('experience_years', 0)} years
Certifications: {', '.join(worker_data.get('certifications', []))}
Location: {worker_data.get('location', 'N/A')}
Specialized Skills: {', '.join(worker_data.get('specialties', []))}
Availability: {worker_data.get('availability', 'N/A')}
Expected Hourly Rate: ${worker_data.get('hourly_rate_expectation', 0)}
"""
            
            documents = [
                {
                    "id": f"worker-{worker_id}",
                    "text": profile_text,
                    "worker_id": worker_id,
                    "trade": worker_data.get('trade', 'unknown'),
                    "location": worker_data.get('location', 'unknown'),
                    "type": "worker_profile"
                }
            ]
            
            # Use upload_documents method (correct Moorcheh API)
            response = self.client.upload_documents(
                namespace_name="worker-profiles",
                documents=documents
            )
            
            logger.info(f"Worker profile uploaded for {worker_id}: {response}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to upload worker profile: {e}")
            return False
    
    def find_profile_by_email(self, email: str) -> Optional[Dict]:
        """Search Moorcheh for an existing worker profile by email."""
        if not self.client:
            return None
        try:
            results = self.client.search(
                namespaces=["worker-profiles"],
                query=f"Email: {email}",
                top_k=3
            )
            for match in results.get("results", []):
                text = match.get("text", "")
                # Confirm the email actually appears in the result text
                if email.lower() in text.lower():
                    # Parse profile fields from the stored text
                    profile = {}
                    for line in text.strip().splitlines():
                        line = line.strip()
                        if not line or ":" not in line:
                            continue
                        key, _, val = line.partition(":")
                        val = val.strip()
                        key = key.strip()
                        field_map = {
                            "Worker ID": "worker_id",
                            "Name": "name",
                            "Email": "email",
                            "Phone": "phone",
                            "Trade": "trade",
                            "Location": "location",
                            "Availability": "availability",
                        }
                        if key in field_map:
                            profile[field_map[key]] = val
                        elif key == "Experience":
                            try:
                                profile["experience_years"] = int(val.split()[0])
                            except (ValueError, IndexError):
                                profile["experience_years"] = 0
                        elif key == "Certifications":
                            profile["certifications"] = [c.strip() for c in val.split(",") if c.strip()]
                        elif key == "Specialized Skills":
                            profile["specialties"] = [s.strip() for s in val.split(",") if s.strip()]
                        elif key == "Expected Hourly Rate":
                            try:
                                profile["hourly_rate_expectation"] = float(val.replace("$", ""))
                            except ValueError:
                                profile["hourly_rate_expectation"] = 0
                    if profile.get("email"):
                        profile.setdefault("skill_summary", "")
                        return profile
            return None
        except Exception as e:
            logger.error(f"Email lookup failed: {e}")
            return None
    
    def query_worker_knowledge_base(self, query: str, top_k: int = 5) -> List[Dict]:
        """
        Search worker knowledge base using semantic search
        
        Args:
            query: Search query (e.g., "electricians in Toronto")
            top_k: Number of results to return
        
        Returns:
            List of matching worker profiles
        """
        if not self.client:
            logger.warning("Moorcheh client not available")
            return []
        
        try:
            results = self.client.search(
                namespaces=["worker-profiles"],
                query=query,
                top_k=top_k
            )
            
            matches = []
            for match in results.get("results", []):
                matches.append({
                    "worker_id": match.get("worker_id") or match.get("metadata", {}).get("worker_id"),
                    "relevance_score": match.get("score"),
                    "text": match.get("text"),
                    "metadata": match.get("metadata", {})
                })
            
            logger.info(f"Found {len(matches)} worker profiles for query: {query}")
            return matches
            
        except Exception as e:
            logger.error(f"Failed to query worker knowledge base: {e}")
            return []
    
    def generate_answer_from_context(self, query: str, namespace: str = "worker-profiles") -> str:
        """
        Generate AI answer using semantic search + Gemini
        
        Args:
            query: User question
            namespace: Knowledge base namespace
        
        Returns:
            AI-generated answer based on search results
        """
        if not self.client:
            logger.warning("Moorcheh client not available")
            return "RAG service not available"
        
        try:
            import google.generativeai as genai
            
            # First, search the knowledge base
            search_results = self.client.search(
                namespaces=[namespace],
                query=query,
                top_k=3
            )
            
            # Extract context from search results
            context = ""
            for match in search_results.get("results", []):
                context += f"- {match.get('text', '')}\n"
            
            if not context:
                return "No relevant information found in knowledge base."
            
            # Use Gemini to generate answer based on context
            from app.config import settings
            genai.configure(api_key=settings.GEMINI_API_KEY)
            
            # Use gemini-2.5-flash (latest available model)
            model = genai.GenerativeModel("gemini-2.5-flash")
            
            prompt = f"""Based on the following knowledge base information, answer the user's question:

Knowledge Base:
{context}

User Question: {query}

Provide a helpful and concise answer."""
            
            response = model.generate_content(prompt)
            
            logger.info(f"Generated answer for query: {query}")
            return response.text
            
        except Exception as e:
            logger.error(f"Failed to generate answer: {e}")
            return f"Error generating answer: {str(e)}"
    
    def find_jobs_for_worker(self, worker_query: str, job_query: str = None) -> str:
        """
        Find matching jobs for a worker by searching both namespaces
        
        Args:
            worker_query: Query to find the worker profile
            job_query: Query to find matching jobs (if None, uses worker_query)
        
        Returns:
            AI-generated answer with job matches
        """
        if not self.client:
            logger.warning("Moorcheh client not available")
            return "RAG service not available"
        
        try:
            import google.generativeai as genai
            
            # Use same query for jobs if not specified
            if job_query is None:
                job_query = worker_query
            
            # Search for worker profile
            worker_results = self.client.search(
                namespaces=["worker-profiles"],
                query=worker_query,
                top_k=3
            )
            
            # Search for matching jobs
            job_results = self.client.search(
                namespaces=["job-postings"],
                query=job_query,
                top_k=5
            )
            
            # Extract worker context
            worker_context = ""
            for match in worker_results.get("results", []):
                worker_context += f"Worker Profile:\n{match.get('text', '')}\n\n"
            
            # Extract job context
            job_context = ""
            for match in job_results.get("results", []):
                job_context += f"Job Opportunity:\n{match.get('text', '')}\n\n"
            
            if not worker_context:
                return "Worker profile not found in knowledge base."
            
            if not job_context:
                return "No matching jobs found in knowledge base. Please try different search terms."
            
            # Use Gemini to match worker to jobs
            from app.config import settings
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-2.5-flash")
            
            prompt = f"""You are a job matching expert. Based on the worker profile and available jobs, 
identify the best job matches and explain why they're suitable.

WORKER PROFILE:
{worker_context}

AVAILABLE JOBS:
{job_context}

Please:
1. Identify which jobs best match the worker's skills and experience
2. Explain the match score (0-100%)
3. Highlight why each job is a good fit
4. Mention any certification gaps
5. Provide salary/rate information if relevant

Format your response as a clear, easy-to-read recommendation."""
            
            response = model.generate_content(prompt)
            
            logger.info(f"Generated job matches for query: {worker_query}")
            return response.text
            
        except Exception as e:
            logger.error(f"Failed to find jobs for worker: {e}")
            return f"Error finding jobs: {str(e)}"


class MoorchehRecommendationService:
    """Service for job recommendations using Moorcheh semantic search"""
    
    def __init__(self):
        """Initialize Moorcheh client"""
        try:
            from moorcheh_sdk import MoorchehClient
            self.client = MoorchehClient(
                api_key=settings.MOORCHEH_API_KEY,
                base_url=settings.MOORCHEH_BASE_URL
            )
            logger.info("Moorcheh Recommendation Service initialized")
        except ImportError:
            logger.warning("moorcheh_sdk not installed")
            self.client = None
        except Exception as e:
            logger.error(f"Failed to initialize Moorcheh for recommendations: {e}")
            self.client = None
    
    def upload_job_to_index(self, job_id: str, job_data: Dict) -> bool:
        """
        Upload job posting to Moorcheh recommendation index
        
        Args:
            job_id: Unique job identifier
            job_data: Job posting data
        
        Returns:
            bool: Success status
        """
        if not self.client:
            logger.warning("Moorcheh client not available")
            return False
        
        try:
            # Ensure namespace exists first
            try:
                self.client.create_namespace("job-postings", type="text")
                logger.info("Created job-postings namespace")
            except Exception as ns_error:
                if "already exists" in str(ns_error).lower() or "409" in str(ns_error):
                    logger.debug("job-postings namespace already exists")
                else:
                    logger.debug(f"Namespace check: {ns_error}")
            
            job_text = f"""
Job Title: {job_data.get('title', 'N/A')}
Trade Required: {job_data.get('trade', 'N/A')}
Description: {job_data.get('description', 'N/A')}
Required Experience: {job_data.get('required_experience_years', 0)} years
Required Certifications: {', '.join(job_data.get('required_certifications', []))}
Location: {job_data.get('location', 'N/A')}
Hourly Rate: ${job_data.get('hourly_rate', 0)}
Job Type: {job_data.get('job_type', 'N/A')}
Company: {job_data.get('company') or job_data.get('company_name', 'N/A')}
Specialties: {', '.join(job_data.get('specialties', []))}
"""
            
            documents = [
                {
                    "id": f"job-{job_id}",
                    "text": job_text,
                    "job_id": job_id,
                    "trade": job_data.get('trade', 'unknown'),
                    "location": job_data.get('location', 'unknown'),
                    "hourly_rate": job_data.get('hourly_rate', 0),
                    "type": "job_posting"
                }
            ]
            
            # Use upload_documents (correct Moorcheh API)
            response = self.client.upload_documents(
                namespace_name="job-postings",
                documents=documents
            )
            
            logger.info(f"Job {job_id} uploaded to recommendation index: {response}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to upload job: {e}")
            return False
    
    def get_job_recommendations(self, worker_profile_text: str, num_recommendations: int = 5) -> List[Dict]:
        """
        Get job recommendations for a worker based on their profile
        
        Args:
            worker_profile_text: Worker's profile/preferences
            num_recommendations: Number of recommendations to return
        
        Returns:
            List of recommended jobs
        """
        if not self.client:
            logger.warning("Moorcheh client not available")
            return []
        
        try:
            results = self.client.search(
                namespaces=["job-postings"],
                query=worker_profile_text,
                top_k=num_recommendations
            )
            
            recommendations = []
            for match in results.get("results", []):
                recommendations.append({
                    "job_id": match.get("job_id") or match.get("metadata", {}).get("job_id"),
                    "relevance_score": match.get("score"),
                    "job_details": match.get("text"),
                    "metadata": match.get("metadata", {})
                })
            
            logger.info(f"Generated {len(recommendations)} job recommendations")
            return recommendations
            
        except Exception as e:
            logger.error(f"Failed to get recommendations: {e}")
            return []
