# Docker Quick Start - 2 Minutes to Demo

The fastest way to run PromptBreaker.

## Prerequisites
- Docker Desktop installed and running
- OpenAI API key

## Step 1: Setup (30 seconds)

```bash
cd promptbreaker
cp .env.example .env
```

Edit `.env` and add your key:
```
OPENAI_API_KEY=sk-your-actual-key-here
```

## Step 2: Run (90 seconds)

```bash
docker compose up --build
```

Watch the demo run automatically!

## What's Happening

```
[0s]   Building containers...
[10s]  Starting Letta server...
[20s]  Uploading demo documents...
[30s]  Creating agents (vulnerable + hardened)...
[40s]  Running Phase 1: Baseline (no poison)...
[60s]  Running Phase 2: Poisoned attack...
[80s]  Running Phase 3: Hardened defense...
[100s] Running Phase 4: Mitigation...
[110s] ✓ Demo complete!
```

## View Results

**Letta ADE (Web Interface):**
```
http://localhost:8283
```

**Logs (JSON):**
```
./data/logs/
```

**Database (SQLite):**
```
./data/attacks.db
```

## Quick Commands

```bash
# Windows
run.bat demo          # Run demo
run.bat poison-on     # Enable poison
run.bat poison-off    # Disable poison
run.bat logs          # View logs
run.bat shell         # Interactive shell

# Mac/Linux
make demo             # Run demo
make poison-on        # Enable poison
make poison-off       # Disable poison
make logs             # View logs
make shell            # Interactive shell
```

## Stop Everything

```bash
docker compose down
```

## Troubleshooting

**"Cannot connect to Docker daemon"**
→ Start Docker Desktop

**"Port 8283 already in use"**
→ Stop other services: `docker ps` then `docker stop <container>`

**"OpenAI API error"**
→ Check your `.env` file has the correct key

## Next Steps

- Read [DOCKER_GUIDE.md](DOCKER_GUIDE.md) for detailed docs
- Read [DEMO_GUIDE.md](DEMO_GUIDE.md) for presentation tips
- Open Letta ADE at http://localhost:8283 and explore!

---

**That's it! You're running a RAG poisoning attack demo.** 🚀
