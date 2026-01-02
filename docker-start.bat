@echo off
REM CalHacks Docker Startup Script for Windows

echo.
echo 🚀 Starting CalHacks AI Safety Testing Webapp
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM Check if .env exists
if not exist .env (
    echo ❌ Error: .env file not found!
    echo.
    echo Please create a .env file with your configuration.
    echo You can copy .env.example as a starting point:
    echo.
    echo   copy .env.example .env
    echo.
    echo Then edit .env with your API keys and configuration.
    pause
    exit /b 1
)

echo ✅ Environment file found
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Docker is not running!
    echo.
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo ✅ Docker is running
echo.

REM Ask user what to start
echo What would you like to start?
echo.
echo 1. Full stack (All services including Letta)
echo 2. Web app only (Python + Server + Client)
echo 3. Just rebuild services (no start)
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo 🔨 Building and starting all services...
    docker-compose up --build
) else if "%choice%"=="2" (
    echo.
    echo 🔨 Building and starting web app services...
    docker-compose up --build python_service calhacks_server calhacks_client
) else if "%choice%"=="3" (
    echo.
    echo 🔨 Rebuilding services...
    docker-compose build
    echo.
    echo ✅ Build complete!
    echo.
    echo To start services, run:
    echo   docker-compose up
    pause
) else (
    echo.
    echo ❌ Invalid choice
    pause
    exit /b 1
)
