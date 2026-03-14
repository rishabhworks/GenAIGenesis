#!/usr/bin/env python3
"""
Script to upload demo worker profiles to Moorcheh knowledge base
Run: python load_demo_database.py
"""

import json
import logging
from app.config import settings
from app.services.moorcheh_service import MoorchehRAGService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

def load_demo_data():
    """Load demo worker and job data into Moorcheh knowledge base"""
    
    # Initialize Moorcheh service
    rag_service = MoorchehRAGService()
    
    if not rag_service.client:
        logger.error("Moorcheh client not initialized. Check your API key!")
        return False
    
    # Read demo data file
    try:
        with open("demo_data.json", "r") as f:
            demo_data = json.load(f)
        logger.info(f"Loaded demo data file with {len(demo_data['workers'])} workers")
    except FileNotFoundError:
        logger.error("demo_data.json not found!")
        return False
    except json.JSONDecodeError:
        logger.error("Invalid JSON in demo_data.json")
        return False
    
    # Upload each worker profile to Moorcheh
    success_count = 0
    for worker in demo_data.get("workers", []):
        worker_id = worker.get("worker_id")
        profile = worker.get("profile", {})
        
        # Flatten the profile data for upload
        worker_data = {
            "name": profile.get("name"),
            "email": profile.get("email"),
            "phone": profile.get("phone"),
            "trade": profile.get("trade"),
            "experience_years": profile.get("years_experience"),
            "certifications": profile.get("certifications", []),
            "location": profile.get("location"),
            "availability": profile.get("availability"),
            "hourly_rate_expectation": profile.get("hourly_rate_expectation"),
            "specialties": profile.get("specialties", [])
        }
        
        # Upload to Moorcheh
        if rag_service.upload_user_profile_to_knowledge_base(worker_id, worker_data):
            success_count += 1
            logger.info(f"✓ Uploaded worker: {profile.get('name')} ({worker_id})")
        else:
            logger.error(f"✗ Failed to upload worker: {profile.get('name')} ({worker_id})")
    
    logger.info(f"\n{'='*60}")
    logger.info(f"Successfully uploaded {success_count}/{len(demo_data['workers'])} workers")
    logger.info(f"{'='*60}\n")
    
    if success_count > 0:
        logger.info("Knowledge base populated! Try these test queries:")
        logger.info("  - 'electricians in Mississauga'")
        logger.info("  - 'Red Seal plumber in Toronto'")
        logger.info("  - 'HVAC technician with 6 years experience'")
        logger.info("  - 'Carlos Rodriguez electrician'")
        logger.info("  - 'workers specialized in solar installation'\n")
        
        # Test a search
        logger.info("Running test search...")
        results = rag_service.query_worker_knowledge_base("electricians", top_k=2)
        logger.info(f"Found {len(results)} results for 'electricians'")
        for result in results:
            logger.info(f"  - {result['worker_id']}: {result['metadata'].get('worker_id')}")
        
        return True
    else:
        logger.error("No workers were uploaded!")
        return False


def verify_knowledge_base():
    """Verify that knowledge base contains the demo data"""
    
    rag_service = MoorchehRAGService()
    
    if not rag_service.client:
        logger.error("Moorcheh client not initialized!")
        return False
    
    logger.info("\nVerifying knowledge base contents...")
    logger.info("="*60)
    
    # Test search queries
    test_queries = [
        "electricians",
        "plumbers in Toronto",
        "HVAC technicians",
        "Red Seal certified",
        "Carlos Rodriguez"
    ]
    
    for query in test_queries:
        try:
            results = rag_service.query_worker_knowledge_base(query, top_k=3)
            logger.info(f"\nQuery: '{query}'")
            logger.info(f"Results: {len(results)} matching profiles")
            for result in results:
                score = result.get("relevance_score", 0)
                worker_id = result.get("worker_id", "N/A")
                logger.info(f"  - {worker_id} (score: {score:.2f})")
        except Exception as e:
            logger.error(f"Error searching for '{query}': {e}")
    
    logger.info("\n" + "="*60)
    logger.info("Knowledge base verification complete!")
    
    return True


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "verify":
        # Just verify existing data
        verify_knowledge_base()
    else:
        # Load demo data
        success = load_demo_data()
        
        if success:
            logger.info("\nTo verify knowledge base, run:")
            logger.info("  python load_demo_database.py verify")
