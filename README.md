# Hospital Appointment Assistant (HAA)

AI-powered voice call system for automated patient triage and appointment scheduling.

## Features

- 🎙️ Real-time voice call handling via LiveKit
- 🤖 AI-powered symptom triage using Groq Llama-3.3-70b
- 📅 Automated appointment scheduling
- 🗣️ Natural speech interaction (STT/TTS via Groq)
- 🌍 Multi-language support
- 📊 Hospital dashboard for managing appointments

## Tech Stack

- **Backend**: Python, FastAPI
- **Frontend**: React, LiveKit UI Components
- **STT**: Groq Whisper-Large-v3
- **LLM**: Groq Llama-3.3-70b
- **TTS**: Groq TTS
- **Real-Time Voice**: LiveKit
- **Database**: SQLite (upgradeable to PostgreSQL)

## Setup

### Backend Setup

1. Create a virtual environment:
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables (see `.env` file)

4. Run the server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start development server:
```bash
npm start
```

## Project Structure

```
hospital-appointment-booking-system/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── config.py            # Configuration
│   │   ├── models/              # Database models
│   │   ├── routers/             # API routes
│   │   ├── services/            # Business logic
│   │   └── utils/               # Utilities
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── services/            # API services
│   │   └── App.js
│   └── package.json
└── .env
```

## Usage

1. Start the backend server
2. Start the frontend application
3. Patients can call the system via LiveKit
4. AI handles triage and schedules appointments
5. Staff can view appointments in the dashboard

## API Endpoints

- `POST /api/appointments` - Create new appointment
- `GET /api/appointments` - List all appointments
- `GET /api/appointments/{id}` - Get appointment details
- `PUT /api/appointments/{id}` - Update appointment
- `DELETE /api/appointments/{id}` - Cancel appointment
- `POST /api/livekit/token` - Generate LiveKit access token

## License

MIT
