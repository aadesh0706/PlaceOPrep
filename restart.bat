@echo off
echo Restarting PlaceOPrep Services...

REM Kill existing processes
taskkill /F /IM node.exe 2>nul
taskkill /F /IM python.exe 2>nul

timeout /t 2 /nobreak >nul

REM Start AI Engine
echo Starting AI Engine on port 8000...
start "AI Engine" cmd /k "cd ai-engine && python app.py"

timeout /t 3 /nobreak >nul

REM Start Backend
echo Starting Backend on port 4000...
start "Backend" cmd /k "cd backend && node server.js"

timeout /t 3 /nobreak >nul

REM Start Frontend
echo Starting Frontend on port 5173...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo All services started!
echo - AI Engine: http://localhost:8000
echo - Backend: http://localhost:4000  
echo - Frontend: http://localhost:5173
echo.
pause
