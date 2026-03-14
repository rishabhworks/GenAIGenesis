# TradePass Backend - Complete Implementation Guide

## 📋 Project Overview

TradePass is an **AI-powered career assistant** for skilled trades workers in Canada. The backend provides:

1. **Voice-to-Profile**: Convert voice descriptions → structured worker profiles
2. **Job Matching**: Find relevant job opportunities per worker skills from profiles
3. **Pay Fairness Detection**: Alert if jobs pay below market rates
4. **Contract Explanation**: Translate legal language into simple terms

---

## 🔧 WHAT YOU NEED TO DO

### Step 1: Get Google Gemini API Key (Required)

You **MUST** get this ONE API key to run the backend. It handles everything:
- Voice/audio transcription
- Worker profile extraction from text
- Contract explanation
- AI job matching

**What it does**: Powers all AI operations with Google's state-of-the-art Gemini model

**How to get it** (5 minutes):
1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with your Google account (create if needed)
3. Click "Create API key" button
4. Copy the API key (looks like: `AIzaSyD...`)
5. Paste it into `.env` as `GEMINI_API_KEY`

**Input required in `.env`**:
```
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-1.5-pro  # or gemini-1.5-flash for faster/cheaper
```

**Why Gemini instead of Watson?**
✅ One single API key (vs multiple services)  
✅ Simpler setup (no project IDs, regions, etc.)  
✅ Better pricing for this use case  
✅ Powerful multimodal capabilities  
✅ Direct audio support  
✅ Free tier available with generous limits  

---

### Step 2: Setup Local Environment

```bash
# 1. Clone/navigate to project
cd tradepass-backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create .env file
cp .env.example .env

# 5. Edit .env file - ADD YOUR API KEY HERE
# Use your editor to add:
# - GEMINI_API_KEY
```

---

### Step 3: Run the Backend

```bash
# Make sure virtual environment is activated
source venv/bin/activate  # or: venv\Scripts\activate on Windows

# Run the server
uvicorn app.main:app --reload

# Server will start at: http://localhost:8000
# API docs at: http://localhost:8000/docs
```

---

## 📝 Complete Input Requirements

### Mandatory API Key (One single API key for EVERYTHING!)

| Key | Where to get | Why needed |
|-----|-------------|-----------|
| `GEMINI_API_KEY` | https://makersuite.google.com/app/apikey | Speech-to-text, profile extraction, contract explanation, job matching |

### Optional API Keys (For enhanced features)

| Key | Where to get | Purpose |
|-----|-------------|---------|
| `LINKEDIN_API_KEY` | LinkedIn Developer Program | Job board integration |
| `INDEED_API_KEY` | Indeed.com API | Job board integration |
| `STATS_CANADA_API_KEY` | Statistics Canada | Real market wage data |

### Environment Variables (Configuration)

```
# Required
DEBUG=False  # Set to True during development
LOG_LEVEL=INFO

# Database
DATABASE_URL=sqlite:///./tradepass.db

# Google Gemini API (Single key for all AI)
GEMINI_API_KEY=[FROM GOOGLE MAKERSUITE]
GEMINI_MODEL=gemini-1.5-pro  # or gemini-1.5-flash

# Optional
WAGE_THRESHOLD_PERCENTAGE=20  # Alert if job pays 20% below market
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
```

---

## 🚀 How the API Works

### Example Flow 1: Create Worker Profile from Voice

```
1. User records voice (10-30 seconds)
2. Send to: POST /api/v1/workers/voice-profile
   ↓
3. Gemini API converts audio → text via file upload
   ↓
4. Gemini API extracts structured data:
   - Trade (electrician, plumber, etc.)
   - Years of experience
   - Certifications
   - Location
   ↓
5. Worker profile saved to database
6. Return worker ID for next steps
```

### Example Flow 2: Match Worker to Jobs

```
1. Worker ID + job database
2. Send to: POST /api/v1/jobs/match-jobs
   ↓
3. Algorithm checks:
   - Trade match (40 points)
   - Experience (30 points)
   - Certifications (20 points)
   - Other skills (10 points)
   ↓
4. Return top 10 jobs sorted by match score
```

### Example Flow 3: Check Pay Fairness

```
1. Job ID + wage data
2. Send to: POST /api/v1/pay/check
   ↓
3. System checks market rate for trade
4. Compares job hourly_rate vs market_rate
5. If difference > 20%: Alert user
   ↓
6. Return fairness status + recommendation
```

### Example Flow 4: Explain Contract

```
1. Contract clause text
2. Send to: POST /api/v1/contracts/explain
   ↓
3. Gemini API simplifies legal text
4. Extract key points + risks
   ↓
5. Return simple explanation + recommendations
```

---

## 🗄️ Database Schema

### Workers Table
```
workers
├── id (UUID) - Unique worker ID
├── trade - Type of skilled trade
├── experience_years - Years of work experience
├── certifications - JSON array of certifications
├── specialties - JSON array of specialties
├── location - City, Province
├── latitude/longitude - Geo coordinates
├── voice_transcript - Original voice-to-text
├── profile_summary - AI-generated summary
├── availability - Full-time/Part-time/Contract
├── hourly_rate_expectation - Expected wage
├── created_at/updated_at - Timestamps
└── is_active - Soft delete flag
```

### Jobs Table
```
jobs
├── id (UUID) - Unique job ID
├── title - Job title
├── trade - Required trade
├── description - Job description
├── required_experience_years - Min experience
├── required_certifications - JSON array
├── location - City, Province
├── hourly_rate - Offered wage
├── salary_annual - Annual salary
├── market_rate - Market average wage
├── pay_fairness_status - fair/underpaid/competitive
├── job_type - Full-time/Part-time/Contract
├── company_name - Employer name
├── job_board_source - Where job came from
├── external_url - Link to job
├── created_at/updated_at - Timestamps
└── is_active - Soft delete flag
```

---

## 💾 Database Options

### SQLite (Development - Default)
```
DATABASE_URL=sqlite:///./tradepass.db
Pros: Easy setup, no server needed
Cons: Single user, not for production
```

### PostgreSQL (Production - Recommended)
```
DATABASE_URL=postgresql://username:password@localhost:5432/tradepass
Pros: Scalable, open-source, reliable
Setup: Install PostgreSQL, create database, update DATABASE_URL
```

### IBM Db2 (Production - Optional)
```
DATABASE_URL=db2+ibm_db_sa://username:password@hostname:50000/dbname
Pros: Enterprise support, advanced features
Setup: Create Db2 instance, get connection details, install ibm_db_sa driver
```

---

## 🔄 API Endpoints Reference

### Workers
- `POST /api/v1/workers/voice-profile` - Create from voice (audio file)
- `POST /api/v1/workers/manual-profile` - Create manually
- `GET /api/v1/workers/{worker_id}` - Get profile
- `PUT /api/v1/workers/{worker_id}` - Update profile
- `DELETE /api/v1/workers/{worker_id}` - Delete profile

### Jobs
- `POST /api/v1/jobs/` - Create job posting
- `GET /api/v1/jobs/` - List jobs (with filters)
- `POST /api/v1/jobs/match-jobs` - Match worker to jobs
- `PUT /api/v1/jobs/{job_id}` - Update job
- `DELETE /api/v1/jobs/{job_id}` - Delete job

### Pay Fairness
- `POST /api/v1/pay/check` - Check job fairness
- `GET /api/v1/pay/market-rate/{trade}` - Get market wage
- `GET /api/v1/pay/analysis` - Batch analysis

### Contracts
- `POST /api/v1/contracts/explain` - Explain clause
- `POST /api/v1/contracts/extract-clauses` - Extract sections
- `POST /api/v1/contracts/identify-risks` - Flag risks

### Health
- `GET /api/v1/health` - Health check
- `GET /` - Documentation links

---

## 🧪 Quick Test Without Real APIs

For testing without API keys:

```bash
# 1. Create test worker (no voice needed)
curl -X POST "http://localhost:8000/api/v1/workers/manual-profile" \
  -H "Content-Type: application/json" \
  -d '{
    "trade": "Electrician",
    "experience_years": 5,
    "certifications": ["Red Seal", "Journeyman"],
    "specialties": ["Residential", "Commercial"],
    "location": "Toronto, ON",
    "availability": "Full-time",
    "voice_transcript": "I am an electrician with 5 years experience"
  }'

# 2. Create test job
curl -X POST "http://localhost:8000/api/v1/jobs/" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Commercial Electrician",
    "trade": "Electrician",
    "description": "Seeking experienced electrician for commercial projects",
    "required_experience_years": 3,
    "location": "Toronto, ON",
    "hourly_rate": 32.00,
    "job_type": "Full-time",
    "company_name": "ElectroWorks Inc",
    "job_board_source": "Indeed",
    "external_url": "https://indeed.com/job/123"
  }'

# 3. Get market rate
curl -X GET "http://localhost:8000/api/v1/pay/market-rate/Electrician"

# 4. Check health
curl -X GET "http://localhost:8000/api/v1/health"
```

---

## 🚨 Common Issues & Solutions

### Issue: `GEMINI_API_KEY not found`
**Solution**: Make sure .env file is created and you've added the API key from https://makersuite.google.com/app/apikey

### Issue: `Failed to initialize Gemini API`
**Solution**: Verify your API key is correct by testing it at https://makersuite.google.com/app/apikey

### Issue: `Audio transcription failed`
**Solution**: Make sure your audio file is in a supported format (MP3, WAV, FLAC, OPUS, WEBM, M4A)

### Issue: `Database lock error`
**Solution**: If using SQLite in production, switch to Db2

### Issue: `CORS error when testing with frontend`
**Solution**: Update CORS_ORIGINS in .env to include frontend URL

---

## 🎯 Next Steps

1. **Get Gemini API key** - https://makersuite.google.com/app/apikey (required)
2. **Clone this repository** - `git clone ...`
3. **Setup .env** - Copy .env.example → .env, add Gemini key
4. **Install dependencies** - `pip install -r requirements.txt`
5. **Run server** - `uvicorn app.main:app --reload`
6. **Test endpoints** - Visit http://localhost:8000/docs

---

## 📞 Support

- **GitHub Issues**: Report bugs or suggest features
- **Documentation**: See README_COMPLETE.md for full details
- **API Docs**: http://localhost:8000/docs (when running)

---

## 🔐 Security Reminders

✅ DO:
- Keep .env file in .gitignore (never commit to GitHub)
- Rotate API keys periodically
- Use environment variables for secrets
- Enable HTTPS in production

❌ DON'T:
- Hardcode API keys in code
- Commit .env file to GitHub
- Share API keys in pull requests
- Use API keys in logs

---

**Ready to build? Get your API keys and start!** 🚀
