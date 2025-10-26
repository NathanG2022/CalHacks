@echo off
REM PromptBreaker + Letta Setup Script (Windows)
REM Automates the setup process for CalHacks demo

echo ========================================
echo PromptBreaker + Letta Setup
echo ========================================
echo.

REM Check Python version
echo Checking Python version...
python --version
echo.

REM Check if Docker is running
echo Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo WARNING: Docker is not running. Please start Docker first.
    echo Letta requires Docker for easy local deployment.
    pause
    exit /b 1
)
echo OK: Docker is running
echo.

REM Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt
echo.

REM Check if Letta server is running
echo Checking for Letta server...
curl -s http://localhost:8283/api/health >nul 2>&1
if errorlevel 1 (
    echo WARNING: Letta server not detected
    echo.
    echo To start Letta server:
    echo   1. Clone Letta: git clone https://github.com/letta-ai/letta
    echo   2. cd letta
    echo   3. docker compose up --build
    echo.
    echo Or install locally:
    echo   pip install letta
    echo   letta server
    echo.
    pause
)

REM Check Letta connection
echo.
echo Testing Letta connection...
curl -s http://localhost:8283/api/health >nul 2>&1
if errorlevel 1 (
    echo ERROR: Cannot connect to Letta server
    pause
    exit /b 1
)
echo OK: Successfully connected to Letta
echo.

REM Create data directories
echo Creating data directories...
if not exist "data\logs" mkdir "data\logs"
echo.

REM Setup knowledge base
echo Setting up demo knowledge base...
python target_letta\upload_docs.py setup
echo.

REM Create agents
echo Creating demo agents (vulnerable + hardened)...
python target_letta\create_agent.py setup
echo.

REM Verify setup
echo Verifying setup...
echo.
echo Sources:
python target_letta\upload_docs.py list
echo.
echo Agents:
python target_letta\create_agent.py list
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Run demo: python orchestrator.py demo
echo   2. Open Letta ADE in browser: http://localhost:8283
echo   3. Watch attack results in real-time
echo.
echo Quick commands:
echo   - Toggle poison: python target_letta\upload_docs.py poison-on
echo   - Remove poison: python target_letta\upload_docs.py poison-off
echo   - Run genetic attack: python orchestrator.py genetic
echo.
pause
