# Hospital Appointment Assistant (HAA)

AI-powered text chat system for automated patient triage and appointment scheduling with speech synthesis.

## Features

- 💬 Real-time text chat with AI triage
- 🤖 AI-powered symptom analysis using Groq Llama-3.3-70b
- 📅 Automated appointment scheduling
- 🗣️ Text-to-speech responses via ElevenLabs
- 📱 Modern React frontend with Material-UI
- 🗄️ SQLite database with SQLAlchemy ORM
- � FastAPI backend with automatic API documentation

## Tech Stack

- **Backend**: Python 3.8+, FastAPI, Uvicorn
- **Frontend**: React 18, Material-UI, Axios
- **AI Services**: Groq API (LLM), ElevenLabs (TTS)
- **Database**: SQLite with SQLAlchemy

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8 or higher** - [Download from python.org](https://python.org)
- **Node.js 16 or higher** - [Download from nodejs.org](https://nodejs.org)
- **Git** - [Download from git-scm.com](https://git-scm.com)

## Quick Start

### Option 1: Automated Setup (Recommended)

#### Windows
```bash
# Run the automated setup script
setup.bat
```

#### macOS/Linux
```bash
# Make setup script executable and run
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/subhash-varun/hospital-ai-agent.git
cd hospital-ai-agent
```

### 2. Backend Setup

#### Create Virtual Environment
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
# source venv/bin/activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Configure Environment Variables
```bash
# Copy the example environment file
cp .env.example .env
```

Edit the `.env` file and add your API keys:

```bash
# Groq API Configuration (Required)
GROQ_API_KEY=your_groq_api_key_here

# ElevenLabs TTS Configuration (Required for speech)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Database Configuration (Optional - defaults to SQLite)
DATABASE_URL=sqlite:///./hospital.db

# Application Configuration (Optional)
HOST=0.0.0.0
PORT=8000
DEBUG=True
```

**Getting API Keys:**
- **Groq API Key**: Sign up at [groq.com](https://groq.com) and get your API key
- **ElevenLabs API Key**: Sign up at [elevenlabs.io](https://elevenlabs.io) and get your API key

#### Run Backend Server
```bash
python run.py
```

The backend will start on `http://localhost:8000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../frontend
npm install
```

#### Start Development Server
```bash
npm start
```

### Testing Your Setup

After starting both servers, run the test script to verify everything is working:

#### Windows
```bash
test-setup.bat
```

#### macOS/Linux
```bash
chmod +x test-setup.sh
./test-setup.sh
```

The test script will check:
- Backend server connectivity
- API documentation accessibility
- Triage conversation endpoint functionality

1. **Open your browser** and go to `http://localhost:3000`
2. **Navigate to Text Chat** - Click on the text chat option
3. **Start a conversation** - Type your symptoms or questions
4. **Enable TTS** - Toggle the speech button to hear AI responses
5. **Book appointments** - The AI can help schedule appointments based on your symptoms

## API Endpoints

### Triage & Chat
- `POST /api/triage/conversation` - Send messages and get AI responses with optional TTS
- `POST /api/triage/analyze` - Analyze symptoms and get triage recommendations

### Appointments
- `POST /api/appointments` - Create new appointment
- `GET /api/appointments` - List all appointments
- `GET /api/appointments/{id}` - Get appointment details
- `PUT /api/appointments/{id}` - Update appointment
- `DELETE /api/appointments/{id}` - Cancel appointment

## Project Structure

```
hospital-appointment-booking-system/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── config.py            # Environment configuration
│   │   ├── database.py          # Database setup
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── appointment.py   # Database models
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── appointments.py  # Appointment CRUD endpoints
│   │   │   └── triage.py        # AI triage and chat endpoints
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── appointment_service.py
│   │   │   └── groq_service.py  # Groq AI and ElevenLabs TTS
│   │   └── utils/
│   ├── requirements.txt         # Python dependencies
│   ├── run.py                   # Server startup script
│   └── .env                     # Environment variables
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.css
│   │   ├── App.js               # Main React application
│   │   ├── index.css
│   │   ├── index.js
│   │   ├── components/
│   │   │   ├── AppointmentList.js
│   │   │   ├── Dashboard.js
│   │   │   └── TextChat.js      # Text chat with TTS component
│   │   └── services/
│   │       └── api.js           # API client functions
│   ├── package.json             # Node.js dependencies
│   └── README.md
├── .env.example                 # Environment template
├── .gitignore
└── README.md                    # This file
```

## Development

### Running Tests

#### Backend Tests
```bash
cd backend
python -m pytest
```

#### Frontend Tests
```bash
cd frontend
npm test
```

### API Documentation

When the backend is running, visit `http://localhost:8000/docs` for interactive API documentation powered by Swagger UI.

### Database

The application uses SQLite by default. To use PostgreSQL in production:

1. Install PostgreSQL
2. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL=postgresql://user:password@localhost/hospital_db
   ```
3. Run migrations:
   ```bash
   cd backend
   alembic upgrade head
   ```

## Troubleshooting

### Common Issues

**Backend won't start:**
- Check that all required environment variables are set
- Ensure you're in the virtual environment (`venv\Scripts\activate` on Windows)
- Verify API keys are valid

**Frontend won't load:**
- Make sure backend is running on port 8000
- Check that CORS settings allow localhost:3000

**TTS not working:**
- Verify your ElevenLabs API key is correct
- Check that you have credits in your ElevenLabs account
- Some voices may require a paid plan

**Database errors:**
- Delete `hospital.db` and restart to recreate the database
- Check file permissions if using custom database location

### Getting Help

- Check the [Issues](https://github.com/subhash-varun/hospital-ai-agent/issues) page
- Review the API documentation at `http://localhost:8000/docs`
- Check server logs for detailed error messages

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Future Enhancements

- [ ] Voice call integration
- [ ] Multi-language support
- [ ] Real-time appointment notifications
- [ ] Staff dashboard for appointment management
- [ ] Integration with hospital EHR systems
- [ ] Mobile app companion
