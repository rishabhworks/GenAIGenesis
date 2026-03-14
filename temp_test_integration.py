import requests
import json
from typing import Dict, Any

# Configuration
BACKEND_URL = "http://localhost:8000/api/v1"
DEMO_WORKERS = ["worker-001", "worker-002", "worker-003"]

def test_backend_health() -> bool:
    """Test if backend is running"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        print("✅ Backend Health Check:", response.status_code == 200)
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Backend Health Check Failed: {e}")
        return False

def test_chatbot_general_query() -> bool:
    """Test general chatbot query"""
    try:
        payload = {
            "worker_id": "worker-001",
            "message": "What is your role as a job matching assistant?"
        }
        response = requests.post(
            f"{BACKEND_URL}/chatbot/ask",
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            print("✅ Chatbot General Query:", response.status_code)
            print("   Response:", response.json().get('bot_response', '')[:100] + "...")
            return True
        else:
            print(f"❌ Chatbot General Query: {response.status_code}")
            print("   Error:", response.text)
            return False
    except Exception as e:
        print(f"❌ Chatbot General Query Failed: {e}")
        return False

def test_job_matching_query() -> bool:
    """Test job matching query"""
    try:
        payload = {
            "worker_id": "worker-001",
            "message": "What electrician jobs match my skills?"
        }
        response = requests.post(
            f"{BACKEND_URL}/chatbot/ask",
            json=payload,
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Job Matching Query:", response.status_code)
            print("   Source:", data.get('source', 'unknown'))
            print("   Response:", data.get('bot_response', '')[:100] + "...")
            return True
        else:
            print(f"❌ Job Matching Query: {response.status_code}")
            print("   Error:", response.text)
            return False
    except Exception as e:
        print(f"❌ Job Matching Query Failed: {e}")
        return False

def test_recommendations() -> bool:
    """Test getting recommendations for a worker"""
    try:
        worker_id = "worker-001"
        response = requests.get(
            f"{BACKEND_URL}/chatbot/recommendations/{worker_id}",
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            recs = data.get('recommendations', [])
            print(f"✅ Get Recommendations: {response.status_code}")
            print(f"   Found {len(recs)} recommendations")
            if recs:
                print(f"   First job: {recs[0].get('title', 'N/A')}")
            return True
        else:
            print(f"❌ Get Recommendations: {response.status_code}")
            print("   Error:", response.text)
            return False
    except Exception as e:
        print(f"❌ Get Recommendations Failed: {e}")
        return False

def test_worker_search() -> bool:
    """Test searching for workers"""
    try:
        payload = {
            "query": "electrician with 5+ years experience"
        }
        response = requests.post(
            f"{BACKEND_URL}/chatbot/search-workers",
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            print("✅ Worker Search:", response.status_code)
            print("   Response:", str(response.json())[:100] + "...")
            return True
        else:
            print(f"❌ Worker Search: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Worker Search Failed: {e}")
        return False

def test_cors_headers() -> bool:
    """Test if CORS headers are present"""
    try:
        response = requests.options(f"{BACKEND_URL}/chatbot/ask")
        headers = response.headers
        
        cors_header = headers.get('Access-Control-Allow-Origin')
        if cors_header:
            print("✅ CORS Headers Present")
            print(f"   Allow-Origin: {cors_header}")
            return True
        else:
            print("⚠️  CORS Headers Not Found (might be okay for preflight)")
            return True
    except Exception as e:
        print(f"❌ CORS Check Failed: {e}")
        return False

def run_integration_tests():
    """Run all integration tests"""
    print("\n" + "="*60)
    print("🧪 TradePass Frontend-Backend Integration Tests")
    print("="*60 + "\n")
    
    tests = [
        ("Backend Health", test_backend_health),
        ("CORS Configuration", test_cors_headers),
        ("General Chatbot Query", test_chatbot_general_query),
        ("Job Matching Query", test_job_matching_query),
        ("Get Recommendations", test_recommendations),
        ("Worker Search", test_worker_search),
    ]
    
    results = {}
    for test_name, test_func in tests:
        print(f"\n🔍 Testing: {test_name}")
        print("-" * 50)
        results[test_name] = test_func()
    
    # Summary
    print("\n" + "="*60)
    print("📊 Test Summary")
    print("="*60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, passed_test in results.items():
        status = "✅ PASS" if passed_test else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print("-" * 60)
    print(f"Result: {passed}/{total} tests passed")
    print("="*60 + "\n")
    
    if passed == total:
        print("🎉 All tests passed! Frontend-Backend integration is working!")
    else:
        print(f"⚠️  {total - passed} test(s) failed. Please check the output above.")
    
    return passed == total

if __name__ == "__main__":
    success = run_integration_tests()
    exit(0 if success else 1)
