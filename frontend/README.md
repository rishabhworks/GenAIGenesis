# WiseWorks Frontend

Modern React frontend for WiseWorks - AI-powered job matching platform for skilled trades.

## Features

- 💬 **AI Chatbot** - Ask questions about job opportunities, skills, and career advice
- 🎯 **Job Recommendations** - Get personalized job recommendations based on your profile
- 🔍 **Worker Search** - Search for workers by skills, trade, and experience
- 🔄 **Real-time Integration** - Seamlessly integrated with WiseWorks backend API

## Prerequisites

- Node.js 16+ (or compatible)
- npm or yarn package manager
- WiseWorks backend running on `http://localhost:8000`

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (or copy from `.env.example`):
```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Development

Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

The dev server includes a proxy that automatically forwards API calls to the backend at `http://localhost:8000`.

## Building for Production

Build the optimized production bundle:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ChatBot.jsx          # Chatbot interface
│   │   ├── ChatBot.css
│   │   ├── Recommendations.jsx  # Job recommendations display
│   │   ├── Recommendations.css
│   │   ├── WorkerSearch.jsx    # Worker search interface
│   │   └── WorkerSearch.css
│   ├── services/
│   │   └── apiService.js        # API client for backend communication
│   ├── App.jsx                  # Main app component
│   ├── App.css                  # App-level styles
│   └── main.jsx                 # React entry point
├── index.html                   # HTML template
├── vite.config.js              # Vite configuration
├── package.json                # Dependencies
└── .env                        # Environment variables
```

## API Endpoints Used

- `POST /api/v1/chatbot/ask` - Send message to chatbot (auto-routes between general Q&A and job matching)
- `GET /api/v1/chatbot/recommendations/{worker_id}` - Get job recommendations for a worker
- `POST /api/v1/chatbot/search-workers` - Search for workers by query

## Usage

### Chat with AI Assistant
- Click the **Chat** tab
- Select a worker profile or enter a custom worker ID
- Ask about jobs, skills, recommendations, etc.
- The chatbot automatically detects job-related queries and routes them to job matching

### View Job Recommendations
- Click the **Recommendations** tab
- View personalized job matches with details:
  - Match percentage
  - Salary range
  - Required experience
  - Certifications
  - Apply button for each job

### Search for Workers
- Click the **Search Workers** tab
- Search by skills, trade, experience, location
- View detailed worker profiles and qualifications

## Demo Workers

The system comes with three pre-loaded demo workers:
- **worker-001** - Carlos Rodriguez (Electrician)
- **worker-002** - Maria Chen (Plumber)
- **worker-003** - David Thompson (HVAC Technician)

Switch between workers using the **👤** button in the header.

## Technologies

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **CSS3** - Styling with gradients and animations

## Error Handling

The frontend includes comprehensive error handling:
- User-friendly error messages
- Failed API calls display detailed error information
- Network error recovery suggestions
- Loading states for async operations

## Styling

The application uses a purple gradient theme:
- Primary gradient: `#667eea` to `#764ba2`
- Responsive design with mobile support
- Smooth animations and transitions
- Accessible color contrasts

## Contributing

Feel free to extend the frontend with:
- Additional worker profile fields
- More detailed job filtering options
- History of past recommendations
- Worker profile page
- Job application tracking

## Support

For issues or questions about the frontend, check the backend API documentation and ensure:
1. Backend is running on `http://localhost:8000`
2. Demo data is loaded (`py -3.12 load_demo_database.py` and `py -3.12 load_jobs_database.py`)
3. Frontend environment variables are correctly set

## License

Same as WiseWorks backend project.
