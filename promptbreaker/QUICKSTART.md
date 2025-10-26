# PromptBreaker Quick Start

Get the CalHacks demo running in 5 minutes.

## Prerequisites

- **Docker Desktop** running
- **Python 3.10+** installed
- **Git** installed

## 3-Step Setup

### Step 1: Start Letta Server (2 min)

```bash
# In a new terminal
git clone https://github.com/letta-ai/letta
cd letta
docker compose up --build
```

Wait for: `Server running on http://localhost:8283`

### Step 2: Install & Setup (2 min)

```bash
# In your promptbreaker directory
cd CalHacks/promptbreaker

# Windows
setup.bat

# Mac/Linux
chmod +x setup.sh
./setup.sh
```

This will:
- Install Python dependencies
- Upload demo documents to Letta
- Create vulnerable & hardened agents
- Verify everything works

### Step 3: Run Demo (1 min)

```bash
python orchestrator.py demo
```

Opens browser automatically and runs 4-phase attack demo.

## What You'll See

1. **Phase 1 (Baseline)**: ~0% success rate without poisoned doc
2. **Phase 2 (Poisoned)**: ~60% success rate with poison
3. **Phase 3 (Hardened)**: ~20% success rate (defense works partially)
4. **Phase 4 (Mitigation)**: ~0% success rate (poison removed)

## Quick Commands

```bash
# Manual control
python target_letta/upload_docs.py poison-on    # Enable attack
python target_letta/upload_docs.py poison-off   # Disable attack

# Single test query
python target_letta/run_query.py test

# Genetic evolution attack
python orchestrator.py genetic
```

## Open Letta ADE

http://localhost:8283

- Click on an agent
- View "Sources" to see documents
- Watch queries in real-time
- Inspect which docs were retrieved

## Troubleshooting

**"Can't connect to Letta"**
→ Make sure Docker is running and Letta server started

**"No agents found"**
→ Run `python target_letta/create_agent.py setup`

**"Import errors"**
→ Run `pip install -r requirements.txt`

## Next Steps

- Read [DEMO_GUIDE.md](DEMO_GUIDE.md) for presentation tips
- Read [README.md](README.md) for detailed docs
- Read [ARCHITECTURE.md](ARCHITECTURE.md) for technical details

---

**That's it!** You're ready to demo RAG poisoning attacks. 🚀
