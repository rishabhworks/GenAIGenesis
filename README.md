### 🦉 AI Career Agent for Skilled Trades
### *Your voice is your resume.*

---

![Built at GenAI Genesis](https://img.shields.io/badge/Built%20at-GenAI%20Genesis%202026-teal?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-FastAPI-blue?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)
![Moorcheh](https://img.shields.io/badge/AI-Moorcheh%20RAG-purple?style=for-the-badge)
![ElevenLabs](https://img.shields.io/badge/Voice-ElevenLabs%20STT-orange?style=for-the-badge)

</div>

---

## 🇨🇦 The Problem Nobody's Solving

> *300,000+ skilled trades jobs sit unfilled in Canada.*
> *The workers exist. The demand exists.*
> *The infrastructure connecting them is completely broken.*

Every AI hiring tool in existence was built for HR departments — for people with LinkedIn profiles, polished resumes, and keyword-optimized PDFs.

**Nobody built anything for Carlos.**

Carlos is a Red Seal electrician with 20 years of experience. He's never written a resume. He doesn't have LinkedIn. He finds work through word of mouth and job site conversations.

**WiseWorks was built for Carlos.**

---

## 🎙 Just Speak. We Handle The Rest.
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   "I'm an electrician. 8 years. Red Seal certified.     │
│    Residential work mostly. Based in Mississauga."      │
│                                                         │
│                    ▼ 8 seconds later                    │
│                                                         │
│   ✅ Profile created                                    |
│   ✅ 5 matching jobs found                              |
│   ✅ 2 jobs flagged as underpaying you                  |
│   ✅ Resume generated & ready to download               |
│                                                         |
└─────────────────────────────────────────────────────────┘
```

---

## ⚡ Features
```
🎙  VOICE ONBOARDING      →  Speak your experience. No typing. No forms.
💰  PAY FAIRNESS CHECK    →  Know if a job is lowballing you. Real market data.
🎯  AI JOB MATCHING       →  Moorcheh semantic search. Your skills → best jobs.
📋  CONTRACT EXPLAINER    →  Plain language. No lawyers needed.
💬  AI CHAT ASSISTANT     →  Ask anything. Get real answers.
📄  RESUME GENERATOR      →  Professional PDF. Downloaded in one click.
```

---

## 🛠 Tech Stack
```
┌──────────────┬─────────────────────────────────────────┐
│ Layer        │ Technology                              │
├──────────────┼─────────────────────────────────────────┤
│ Frontend     │ React + Vite + Custom CSS               │
│ Backend      │ FastAPI (Python)                        │
│ Database     │ SQLite + Moorcheh Vector Namespaces     │
│ AI / RAG     │ Moorcheh AI                             │
│ Voice STT    │ ElevenLabs (primary) + Gemini (backup)  │
│ Wage Data    │ Canadian Labour Market Data 2025-2026   │
└──────────────┴─────────────────────────────────────────┘
```

---

## 🏗 How It Works
```
Worker speaks into mic
        │
        ▼
ElevenLabs STT converts speech → text transcript
        │
        ▼
Structured profile saved → SQLite DB + Moorcheh worker-profiles
        │
        ▼
Moorcheh semantic search → matches against job-postings namespace
        │
        ▼
Moorcheh AI → generates recommendations, pay analysis, contract explanations
        │
        ▼
React dashboard → personalized profile + downloadable resume
```

---

## 🚀 Run Locally

### Backend
```bash
git clone https://github.com/rishabhworks/GenAIGenesis.git
cd GenAIGenesis
pip install -r requirements.txt

# Add your keys to .env
cp .env.example .env
# Fill in: MOORCHEH_API_KEY, ELEVENLABS_API_KEY, GEMINI_API_KEY

uvicorn app.main:app --reload --port 8000
```

### Load Demo Data
```bash
python load_jobs_database.py
python load_wage_data.py
python load_demo_database.py
```

### Frontend
```bash
cd frontend
npm install

# Create .env.local
echo "VITE_API_BASE_URL=http://localhost:8000/api/v1" > .env.local

npm run dev
```

> 🟢 Frontend runs on `http://localhost:3000`
> 
> 🟢 Backend runs on `http://localhost:8000`
> 
> 📖 API docs at `http://localhost:8000/docs`

---

## 🌐 API Endpoints
```
POST   /api/v1/workers/manual-profile          →  Create worker profile
POST   /api/v1/workers/transcribe              →  ElevenLabs STT
PUT    /api/v1/workers/{id}                    →  Update worker profile
POST   /api/v1/chatbot/ask                     →  AI chat assistant
GET    /api/v1/chatbot/recommendations/{id}    →  Job recommendations
POST   /api/v1/pay/direct-check                →  Pay fairness analysis
POST   /api/v1/contracts/explain               →  Contract explanation
```

---

## 🏆 Prize Tracks
```
🎨   Google: Best AI for Community Impact
🛠️  Moorcheh AI: Best AI Application that Leverages Efficient Memory 
```


## 💡 Why This Wins

> *Every other team in that building built for people like themselves —*
> *tech-savvy, English-fluent, resume-polished students.*
>
> *We built for the guy who installs your drywall.*
> *The woman who fixes your pipes.*
> *The person who keeps the lights on.*
>
> **AI should work for everyone. Not just people who already know how to use it.**

---

<div align="center">

*Built in 36 hours at GenAI Genesis 2026 🇨🇦*

*For the trades workers who keep Canada running. 🔧⚡🔩*

</div>
