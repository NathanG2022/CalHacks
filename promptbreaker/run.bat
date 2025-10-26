@echo off
REM PromptBreaker Quick Commands (Windows)

if "%1"=="" goto help
if "%1"=="help" goto help
if "%1"=="build" goto build
if "%1"=="up" goto up
if "%1"=="down" goto down
if "%1"=="logs" goto logs
if "%1"=="shell" goto shell
if "%1"=="setup" goto setup
if "%1"=="demo" goto demo
if "%1"=="genetic" goto genetic
if "%1"=="test" goto test
if "%1"=="poison-on" goto poison-on
if "%1"=="poison-off" goto poison-off
if "%1"=="list-docs" goto list-docs
if "%1"=="list-agents" goto list-agents
if "%1"=="clean" goto clean
if "%1"=="health" goto health
goto help

:help
echo PromptBreaker - Available Commands:
echo.
echo   build         Build Docker images
echo   up            Start all services
echo   down          Stop all services
echo   logs          View logs
echo   shell         Open shell in container
echo   setup         Run initial setup
echo   demo          Run full 4-phase demo
echo   genetic       Run genetic attack
echo   test          Run test queries
echo   poison-on     Enable poisoned document
echo   poison-off    Disable poisoned document
echo   list-docs     List all documents
echo   list-agents   List all agents
echo   clean         Remove containers and volumes
echo   health        Check Letta health
echo.
echo Usage: run.bat [command]
goto end

:build
docker compose build
goto end

:up
docker compose up
goto end

:down
docker compose down
goto end

:logs
docker compose logs -f
goto end

:shell
docker compose run --rm promptbreaker /bin/bash
goto end

:setup
docker compose run --rm promptbreaker sh -c "python target_letta/upload_docs.py setup && python target_letta/create_agent.py setup"
goto end

:demo
docker compose run --rm promptbreaker python orchestrator.py demo
goto end

:genetic
docker compose run --rm promptbreaker python orchestrator.py genetic
goto end

:test
docker compose run --rm promptbreaker python target_letta/run_query.py test
goto end

:poison-on
docker compose run --rm promptbreaker python target_letta/upload_docs.py poison-on
goto end

:poison-off
docker compose run --rm promptbreaker python target_letta/upload_docs.py poison-off
goto end

:list-docs
docker compose run --rm promptbreaker python target_letta/upload_docs.py list
goto end

:list-agents
docker compose run --rm promptbreaker python target_letta/create_agent.py list
goto end

:clean
docker compose down -v
if exist "data\logs\*.json" del /Q "data\logs\*.json"
if exist "data\attacks.db" del /Q "data\attacks.db"
goto end

:health
echo Checking Letta health...
curl -f http://localhost:8283/api/health
if errorlevel 1 (
    echo ERROR: Letta is not responding
) else (
    echo OK: Letta is healthy
)
goto end

:end
