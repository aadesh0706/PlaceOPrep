@echo off
echo Starting AI Interviewer Backend...
cd ai-interviewer-backend
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
    python app.py
) else (
    echo Virtual environment not found. Please run setup first.
    echo Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    python app.py
)
