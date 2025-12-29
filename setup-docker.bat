@echo off
REM CalHacks Docker Setup Script for Windows
REM This script sets up the complete CalHacks application with Docker and Letta

echo 🚀 Setting up CalHacks with Docker and Letta...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    docker compose version >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
        pause
        exit /b 1
    )
)

echo [SUCCESS] Docker and Docker Compose are installed

REM Create environment file if it doesn't exist
if not exist .env (
    echo [INFO] Creating .env file...
    (
        echo # CalHacks Environment Configuration
        echo.
        echo # OpenAI API Key ^(required for Letta and PromptBreaker^)
        echo OPENAI_API_KEY=sk-your-openai-api-key-here
        echo.
        echo # Optional: Other LLM providers
        echo # GROQ_API_KEY=your-groq-key
        echo # ANTHROPIC_API_KEY=your-anthropic-key
        echo # GEMINI_API_KEY=your-gemini-key
        echo.
        echo # Supabase Configuration ^(for CalHacks web app^)
        echo VITE_SUPABASE_URL=https://your-project-id.supabase.co
        echo VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
        echo.
        echo # Optional: Local LLM Configuration
        echo # OLLAMA_BASE_URL=http://localhost:11434
        echo # VLLM_API_BASE=http://localhost:8000
        echo.
        echo # Optional: Azure OpenAI
        echo # AZURE_API_KEY=your-azure-key
        echo # AZURE_BASE_URL=https://your-resource.openai.azure.com/
        echo # AZURE_API_VERSION=2024-02-15-preview
    ) > .env
    echo [WARNING] Please edit .env file and add your API keys before running the application
)

REM Create promptbreaker environment file
if not exist promptbreaker\.env (
    echo [INFO] Creating promptbreaker\.env file...
    (
        echo # PromptBreaker Environment Configuration
        echo OPENAI_API_KEY=sk-your-openai-api-key-here
        echo LETTA_URL=http://letta_server:8283
        echo LETTA_API_KEY=your-letta-api-key-here
        echo DATABASE_URL=sqlite:///data/attacks.db
        echo LOG_LEVEL=INFO
        echo LOG_DIR=./data/logs
        echo DEFAULT_POPULATION_SIZE=20
        echo DEFAULT_GENERATIONS=5
        echo DEFAULT_CANDIDATES=50
    ) > promptbreaker\.env
)

REM Create letta environment file
if not exist letta\.env (
    echo [INFO] Creating letta\.env file...
    (
        echo # Letta Server Environment Configuration
        echo LETTA_PG_USER=letta
        echo LETTA_PG_PASSWORD=letta
        echo LETTA_PG_DB=letta
        echo LETTA_PG_PORT=5432
        echo LETTA_DB_HOST=letta_db
        echo LETTA_PG_URI=postgresql://letta:letta@letta_db:5432/letta
        echo LETTA_SERVER_PORT=8283
        echo LETTA_DEBUG=True
        echo OPENAI_API_KEY=sk-your-openai-api-key-here
    ) > letta\.env
)

REM Create necessary directories
echo [INFO] Creating necessary directories...
if not exist promptbreaker\data\logs mkdir promptbreaker\data\logs
if not exist letta\.persist\pgdata mkdir letta\.persist\pgdata

REM Build and start services
echo [INFO] Building and starting Docker services...
docker-compose up --build -d

REM Wait for services to be ready
echo [INFO] Waiting for services to start...
timeout /t 30 /nobreak >nul

REM Check service health
echo [INFO] Checking service health...

REM Check Letta server
curl -f http://localhost:8283/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Letta server is running at http://localhost:8283
) else (
    echo [WARNING] Letta server may still be starting up...
)

REM Check CalHacks client
curl -f http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] CalHacks client is running at http://localhost:5173
) else (
    echo [WARNING] CalHacks client may still be starting up...
)

REM Check CalHacks server
curl -f http://localhost:3001/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] CalHacks server is running at http://localhost:3001
) else (
    echo [WARNING] CalHacks server may still be starting up...
)

echo.
echo [SUCCESS] Setup complete! 🎉
echo.
echo 📋 Access your applications:
echo   • CalHacks Web App: http://localhost:5173
echo   • CalHacks API: http://localhost:3001
echo   • Letta Server: http://localhost:8283
echo   • Letta ADE: http://localhost:8283 ^(Agent Development Environment^)
echo.
echo 🔧 Useful commands:
echo   • View logs: docker-compose logs -f
echo   • Stop services: docker-compose down
echo   • Restart services: docker-compose restart
echo   • Update services: docker-compose up --build -d
echo.
echo ⚠️  Don't forget to:
echo   1. Edit .env files with your actual API keys
echo   2. Configure Supabase for the web application
echo   3. Check the PromptBreaker demo results in .\promptbreaker\data\
echo.
pause















