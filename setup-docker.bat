@echo off
REM ========================================
REM LiveKit Docker Setup for SkillSpectrum
REM ========================================
REM This script sets up LiveKit and Redis using Docker Compose

echo.
echo ========================================
echo LiveKit Docker Setup for SkillSpectrum
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo ✅ Docker found!
echo.

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed
    echo Please ensure Docker Desktop is properly installed with Compose support
    pause
    exit /b 1
)

echo ✅ Docker Compose found!
echo.

REM Check if docker-compose.yml exists
if not exist "docker-compose.yml" (
    echo ❌ docker-compose.yml not found in current directory
    echo Please run this script from the SkillSpectrum root directory
    pause
    exit /b 1
)

echo ✅ docker-compose.yml found!
echo.

REM Start services using Docker Compose
echo ========================================
echo Starting LiveKit and Redis services...
echo ========================================
echo.

docker-compose up -d

if %errorlevel% equ 0 (
    echo ✅ Services started successfully!
    echo.
    echo Waiting for services to be healthy...
    timeout /t 3 /nobreak
    echo.
    
    REM Show status
    echo ========================================
    echo Service Status
    echo ========================================
    echo.
    docker-compose ps
    echo.
    
    echo ✅ Setup complete!
    echo.
    echo ========================================
    echo Next Steps
    echo ========================================
    echo.
    echo 1. Update your backend .env file with:
    echo    LIVEKIT_URL=ws://localhost:7880
    echo    LIVEKIT_API_KEY=devkey
    echo    LIVEKIT_API_SECRET=secret
    echo    REDIS_HOST=localhost
    echo    REDIS_PORT=6379
    echo.
    echo 2. Start your backend:
    echo    cd ai-interviewer-backend
    echo    python app.py
    echo.
    echo 3. In another terminal, start your frontend:
    echo    cd frontend
    echo    npm run dev
    echo.
    echo 4. Access the application at: http://localhost:5173
    echo.
    echo To stop services, run:
    echo    docker-compose down
    echo.
    echo To view logs, run:
    echo    docker-compose logs -f
    echo.
    echo To stop and remove volumes:
    echo    docker-compose down -v
    echo.
) else (
    echo ❌ Failed to start services
    echo Please check Docker installation and try again
    docker-compose logs
    pause
    exit /b 1
)

pause
