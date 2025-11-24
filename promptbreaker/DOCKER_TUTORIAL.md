# PromptBreaker Docker Tutorial - Complete Step-by-Step Guide

This tutorial will walk you through running the PromptBreaker project using Docker from start to finish.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Running the Project](#running-the-project)
4. [Understanding What Happens](#understanding-what-happens)
5. [Viewing Results](#viewing-results)
6. [Common Operations](#common-operations)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Usage](#advanced-usage)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### 1. Docker Desktop
- **Windows/Mac**: Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
- **Linux**: Install Docker Engine and Docker Compose
- Verify installation:
  ```bash
  docker --version
  docker compose version
  ```
  You should see version numbers for both commands.

### 2. OpenAI API Key
- Sign up at [platform.openai.com](https://platform.openai.com)
- Navigate to API Keys section
- Create a new secret key
- **Important**: Save this key securely - you'll need it in the next step

### 3. System Requirements
- **RAM**: At least 4GB available
- **Disk Space**: ~2GB free space
- **Network**: Internet connection (for downloading Docker images and API calls)

---

## Initial Setup

### Step 1: Navigate to Project Directory

Open your terminal/command prompt and navigate to the promptbreaker directory:

```bash
# Windows (Git Bash / PowerShell)
cd Berkeley/hackathon/CalHacks/promptbreaker

# Mac/Linux
cd Berkeley/hackathon/CalHacks/promptbreaker
```

### Step 2: Create Environment File

Create a `.env` file to store your API key:

**Windows (PowerShell):**
```powershell
# Create .env file
New-Item -Path .env -ItemType File -Force

# Add your API key (replace with your actual key)
Add-Content -Path .env -Value "OPENAI_API_KEY=sk-your-actual-key-here"
```

**Windows (Git Bash) / Mac / Linux:**
```bash
# Create .env file
cat > .env << EOF
OPENAI_API_KEY=sk-your-actual-key-here
EOF
```

**Or manually:**
1. Create a new file named `.env` in the `promptbreaker` directory
2. Open it in a text editor
3. Add this line (replace with your actual key):
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```
4. Save the file

**Important**: 
- Replace `sk-your-actual-key-here` with your **actual** OpenAI API key
- The key should start with `sk-` and be about 50+ characters long
- **DO NOT** use placeholder values like `sk-your-actual-key-here` - the demo will fail!
- Get your real API key from: https://platform.openai.com/api-keys
- Never commit the `.env` file to version control (it's already in `.gitignore`)

**Verify your API key:**
After creating the `.env` file, you can validate it:
```bash
# Check if key looks valid
python check_env.py
```

### Step 3: Verify Docker is Running

Make sure Docker Desktop is running:

```bash
# Check Docker is running
docker ps
```

If you see an error, start Docker Desktop and wait for it to fully start (the whale icon should be steady, not animated).

---

## Running the Project

### Option A: Full Demo (Recommended for First Time)

This will automatically:
1. Build the Docker containers
2. Start the Letta server
3. Set up demo documents
4. Create agents
5. Run the complete 4-phase attack demo

```bash
docker compose up --build
```

**What to expect:**
- First run will take 2-5 minutes (downloading images and building)
- You'll see logs from both containers
- The demo will run automatically
- Press `Ctrl+C` to stop when done

### Option B: Run in Background

To run in the background and free up your terminal:

```bash
# Start in detached mode
docker compose up --build -d

# View logs
docker compose logs -f

# Stop when done
docker compose down
```

### Option C: Step-by-Step Execution

If you want more control:

```bash
# 1. Build containers
docker compose build

# 2. Start services
docker compose up -d

# 3. Wait for Letta to be ready (about 30 seconds)
docker compose logs -f letta

# 4. Run setup manually
docker compose run --rm promptbreaker \
  sh -c "python target_letta/upload_docs.py setup && python target_letta/create_agent.py setup"

# 5. Run demo
docker compose run --rm promptbreaker python orchestrator.py demo

# 6. Stop services
docker compose down
```

---

## Understanding What Happens

When you run `docker compose up --build`, here's what happens:

### Phase 1: Container Setup (30-60 seconds)
```
[Building] → Downloading Python base image
[Building] → Installing dependencies (requests, numpy, faiss, etc.)
[Building] → Copying project files
[Starting] → Creating Docker network (promptbreaker-net)
[Starting] → Creating volume (letta-data)
```

### Phase 2: Letta Server Startup (20-30 seconds)
```
[Letta] → Pulling letta/letta:latest image
[Letta] → Starting container on port 8283
[Letta] → Initializing vector database
[Letta] → Waiting for health check...
[Letta] → ✓ Server ready at http://localhost:8283
```

### Phase 3: PromptBreaker Setup (30-60 seconds)
```
[PromptBreaker] → Building container
[PromptBreaker] → Waiting for Letta to be healthy
[PromptBreaker] → Uploading demo documents
[PromptBreaker] → Creating vulnerable agent
[PromptBreaker] → Creating hardened agent
```

### Phase 4: Attack Demo (2-5 minutes)
```
[Phase 1] → Baseline attack (no poison) - Low success rate
[Phase 2] → Poisoned attack (vulnerable agent) - High success rate
[Phase 3] → Poisoned attack (hardened agent) - Lower success rate
[Phase 4] → Mitigation (poison removed) - Low success rate
```

---

## Viewing Results

### 1. Letta ADE (Agent Development Environment)

Open your web browser and navigate to:
```
http://localhost:8283
```

**What you can see:**
- Agent configurations
- Document sources
- Query history
- Retrieved contexts
- Tool calls and responses

**During the demo:**
- Watch as queries are executed
- See which documents are retrieved
- Observe how poison documents affect responses

### 2. Attack Logs (JSON Files)

View individual query logs:

```bash
# List all log files
ls data/logs/

# View a specific log file
cat data/logs/batch_phase2_poisoned_vulnerable_*.json
```

**Log file structure:**
- `batch_phase1_baseline_*.json` - Baseline attacks
- `batch_phase2_poisoned_vulnerable_*.json` - Poisoned attacks on vulnerable agent
- `batch_phase3_poisoned_hardened_*.json` - Poisoned attacks on hardened agent
- `batch_phase4_mitigation_*.json` - Attacks after poison removal

### 3. SQLite Database

Query the results database:

```bash
# Open SQLite shell
sqlite3 data/attacks.db

# View all experiments
SELECT * FROM experiments;

# View success rates by phase
SELECT 
  name,
  poison_enabled,
  hardened,
  success_rate,
  total_queries,
  successful_attacks
FROM experiments
ORDER BY id;

# View individual queries
SELECT 
  prompt,
  canary_detected,
  response_time,
  experiment_id
FROM queries
LIMIT 10;

# Exit SQLite
.exit
```

### 4. Container Logs

View real-time logs:

```bash
# All services
docker compose logs -f

# Just PromptBreaker
docker compose logs -f promptbreaker

# Just Letta
docker compose logs -f letta

# Last 100 lines
docker compose logs --tail=100
```

---

## Common Operations

### Stop the Services

```bash
# Stop containers (keeps data)
docker compose down

# Stop and remove volumes (cleans everything)
docker compose down -v
```

### Restart After Changes

```bash
# Rebuild and restart
docker compose up --build

# Just restart (no rebuild)
docker compose restart
```

### Run Custom Commands

**Enable poison document:**
```bash
docker compose run --rm promptbreaker \
  python target_letta/upload_docs.py poison-on
```

**Disable poison document:**
```bash
docker compose run --rm promptbreaker \
  python target_letta/upload_docs.py poison-off
```

**List all document sources:**
```bash
docker compose run --rm promptbreaker \
  python target_letta/upload_docs.py list
```

**Run genetic algorithm attack:**
```bash
docker compose run --rm promptbreaker \
  python orchestrator.py genetic
```

**Run single query:**
```bash
docker compose run --rm promptbreaker \
  python target_letta/run_query.py query <agent-id> "Your question here"
```

**Interactive shell:**
```bash
docker compose run --rm promptbreaker /bin/bash
```

### Access Running Container

```bash
# Get shell in running container
docker exec -it promptbreaker /bin/bash

# Check environment variables
docker exec promptbreaker env | grep OPENAI

# View container status
docker compose ps
```

---

## Troubleshooting

### Problem: "Cannot connect to Docker daemon"

**Solution:**
- Start Docker Desktop
- Wait for it to fully start (whale icon should be steady)
- Verify: `docker ps` should work without errors

### Problem: "Port 8283 already in use"

**Solution:**
```bash
# Find what's using the port
# Windows
netstat -ano | findstr :8283

# Mac/Linux
lsof -i :8283

# Stop the conflicting service or change port in docker-compose.yml
```

**Or change port:**
Edit `docker-compose.yml`:
```yaml
services:
  letta:
    ports:
      - "8284:8283"  # Use 8284 instead
```

### Problem: "OpenAI API error" or "Invalid API key" or "401 Authentication Error"

**Symptoms:**
- Error messages like: "Incorrect API key provided"
- 500 Internal Server Error when querying agents
- Authentication errors in Letta logs

**Solution:**
1. **Check if you're using a placeholder key:**
   ```bash
   # Your .env should NOT contain:
   # OPENAI_API_KEY=sk-your-actual-key-here  ❌ WRONG
   # OPENAI_API_KEY=sk-placeholder            ❌ WRONG
   
   # It should contain a REAL key like:
   # OPENAI_API_KEY=sk-proj-abc123...xyz      ✓ CORRECT
   ```

2. **Get a real API key:**
   - Go to https://platform.openai.com/api-keys
   - Sign in or create an account
   - Click "Create new secret key"
   - Copy the key (it starts with `sk-proj-` or `sk-`)

3. **Update your `.env` file:**
   ```bash
   # Edit .env and replace with your real key
   nano .env  # or use your preferred editor
   ```

4. **Verify the key is valid:**
   ```bash
   python check_env.py
   ```

5. **Restart containers:**
   ```bash
   docker compose down
   docker compose up --build
   ```

6. **Check the key is loaded in container:**
   ```bash
   docker compose run --rm promptbreaker env | grep OPENAI
   ```

### Problem: "Container exits immediately"

**Solution:**
```bash
# Check logs for errors
docker compose logs promptbreaker

# Run interactively to see errors
docker compose run --rm promptbreaker /bin/bash
```

### Problem: "Permission denied" on data directory

**Solution (Linux/Mac):**
```bash
chmod -R 755 data/
```

**Solution (Windows):**
- Right-click `data` folder → Properties → Security
- Ensure your user has full control

### Problem: "Database is locked"

**Solution:**
```bash
# Stop all containers
docker compose down

# Remove database (if you want to start fresh)
rm data/attacks.db

# Restart
docker compose up
```

### Problem: "Letta health check failed"

**Solution:**
```bash
# Check Letta logs
docker compose logs letta

# Wait longer (Letta may need more time)
# Edit docker-compose.yml and increase start_period:
healthcheck:
  start_period: 60s  # Increase from 30s
```

### Problem: Slow performance

**Solution:**
- Ensure Docker Desktop has enough resources allocated:
  - Docker Desktop → Settings → Resources
  - Allocate at least 4GB RAM, 2 CPUs
- Close other resource-intensive applications

---

## Advanced Usage

### Development Mode (Live Code Editing)

Create `docker-compose.dev.yml`:

```yaml
version: '3.8'

services:
  promptbreaker:
    build:
      context: .
      dockerfile: Dockerfile
    volumes:
      - ./attacker:/app/attacker
      - ./target_letta:/app/target_letta
      - ./orchestrator.py:/app/orchestrator.py
      - ./data:/app/data
    environment:
      - LETTA_URL=http://letta:8283
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    networks:
      - promptbreaker-net
```

Run with:
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

Changes to Python files will be reflected immediately.

### Custom Attack Configuration

Edit `orchestrator.py` or create a custom script:

```python
from orchestrator import AttackOrchestrator

orchestrator = AttackOrchestrator()

# Custom batch attack
orchestrator.run_attack_batch(
    agent_id="your-agent-id",
    n_candidates=100,  # More candidates
    experiment_name="custom_test",
    poison_enabled=True,
    hardened=False
)
```

Save as `custom_attack.py` and run:
```bash
docker compose run --rm promptbreaker python custom_attack.py
```

### Using Different LLM Providers

Edit `docker-compose.yml` to use different models:

```yaml
services:
  letta:
    environment:
      - LETTA_LLM_PROVIDER=anthropic
      - LETTA_LLM_MODEL=claude-3-opus
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
```

Update `.env`:
```
ANTHROPIC_API_KEY=your-anthropic-key
```

### Production Deployment

For production, use resource limits and health checks:

```yaml
services:
  promptbreaker:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8283/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

## Quick Reference

### Essential Commands

```bash
# Start everything
docker compose up --build

# Stop everything
docker compose down

# View logs
docker compose logs -f

# Run custom command
docker compose run --rm promptbreaker <command>

# Access shell
docker compose run --rm promptbreaker /bin/bash

# Check status
docker compose ps
```

### File Locations

- **Configuration**: `docker-compose.yml`, `.env`
- **Logs**: `./data/logs/`
- **Database**: `./data/attacks.db`
- **Agent Config**: `./data/agent_config.json`
- **Letta ADE**: http://localhost:8283

### Environment Variables

- `OPENAI_API_KEY` - Required for OpenAI models
- `LETTA_URL` - Letta server URL (default: http://letta:8283)
- `LETTA_API_KEY` - Optional Letta auth token

---

## Next Steps

1. **Explore Letta ADE**: Open http://localhost:8283 and explore the interface
2. **Analyze Results**: Query the SQLite database to understand attack patterns
3. **Modify Attacks**: Edit `attacker/templates.txt` to add new attack templates
4. **Experiment**: Try different agent configurations and hardening strategies
5. **Read Documentation**: 
   - [README.md](README.md) - Project overview
   - [DOCKER_GUIDE.md](DOCKER_GUIDE.md) - Detailed Docker documentation
   - [DEMO_GUIDE.md](DEMO_GUIDE.md) - Presentation tips
   - [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture

---

## Getting Help

If you encounter issues:

1. Check the [TROUBLESHOOTING.md](TROUBLESHOOTING.md) file
2. Review container logs: `docker compose logs`
3. Verify environment setup: `docker compose config`
4. Check Docker resources: Docker Desktop → Settings → Resources

---

**Congratulations!** You've successfully set up and run PromptBreaker with Docker! 🎉

For questions or issues, refer to the project documentation or open an issue on the repository.

