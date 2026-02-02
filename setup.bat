@echo off
echo ===============================================
echo    PlaceOPrep - Initial Setup
echo ===============================================
echo.

echo [1/5] Installing Backend Dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo [2/5] Installing Frontend Dependencies...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo [3/5] Installing Python Dependencies...
cd ai-engine
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install Python dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo [4/5] Setting up Environment Files...
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env"
    echo Backend .env created
)
if not exist "frontend\.env" (
    copy "frontend\.env.example" "frontend\.env"
    echo Frontend .env created
)

echo.
echo [5/5] Seeding Database...
echo Make sure MongoDB is running before proceeding!
pause
cd backend
call node seed.js
cd ..

echo.
echo ===============================================
echo    Setup Complete!
echo ===============================================
echo.
echo Next steps:
echo 1. Ensure MongoDB is running (run 'mongod' in a terminal)
echo 2. Run 'start.bat' to start all services
echo 3. Open http://localhost:5173 in your browser
echo.
pause
