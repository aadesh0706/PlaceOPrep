@echo off
echo ===============================================
echo    PlaceOPrep - Complete Startup Script
echo ===============================================
echo.

REM Check if MongoDB is running
echo [1/4] Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo MongoDB is running
) else (
    echo MongoDB is not running. Please start MongoDB first.
    echo Run: mongod
    pause
    exit /b 1
)

echo.
echo [2/4] Starting Backend Server...
start "PlaceOPrep Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo [3/4] Starting Frontend Server...
start "PlaceOPrep Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo [4/4] Starting AI Engine (Python)...
start "PlaceOPrep AI Engine" cmd /k "cd ai-engine && python app.py"
timeout /t 2 /nobreak >nul

echo.
echo ===============================================
echo    All Services Started Successfully!
echo ===============================================
echo.
echo Backend:  http://localhost:4000
echo Frontend: http://localhost:5173
echo AI Engine: http://localhost:5000
echo.
echo Press any key to stop all services...
pause >nul

echo.
echo Stopping all services...
taskkill /FI "WINDOWTITLE eq PlaceOPrep Backend*" /F
taskkill /FI "WINDOWTITLE eq PlaceOPrep Frontend*" /F
taskkill /FI "WINDOWTITLE eq PlaceOPrep AI Engine*" /F
echo All services stopped.
pause
