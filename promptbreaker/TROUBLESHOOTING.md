# PromptBreaker Troubleshooting Guide

## Common Issues and Fixes

### Issue 1: "404 Not Found" on /api/health

**Error message:**
```
letta-server  | INFO: 127.0.0.1:50452 - "GET /api/health HTTP/1.1" 404 Not Found
```

**Cause:** Letta's health check endpoint path has changed or doesn't exist.

**Solutions:**

#### **Quick Fix: Use Simple Docker Compose**
```bash
# Use the version without health checks
docker compose -f docker-compose.simple.yml up --build
```

#### **Fix 1: Update docker-compose.yml**
The main `docker-compose.yml` has been updated to try multiple endpoints:
```yaml
healthcheck:
  test: ["CMD-SHELL", "curl -f http://localhost:8283/ || curl -f http://localhost:8283/v1/health || exit 0"]
  start_period: 30s  # Give Letta time to start
```

Just restart:
```bash
docker compose down
docker compose up --build
```

#### **Fix 2: Find Letta's Actual Endpoint**
```bash
# Check what endpoints Letta provides
docker compose up -d letta
sleep 10

# Test different paths
curl http://localhost:8283/
curl http://localhost:8283/health
curl http://localhost:8283/v1/health
curl http://localhost:8283/api/v1/health
curl http://localhost:8283/docs  # Swagger UI

# Check logs
docker compose logs letta
```

Update `docker-compose.yml` line 18 with the correct path.

---

### Issue 2: "Cannot connect to Letta"

**Error in PromptBreaker:**
```
✗ Error uploading document: Connection refused
```

**Cause:** Letta server isn't ready yet.

**Solutions:**

#### **Fix 1: Increase Wait Time**
Edit `docker-compose.yml` line 45:
```yaml
sleep 5 &&  # Change to: sleep 30 &&
```

#### **Fix 2: Manual Verification**
```bash
# Start Letta first
docker compose up letta

# Wait until you see:
# "Application startup complete"

# In another terminal, test connection:
curl http://localhost:8283/

# Then start PromptBreaker
docker compose up promptbreaker
```

#### **Fix 3: Check Logs**
```bash
docker compose logs letta -f
```

Look for errors about missing API keys or port conflicts.

---

### Issue 3: "OpenAI API Error"

**Error:**
```
Error: Invalid API key provided
```

**Cause:** Missing or incorrect `OPENAI_API_KEY` in `.env` file.

**Solutions:**

#### **Fix 1: Create/Update .env**
```bash
# Create .env file
cp .env.example .env

# Edit it
nano .env  # or code .env

# Add your real key:
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

#### **Fix 2: Verify Environment Variable**
```bash
# Check if Docker Compose sees it
docker compose config | grep OPENAI

# Should show:
# OPENAI_API_KEY=sk-proj-...
```

#### **Fix 3: Pass Key Directly (Testing Only)**
```bash
OPENAI_API_KEY=sk-your-key docker compose up
```

---

### Issue 4: Port 8283 Already in Use

**Error:**
```
Error: bind: address already in use
```

**Cause:** Another service is using port 8283.

**Solutions:**

#### **Fix 1: Find and Stop the Conflict**
```bash
# Windows
netstat -ano | findstr :8283
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8283
kill <PID>
```

#### **Fix 2: Change the Port**
Edit `docker-compose.yml`:
```yaml
letta:
  ports:
    - "8284:8283"  # Use 8284 on host instead
```

Then update `LETTA_URL`:
```yaml
promptbreaker:
  environment:
    - LETTA_URL=http://letta:8283  # Keep this (internal)
```

Access Letta ADE at: http://localhost:8284

---

### Issue 5: Docker Build Fails

**Error:**
```
failed to solve: failed to read dockerfile
```

**Cause:** Not in the correct directory.

**Solutions:**

#### **Fix: Navigate to promptbreaker folder**
```bash
cd c:\Users\natha\Repos\Berkeley\hackathon\CalHacks\promptbreaker

# Verify you're in the right place
ls Dockerfile  # Should exist

# Then build
docker compose up --build
```

---

### Issue 6: "No module named 'requests'"

**Error in container:**
```
ModuleNotFoundError: No module named 'requests'
```

**Cause:** Dependencies not installed.

**Solutions:**

#### **Fix 1: Rebuild with --no-cache**
```bash
docker compose down
docker compose build --no-cache
docker compose up
```

#### **Fix 2: Install Manually (Debug)**
```bash
# Enter the container
docker compose run --rm promptbreaker /bin/bash

# Install deps
pip install -r requirements.txt

# Test
python target_letta/upload_docs.py --help
```

---

### Issue 7: Containers Keep Restarting

**Symptoms:** Containers start, then immediately exit.

**Diagnosis:**

```bash
# Check exit codes
docker compose ps

# Check logs
docker compose logs promptbreaker
docker compose logs letta
```

**Common Causes:**

1. **Missing API key** → See Issue 3
2. **Letta not ready** → See Issue 2
3. **Python error** → Check logs for traceback

**Fix:**
```bash
# Run with logs visible
docker compose up  # No -d flag

# Watch for specific error messages
```

---

### Issue 8: Letta ADE Not Accessible

**Symptoms:** http://localhost:8283 doesn't load

**Solutions:**

#### **Check if Letta is Running**
```bash
docker compose ps

# Should show:
# letta-server   Up   0.0.0.0:8283->8283/tcp
```

#### **Check Port Forwarding**
```bash
# Test from host
curl http://localhost:8283/

# If this fails, check docker-compose.yml ports section
```

#### **Check Firewall**
```bash
# Windows: Allow Docker in Windows Defender Firewall
# Or temporarily disable to test
```

---

## Quick Diagnostic Commands

```bash
# 1. Check all services
docker compose ps

# 2. View all logs
docker compose logs

# 3. View specific service logs
docker compose logs letta -f
docker compose logs promptbreaker -f

# 4. Check if Letta API is accessible
curl http://localhost:8283/
curl http://localhost:8283/docs

# 5. Enter PromptBreaker container
docker compose run --rm promptbreaker /bin/bash

# 6. Restart everything fresh
docker compose down -v
docker compose up --build

# 7. Check environment variables
docker compose config

# 8. Test Letta connection from PromptBreaker
docker compose run --rm promptbreaker python -c "
import requests
try:
    r = requests.get('http://letta:8283/')
    print(f'Success! Status: {r.status_code}')
except Exception as e:
    print(f'Error: {e}')
"
```

---

## Complete Clean Restart

If all else fails:

```bash
# 1. Stop everything
docker compose down -v

# 2. Remove images
docker rmi promptbreaker letta/letta:latest

# 3. Clean data
rm -rf data/logs/*
rm -f data/attacks.db

# 4. Rebuild from scratch
docker compose build --no-cache

# 5. Start with simple version
docker compose -f docker-compose.simple.yml up

# 6. If that works, try the full version
docker compose up
```

---

## Getting Help

If you're still stuck:

1. **Check Letta Documentation:**
   - https://docs.letta.com
   - https://github.com/letta-ai/letta

2. **Collect Debug Info:**
   ```bash
   # Save logs
   docker compose logs > debug_logs.txt

   # Check versions
   docker --version
   docker compose version
   python --version

   # Check config
   docker compose config > debug_config.yml
   ```

3. **Test Individual Components:**
   ```bash
   # Test Letta alone
   docker run -p 8283:8283 \
     -e OPENAI_API_KEY=your-key \
     letta/letta:latest

   # Test Python scripts
   cd promptbreaker
   pip install -r requirements.txt
   python attacker/composer.py
   ```

---

## Working Configuration (Known Good)

If you need a minimal working setup:

```yaml
# docker-compose.minimal.yml
version: '3.8'
services:
  letta:
    image: letta/letta:latest
    ports: ["8283:8283"]
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
```

Run:
```bash
docker compose -f docker-compose.minimal.yml up
```

Then test manually:
```bash
python target_letta/upload_docs.py setup
python target_letta/create_agent.py setup
python orchestrator.py demo
```

---

**Last Updated:** 2025-01-26
