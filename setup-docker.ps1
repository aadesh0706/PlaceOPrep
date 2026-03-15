# ========================================
# LiveKit Docker Setup for SkillSpectrum
# ========================================
# This script sets up LiveKit and Redis using Docker Compose

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LiveKit Docker Setup for SkillSpectrum" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Check if Docker Compose is installed
try {
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose found: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not installed" -ForegroundColor Red
    Write-Host "Please ensure Docker Desktop is properly installed with Compose support" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Check if docker-compose.yml exists
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "❌ docker-compose.yml not found in current directory" -ForegroundColor Red
    Write-Host "Please run this script from the SkillSpectrum root directory" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ docker-compose.yml found!" -ForegroundColor Green
Write-Host ""

# Start services using Docker Compose
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting LiveKit and Redis services..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Services started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Waiting for services to be healthy..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    Write-Host ""
    
    # Show status
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Service Status" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    docker-compose ps
    Write-Host ""
    
    Write-Host "✅ Setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Next Steps" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Update your backend .env file with:" -ForegroundColor Yellow
    Write-Host "   LIVEKIT_URL=ws://localhost:7880" -ForegroundColor White
    Write-Host "   LIVEKIT_API_KEY=devkey" -ForegroundColor White
    Write-Host "   LIVEKIT_API_SECRET=secret" -ForegroundColor White
    Write-Host "   REDIS_HOST=localhost" -ForegroundColor White
    Write-Host "   REDIS_PORT=6379" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Start your backend:" -ForegroundColor Yellow
    Write-Host "   cd ai-interviewer-backend" -ForegroundColor White
    Write-Host "   python app.py" -ForegroundColor White
    Write-Host ""
    Write-Host "3. In another terminal, start your frontend:" -ForegroundColor Yellow
    Write-Host "   cd frontend" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Access the application at: http://localhost:5173" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Useful Docker Compose commands:" -ForegroundColor Yellow
    Write-Host "  Stop services:        docker-compose down" -ForegroundColor White
    Write-Host "  View logs:            docker-compose logs -f" -ForegroundColor White
    Write-Host "  Stop and remove data: docker-compose down -v" -ForegroundColor White
    Write-Host "  Restart services:     docker-compose restart" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "❌ Failed to start services" -ForegroundColor Red
    Write-Host "Please check Docker installation and try again" -ForegroundColor Yellow
    docker-compose logs
    Read-Host "Press Enter to exit"
    exit 1
}

Read-Host "Press Enter to exit"
