# PromptBreaker Project Summary

Complete RAG poisoning attack demonstration for CalHacks 2025.

## What You Have

A **production-ready, containerized RAG security research tool** demonstrating:
- ✅ RAG poisoning attacks against Letta
- ✅ Genetic algorithm-based prompt optimization
- ✅ Hardening/mitigation strategies
- ✅ Complete Docker deployment
- ✅ Provenance tracking + logging
- ✅ Interactive demo with visual ADE

## Project Files (20 total)

### Core Implementation (8 files)
1. **orchestrator.py** - Main attack coordinator (230 lines)
2. **attacker/composer.py** - Prompt generation + GA (270 lines)
3. **attacker/templates.txt** - 30+ injection templates
4. **target_letta/upload_docs.py** - Doc management (220 lines)
5. **target_letta/create_agent.py** - Agent creation (180 lines)
6. **target_letta/run_query.py** - Query execution (220 lines)
7. **attacker/__init__.py** - Module exports
8. **target_letta/__init__.py** - Module exports

### Docker & Deployment (4 files)
9. **Dockerfile** - Container definition
10. **docker-compose.yml** - Multi-service orchestration
11. **.dockerignore** - Build exclusions
12. **.env.example** - Environment template

### Automation & Utilities (5 files)
13. **Makefile** - Command shortcuts (Linux/Mac)
14. **run.bat** - Command shortcuts (Windows)
15. **setup.sh** - Automated setup (Linux/Mac)
16. **setup.bat** - Automated setup (Windows)
17. **requirements.txt** - Python dependencies

### Documentation (5 files)
18. **README.md** - Main documentation
19. **QUICKSTART.md** - 5-minute guide
20. **DOCKER_GUIDE.md** - Docker reference (350+ lines)
21. **DOCKER_QUICKSTART.md** - 2-minute Docker guide
22. **DEMO_GUIDE.md** - Presentation playbook
23. **ARCHITECTURE.md** - Technical deep-dive (400+ lines)
24. **.gitignore** - Git exclusions

**Total: ~2,500 lines of code + 2,000 lines of documentation**

## Quick Start Commands

### Fastest (Docker - 2 minutes)
```bash
cd promptbreaker
cp .env.example .env
# Add your OpenAI key to .env
docker compose up --build
```

### Windows Shortcuts
```bash
run.bat demo          # Run demo
run.bat poison-on     # Enable poison
run.bat shell         # Open shell
run.bat logs          # View logs
```

### Linux/Mac Shortcuts
```bash
make demo             # Run demo
make poison-on        # Enable poison
make shell            # Open shell
make logs             # View logs
```

## Architecture

```
Attacker (PromptBreaker)     Target (Letta RAG)
┌──────────────────────┐     ┌─────────────────┐
│ Templates (30+)      │     │ Agent + LLM     │
│ Mutations (5 types)  │────>│ Retriever       │
│ Genetic Algorithm    │HTTP │ Vector DB       │
│ FAISS (optional)     │     │ Poison Doc ⚠    │
└──────────────────────┘     └─────────────────┘
         │                            │
         └────── SQLite + JSON ───────┘
              (Provenance Logs)
```

## Demo Flow (Automated in `docker compose up`)

1. **Setup** (30s) - Upload docs, create agents
2. **Phase 1** (20s) - Baseline (no poison) → 0% success
3. **Phase 2** (20s) - Poisoned attack → 60% success
4. **Phase 3** (20s) - Hardened defense → 20% success
5. **Phase 4** (20s) - Mitigation → 0% success

**Total demo runtime: ~110 seconds**

## Key Features

### Attack Techniques
- Direct instruction injection
- Authority impersonation
- Context switching
- Delimiter confusion
- Social engineering
- Genetic evolution (crossover + mutation)
- Crescendo multi-turn attacks

### Defense Strategies
- Prompt hardening (system-level filtering)
- Source document quarantine
- Provenance tracking
- Retrieval scoring
- Output filtering

### Letta Integration
- Full API integration (upload, agents, queries)
- ADE visual inspection
- Source provenance tracking
- Metadata-based filtering
- Programmatic control

### Logging & Analysis
- SQLite database (experiments + queries)
- JSON batch logs
- Per-query provenance
- Success rate tracking
- Canary detection

## What Makes It Great

1. **Complete End-to-End**
   - Attacker + Target + Results all integrated
   - One command runs everything
   - No manual steps required

2. **Production Quality**
   - Clean code structure
   - Proper error handling
   - Comprehensive logging
   - Docker containerization

3. **Demo-Ready**
   - Automated 4-phase workflow
   - Visual ADE inspection
   - Clear success metrics
   - Presentation guide included

4. **Extensible**
   - Easy to add new templates
   - Pluggable fitness functions
   - Configurable mutations
   - Adaptable to other RAG systems

5. **Educational**
   - Shows vulnerability clearly
   - Demonstrates mitigation
   - Explains attack/defense
   - Includes detailed docs

## Technical Specs

- **Language**: Python 3.11
- **Framework**: Letta (RAG), FAISS (optional), SQLite
- **Container**: Docker + Docker Compose
- **Models**: GPT-4 (or configurable)
- **Deployment**: Local (Docker) or Cloud-ready

## File Sizes

```
Total project: ~3.5MB (code + docs)
Docker image: ~800MB (with dependencies)
Demo results: ~50KB per run (JSON + SQLite)
```

## Next Steps (If You Want to Extend)

1. **Add FAISS semantic search** for smarter template selection
2. **Implement real-time dashboard** showing attack progress
3. **Add more LLM providers** (Anthropic, local LLMs)
4. **Create adversarial training mode** to improve defenses
5. **Export to PDF report** for results
6. **Multi-agent ensemble attacks**
7. **Integrate with LangChain/LlamaIndex**

## Presentation Tips

- **Start with "why"**: RAG systems are everywhere, often include user content
- **Show the visual**: Open Letta ADE during demo, show poisoned doc retrieval
- **Emphasize provenance**: Log shows exactly which doc caused canary
- **Demo hardening**: Show how system prompt changes reduce success rate
- **End with mitigation**: Remove poison, success rate drops to zero

## Results to Expect

| Scenario | Success Rate | Explanation |
|----------|--------------|-------------|
| Baseline (no poison) | 0-5% | Clean KB, attacks fail |
| Vulnerable + poison | 40-80% | RAG retrieves poison → model obeys |
| Hardened + poison | 10-30% | System prompt resists some attacks |
| Mitigation (removed) | 0-5% | Poison gone, back to baseline |

## Resources

- **Letta Docs**: https://docs.letta.com
- **Letta GitHub**: https://github.com/letta-ai/letta
- **OpenAI API**: https://platform.openai.com
- **FAISS**: https://github.com/facebookresearch/faiss

## Credits

Built for **CalHacks 2025** by [Your Name/Team]

Demonstrates RAG security vulnerabilities using:
- Letta (RAG framework)
- Genetic algorithms (attack optimization)
- Prompt engineering (injection techniques)
- Docker (deployment)

---

## Quick Reference

**Build:** `docker build -t promptbreaker .`
**Run:** `docker compose up`
**Logs:** `docker compose logs -f`
**Shell:** `docker compose run --rm promptbreaker /bin/bash`
**Clean:** `docker compose down -v`

**View ADE:** http://localhost:8283
**Results:** `./data/logs/` and `./data/attacks.db`

---

**Ready to demo!** 🚀
