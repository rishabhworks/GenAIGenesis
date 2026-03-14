# 🚀 TradePass - Complete Setup Guide

## Quick Start

This guide will help you get the entire TradePass system running with both frontend and backend.

## Prerequisites

- Python 3.12 (required for backend)
- Node.js 16+ (for frontend)
- npm or yarn package manager
- Two terminal windows

## Step 1: Backend Setup (Terminal 1)

### 1. Navigate to Project Root
```bash
cd c:\Users\yatri\Desktop\GenAIGenesis
```

### 2. Activate Python Environment
```bash
.\venv\Scripts\Activate.ps1
```

### 3. Load Demo Data (First Time Only)
```bash
py -3.12 load_demo_database.py
py -3.12 load_jobs_database.py verify
```

### 4. Start Backend Server
```bash
python app/main.py
```

Or using uvicorn directly:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## Step 2: Frontend Setup (Terminal 2)

### 1. Navigate to Frontend Directory
```bash
cd c:\Users\yatri\Desktop\GenAIGenesis\frontend
```

### 2. Install Dependencies (First Time Only)
```bash
npm install
npm install react-markdown marked
```

### 3. Start Development Server
```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
```

## Step 3: Access the Application

Open your browser and navigate to:
- **Frontend**: `http://localhost:3000` or `http://localhost:5173`
- **Backend API**: `http://localhost:8000`
- **API Docs**: `http://localhost:8000/docs`

## Using the Application

### Tab 1: Chat with AI Assistant
- Select a worker profile (or enter custom ID)
- Ask questions about jobs, skills, career advice
- The AI automatically detects job-related queries and provides job matching

Example queries:
- "What electrician jobs match my skills in Mississauga?"
- "Show me plumber positions with good pay"
- "What HVAC jobs can I do with my certification?"

### Tab 2: Job Recommendations
- View personalized job recommendations for the selected worker
- See match percentages, salary, requirements
- Click "Apply Now" to take action

### Tab 3: Search Workers
- Search for workers by skills, trade, experience
- Bulk search across all worker profiles

## Demo Worker Profiles

Three pre-loaded profiles are available:

1. **Carlos Rodriguez** (worker-001)
   - Trade: Electrician
   - Experience: 5+ years
   - Skills: Residential & commercial wiring, rewiring
   - Certifications: Red Seal, OSHA

2. **Maria Chen** (worker-002)
   - Trade: Plumber
   - Experience: 6+ years
   - Skills: Commercial plumbing, gas fitting, water systems
   - Certifications: Red Seal, Gas certification

3. **David Thompson** (worker-003)
   - Trade: HVAC
   - Experience: 7+ years
   - Skills: Installation, maintenance, refrigeration
   - Certifications: EPA, OSHA

## Available Jobs (8 Total)

The job database includes realistic positions across three trades:

**Electrician Positions**: 4 jobs
- Residential Electrician ($47.50/hr)
- Senior Commercial Electrician ($52/hr)
- Solar Installation Specialist ($50/hr)
- Apprentice Electrician ($22/hr)

**Plumber Positions**: 2 jobs
- Master Plumber ($58/hr)
- Journeyman Plumber ($48/hr)

**HVAC Positions**: 2 jobs
- HVAC Technician ($46/hr)
- Senior HVAC Technician ($55/hr)

## Troubleshooting

### Frontend Can't Connect to Backend

**Error**: `Error: Network Error` or `Error: ERR_CONNECTION_REFUSED`

**Solution**:
1. Verify backend is running: `http://localhost:8000`
2. Check CORS_ORIGINS in `.env` includes frontend port
3. Try accessing backend directly: `http://localhost:8000/health`

### No Workers or Jobs Found
**Error**: "No relevant information found" when asking about jobs

**Solution**:
1. Reload demo data:
   ```bash
   py -3.12 load_demo_database.py
   py -3.12 load_jobs_database.py
   ```
2. Refresh browser: `Ctrl+R` or `Cmd+R`

### Backend Won't Start
**Error**: `Port 8000 already in use`

**Solution**:
1. Kill existing process: `npx kill-port 8000`
2. Or use different port: `python app/main.py --port 8001`

### Frontend Port Already in Use
**Error**: `Local: http://localhost:5173 already in use`

**Solution**:
1. Kill existing process: `npx kill-port 5173`
2. Or use different port in vite.config.js: `port: 3000`

## Production Deployment

For production deployment:

### Backend
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
npm run build
npm run preview
```

## API Documentation

While running the backend, access Swagger UI at:
```
http://localhost:8000/docs
```

Key endpoints:
- `POST /api/v1/chatbot/ask` - Chat with AI
- `GET /api/v1/chatbot/recommendations/{worker_id}` - Get recommendations
- `POST /api/v1/chatbot/search-workers` - Search workers
- `GET /health` - Health check

## Project Structure

```
GenAIGenesis/
├── app/                          # Backend (FastAPI)
│   ├── main.py                  # FastAPI app
│   ├── config.py                # Configuration
│   ├── services/
│   │   └── moorcheh_service.py # RAG & recommendations
│   └── routes/
│       └── chatbot_routes.py    # API endpoints
├── frontend/                     # Frontend (React)
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── services/            # API client
│   │   └── App.jsx              # Main app
│   ├── vite.config.js          # Vite config
│   └── package.json            # Dependencies
├── load_demo_database.py        # Load demo workers
└── load_jobs_database.py        # Load demo jobs
```

## Key Technologies

**Backend**:
- FastAPI - Modern Python web framework
- Google Gemini 2.5 Flash - AI/LLM for responses
- Moorcheh AI - Semantic search and RAG
- Pydantic - Data validation
- SQLAlchemy - Database ORM

**Frontend**:
- React 18 - UI framework
- Vite - Build tool and dev server
- Axios - HTTP client
- CSS3 - Styling with gradients

## Next Steps

After getting the system running:

1. **Test Job Matching**: Ask the chatbot about job opportunities
2. **View Recommendations**: Check Tab 2 for personalized recommendations
3. **Try Different Workers**: Switch profiles using the worker selector
4. **Explore API**: Check `/docs` for all available endpoints

## Need Help?

1. Check backend logs: Look at terminal where backend is running
2. Check frontend console: Press `F12` in browser, check Console tab
3. Check network calls: Browser DevTools > Network tab
4. Review API docs: http://localhost:8000/docs
5. Check backend health: `Invoke-RestMethod http://localhost:8000/health`

## Support

For technical issues or feature requests, refer to the README files in each directory:
- Backend: Check app/ directory
- Frontend: `frontend/README.md`

Happy job matching! 🎯
