# AI Interviewer Backend Setup

## Overview
This is the Flask backend for the AI Interviewer feature integrated into SkillSpectrum.

## Prerequisites
- Python 3.8+
- pip

## Installation

1. Navigate to the backend directory:
```bash
cd ai-interviewer-backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
```

3. Activate the virtual environment:
- Windows:
```bash
venv\Scripts\activate
```
- Linux/Mac:
```bash
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Configure environment variables:
- Copy `.env.example` to `.env`
- Add your API keys (OpenAI, Deepgram, Tavus, etc.)

## Running the Backend

Start the Flask server:
```bash
python app.py
```

The server will run on `http://localhost:5000`

## API Endpoints

- `POST /generate-questions` - Generate interview questions
- `POST /speak-question` - Text-to-speech for questions
- `POST /transcribe-answer` - Speech-to-text for answers
- `POST /generate-report` - Generate performance report
- `POST /api/tavus/start` - Start video interview (if using Tavus)

## Integration with SkillSpectrum

The AI Interviewer is accessible from the sidebar in SkillSpectrum. Click the "AiInterviewer" button to start.

## Notes

- Make sure the Flask backend is running before using the AI Interviewer feature
- The backend runs on port 5000 by default
- Ensure your API keys are properly configured in the `.env` file
