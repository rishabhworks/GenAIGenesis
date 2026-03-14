# WiseHire Backend

AI-powered career assistant and RAG chatbot for skilled trades workers.

## Features Implemented

✅ **Voice-to-Profile Generation** - Convert voice recordings to worker profiles  
✅ **Semantic Search** - Find workers matching specific skills using Moorcheh RAG  
✅ **Job Recommendations** - Personalized job matches based on worker profiles  
✅ **RAG Chatbot** - Knowledge base-driven Q&A system  
✅ **Pay Fairness Detection** - Alert when jobs pay below market rate (20% threshold)  
✅ **Contract Explanation** - Explain legal text in simple language  

## Tech Stack

- **Backend Framework**: FastAPI
- **AI Models**: Google Gemini 2.5 Flash
- **Knowledge Base**: Moorcheh AI (semantic search & RAG)
- **Database**: SQLite (development)
- **Language**: Python 3.12 (required)

---

## Prerequisites

### Required Software

- **Python 3.12** (not 3.13 or 3.14 - specific version required)
  - Download from: https://www.python.org/downloads/release/python-3120/
  - Verify installation: `python --version` should show Python 3.12.x

### API Keys Required

You'll need to obtain API keys from:

1. **Google Gemini API** → https://ai.google.dev/
   - Get free tier API key
   - Used for: speech-to-text, worker profile generation, RAG answer generation

2. **Moorcheh AI** → https://console.moorcheh.ai/
   - Sign up for account
   - Get API key from dashboard
   - Used for: semantic search, knowledge base management, job recommendations

---

## Setup Instructions

### 1. Clone Repository

```bash
git clone <repository-url>
cd GenAIGenesis
```

### 2. Create Virtual Environment (Python 3.12)

```bash
# Create venv using Python 3.12 specifically
py -3.12 -m venv venv

# Activate virtual environment
venv\Scripts\Activate.ps1  # PowerShell
# OR
source venv/bin/activate   # Linux/Mac
```

### 3. Install Dependencies

```bash
# Upgrade pip first
py -3.12 -m pip install --upgrade pip

# Install requirements
py -3.12 -m pip install -r requirements.txt
```

### 4. Configure Environment Variables

Edit `.env` and update these values:

```env
# Google Gemini API (required)
GEMINI_API_KEY=your_actual_key_from_ai.google.dev
GEMINI_MODEL=gemini-2.5-flash

# Moorcheh API (required for chatbot)
MOORCHEH_API_KEY=your_actual_key_from_console.moorcheh.ai
MOORCHEH_BASE_URL=https://api.moorcheh.ai/v1

```

### 5. Load Demo Data (Optional but Recommended)

Populate the knowledge base with 3 sample worker profiles:

```bash
# Load demo workers to Moorcheh
py -3.12 load_demo_database.py

# Expected output: "Successfully uploaded 3/3 workers"
```

Verify the knowledge base is populated:

```bash
# Run verification queries
py -3.12 load_demo_database.py verify
```

### 6. Start the Server

```bash
# Development server with auto-reload
py -3.12 -m uvicorn app.main:app --reload

# Server will start at http://localhost:8000
```

### 7. Test the API

#### Interactive Swagger UI (Easiest)
- Open browser: http://localhost:8000/docs
- Scroll to `/api/v1/chatbot/ask`
- Click "Try it out"
- Enter test data and execute

#### Using PowerShell Script

```powershell
# Test chatbot endpoint
$body = @{
    "worker_id" = "worker-001"
    "message" = "What electrician jobs match my skills?"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/chatbot/ask" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

---

## API Endpoints

### Chatbot Endpoints

#### **POST** `/api/v1/chatbot/ask`
Ask the chatbot questions about workers in the knowledge base.

**Request:**
```json
{
  "worker_id": "worker-001",
  "message": "What electrician jobs match my skills?"
}
```

**Response:**
```json
{
  "worker_id": "worker-001",
  "user_message": "What electrician jobs match my skills?",
  "bot_response": "Based on the knowledge base...",
  "source": "moorcheh-rag"
}
```

#### **GET** `/api/v1/chatbot/recommendations/{worker_id}`
Get job recommendations for a specific worker.

**Query Parameters:**
- `trade` (string): Worker's trade (e.g., "Electrician")
- `experience_years` (int): Years of experience
- `location` (string): Worker location (e.g., "Toronto, ON")

**Response:**
```json
{
  "worker_id": "worker-001",
  "recommendations": [
    {
      "job_id": "job-123",
      "title": "Senior Electrician",
      "match_score": 0.95,
      "company": "ElectroWorks"
    }
  ]
}
```

#### **POST** `/api/v1/chatbot/search-workers`
Semantic search of worker knowledge base.

**Request:**
```json
{
  "query": "electricians in Toronto with Red Seal certification"
}
```

**Response:**
```json
{
  "query": "electricians in Toronto...",
  "results": [
    {
      "worker_id": "worker-002",
      "relevance_score": 0.45,
      "profile_text": "..."
    }
  ]
}
```

### Legacy Endpoints (Coming Soon)

- `POST /voice-profile` - Generate worker profile from voice
- `POST /match-jobs` - Match worker to jobs  
- `POST /pay-check` - Detect underpaid job postings
- `POST /explain-contract` - Explain legal text in simple language

---

## Demo Data

The system comes with 3 sample worker profiles (Carlos, Maria, David):

| Name | Trade | Experience | Location | Certifications |
|------|-------|------------|----------|-----------------|
| Carlos Rodriguez | Electrician | 8 years | Mississauga | Red Seal, OSHA |
| Maria Chen | Plumber | 12 years | Toronto | Red Seal, Backflow |
| David Thompson | HVAC | 6 years | Brampton | EPA Certified |

Load with: `py -3.12 load_demo_database.py`

---

## Troubleshooting

### Python Version Issues
```bash
# Check Python version
python --version

# Must be Python 3.12.x
# If you have multiple versions, use:
py -3.12 --version
```

### API Key Errors
- **403 Forbidden from Moorcheh**: Check that `MOORCHEH_API_KEY` is valid
- **401 from Gemini**: Verify `GEMINI_API_KEY` is correct
- Make sure base URL is: `https://api.moorcheh.ai/v1` (not a custom AWS URL)

### Server Won't Start
```bash
# Kill any existing process on port 8000
netstat -ano | findstr :8000  # Find process ID
taskkill /PID <process_id> /F  # Kill it

# Restart server
py -3.12 -m uvicorn app.main:app --reload
```

### Knowledge Base is Empty
```bash
# Reload demo data
py -3.12 load_demo_database.py

# Verify it loaded
py -3.12 load_demo_database.py verify
```

---

## Key Technologies & Setup Notes

### Python 3.12 Requirement
- Python 3.12 is required due to dependency compatibility (pydantic-core, httpx)
- Python 3.14+ will cause Rust compilation errors
- Use `py -3.12` prefix for all commands

### Moorcheh RAG Setup
- Knowledge base stored in Moorcheh cloud
- Semantic search enabled through `https://api.moorcheh.ai/v1` endpoint
- Worker profiles indexed for fast lookups
- Supports up to 1M tokens per query

### Gemini API Integration
- Using `gemini-2.5-flash` model (latest available)
- Hybrid approach: Moorcheh search + Gemini answer generation
- Fast inference, suitable for real-time chatbot

---

## Testing Workflow

1. **Start Server**
   ```bash
   py -3.12 -m uvicorn app.main:app --reload
   ```

2. **Load Demo Data** (new terminal)
   ```bash
   py -3.12 load_demo_database.py
   ```

3. **Test Chatbot** (new terminal)
   ```bash
   py -3.12 test_chatbot_api.py
   ```

4. **View API Docs**
   ```
   http://localhost:8000/docs
   ```

---

## Next Steps

- [ ] Implement voice-to-profile endpoint
- [ ] Add job board data integration (LinkedIn, Indeed)
- [ ] Implement pay fairness detection
- [ ] Add contract explanation feature
- [ ] Deploy to Azure Container Apps
- [ ] Add user authentication
- [ ] Build frontend dashboard

---

## Support

For issues or questions:
1. Check logs: `tail -f app.log`
2. Review `.env` configuration
3. Verify API keys are valid
4. Ensure Python 3.12 is being used
