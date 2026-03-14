#!/usr/bin/env python3
"""
Script to upload job postings to Moorcheh knowledge base
Run: python load_jobs_database.py
"""

import json
import logging
from app.config import settings
from app.services.moorcheh_service import MoorchehRecommendationService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

def load_jobs_data():
    """Load job postings into Moorcheh knowledge base"""
    
    # Initialize Moorcheh service
    job_service = MoorchehRecommendationService()
    
    if not job_service.client:
        logger.error("Moorcheh client not initialized. Check your API key!")
        return False
    
    # Read demo jobs file
    try:
        with open("demo_jobs.json", "r") as f:
            demo_data = json.load(f)
        logger.info(f"Loaded demo jobs file with {len(demo_data['jobs'])} jobs")
    except FileNotFoundError:
        logger.error("demo_jobs.json not found!")
        return False
    except json.JSONDecodeError:
        logger.error("Invalid JSON in demo_jobs.json")
        return False
    
    # Upload each job to Moorcheh
    success_count = 0
    for job in demo_data.get("jobs", []):
        job_id = job.get("job_id")
        
        # Upload to Moorcheh
        if job_service.upload_job_to_index(job_id, job):
            success_count += 1
            logger.info(f"✓ Uploaded job: {job.get('title')} ({job_id})")
        else:
            logger.error(f"✗ Failed to upload job: {job.get('title')} ({job_id})")
    
    logger.info(f"\n{'='*60}")
    logger.info(f"Successfully uploaded {success_count}/{len(demo_data['jobs'])} jobs")
    logger.info(f"{'='*60}\n")
    
    if success_count > 0:
        logger.info("Job postings loaded! Try these search queries:")
        logger.info("  - 'electrician jobs in Toronto'")
        logger.info("  - 'senior plumber with commercial experience'")
        logger.info("  - 'HVAC technician $50+ per hour'")
        logger.info("  - 'Red Seal certified jobs'\n")
        
        return True
    else:
        logger.error("No jobs were uploaded!")
        return False


def verify_jobs_database():
    """Verify that jobs knowledge base is populated"""
    
    job_service = MoorchehRecommendationService()
    
    if not job_service.client:
        logger.error("Moorcheh client not initialized!")
        return False
    
    logger.info("\nVerifying jobs knowledge base...")
    logger.info("="*60)
    
    # Test search queries
    test_queries = [
        "electrician jobs in Toronto",
        "plumber with experience",
        "HVAC technician",
        "Senior positions",
        "solar installation"
    ]
    
    for query in test_queries:
        try:
            results = job_service.get_job_recommendations(query, num_recommendations=2)
            logger.info(f"\nQuery: '{query}'")
            logger.info(f"Results: {len(results)} matching jobs")
            for result in results:
                score = result.get("relevance_score", 0)
                job_id = result.get("job_id", "N/A")
                logger.info(f"  - {job_id} (score: {score:.2f})")
        except Exception as e:
            logger.error(f"Error searching for '{query}': {e}")
    
    logger.info("\n" + "="*60)
    logger.info("Jobs knowledge base verification complete!")
    
    return True


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "verify":
        # Just verify existing data
        verify_jobs_database()
    else:
        # Load job data
        success = load_jobs_data()
        
        if success:
            logger.info("\nTo verify jobs database, run:")
            logger.info("  python load_jobs_database.py verify")
