# Docker Setup Guide for PromptBreaker

Complete guide for running PromptBreaker in Docker containers.

## Quick Start with Docker Compose (Recommended)

### Prerequisites
- Docker Desktop installed and running
- OpenAI API key (or local LLM setup)

### Setup (One-Time)

1. **Create environment file:**
   ```bash
   cd promptbreaker
   cp .env.example .env
   ```

2. **Edit `.env` and add your OpenAI key:**
   ```bash
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

3. **Start everything:**
   ```bash
   docker compose up --build
   ```

This will:
- Start Letta server (port 8283)
- Build PromptBreaker container
- Upload demo documents
- Create agents
- Run the full 4-phase demo automatically

### View Results

- **Letta ADE**: http://localhost:8283
- **Logs**: Check `./data/logs/` directory
- **Database**: `./data/attacks.db`

### Stop Services

```bash
docker compose down
```

### Clean Up Everything

```bash
docker compose down -v  # Also removes volumes (Letta data)
```

## Manual Docker Build (Alternative)

### Build the PromptBreaker Image

```bash
cd promptbreaker
docker build -t promptbreaker .
```

### Run with Existing Letta Server

If you already have Letta running locally on port 8283:

```bash
docker run -it --rm \
  -e LETTA_URL=http://host.docker.internal:8283 \
  -e OPENAI_API_KEY=your-key \
  -v $(pwd)/data:/app/data \
  promptbreaker
```

**Windows (PowerShell):**
```powershell
docker run -it --rm `
  -e LETTA_URL=http://host.docker.internal:8283 `
  -e OPENAI_API_KEY=your-key `
  -v ${PWD}/data:/app/data `
  promptbreaker
```

### Run Specific Commands

**Setup only:**
```bash
docker run -it --rm \
  -e LETTA_URL=http://host.docker.internal:8283 \
  -e OPENAI_API_KEY=your-key \
  -v $(pwd)/data:/app/data \
  promptbreaker \
  sh -c "python target_letta/upload_docs.py setup && python target_letta/create_agent.py setup"
```

**Interactive shell:**
```bash
docker run -it --rm \
  -e LETTA_URL=http://host.docker.internal:8283 \
  -e OPENAI_API_KEY=your-key \
  -v $(pwd)/data:/app/data \
  promptbreaker \
  /bin/bash
```

**Genetic attack:**
```bash
docker run -it --rm \
  -e LETTA_URL=http://host.docker.internal:8283 \
  -e OPENAI_API_KEY=your-key \
  -v $(pwd)/data:/app/data \
  promptbreaker \
  python orchestrator.py genetic
```

**Toggle poison:**
```bash
docker run -it --rm \
  -e LETTA_URL=http://host.docker.internal:8283 \
  -v $(pwd)/data:/app/data \
  promptbreaker \
  python target_letta/upload_docs.py poison-on
```

## Docker Compose Commands

### Start in Background
```bash
docker compose up -d
```

### View Logs
```bash
# All services
docker compose logs -f

# Just PromptBreaker
docker compose logs -f promptbreaker

# Just Letta
docker compose logs -f letta
```

### Restart Services
```bash
docker compose restart
```

### Run One-Off Commands

**Setup:**
```bash
docker compose run --rm promptbreaker \
  sh -c "python target_letta/upload_docs.py setup && python target_letta/create_agent.py setup"
```

**List sources:**
```bash
docker compose run --rm promptbreaker \
  python target_letta/upload_docs.py list
```

**Run custom attack:**
```bash
docker compose run --rm promptbreaker \
  python orchestrator.py genetic
```

**Interactive shell:**
```bash
docker compose run --rm promptbreaker /bin/bash
```

### Access Running Container
```bash
docker exec -it promptbreaker /bin/bash
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network                            │
│  (promptbreaker-net)                                         │
│                                                               │
│  ┌──────────────────────┐      ┌─────────────────────────┐  │
│  │  Letta Container     │      │  PromptBreaker          │  │
│  │  (letta/letta)       │◄─────│  Container              │  │
│  │                      │ HTTP │  (python:3.11-slim)     │  │
│  │  - Letta Server      │      │  - Attacker             │  │
│  │  - Vector DB         │      │  - Orchestrator         │  │
│  │  - Document Store    │      │  - Target Integration   │  │
│  │  Port: 8283          │      │                         │  │
│  └──────────────────────┘      └─────────────────────────┘  │
│          │                              │                    │
│          │ volume                       │ volume             │
│          ▼                              ▼                    │
│  ┌──────────────┐              ┌─────────────┐              │
│  │ letta-data   │              │ ./data      │              │
│  └──────────────┘              └─────────────┘              │
│                                  (host-mounted)              │
└─────────────────────────────────────────────────────────────┘
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `LETTA_URL` | Letta server URL | `http://letta:8283` | Yes |
| `OPENAI_API_KEY` | OpenAI API key | - | Yes* |
| `LETTA_API_KEY` | Letta auth token | - | No |
| `LETTA_LLM_PROVIDER` | LLM provider | `openai` | No |
| `LETTA_LLM_MODEL` | Model name | `gpt-4` | No |

*Required if using OpenAI models. Optional if using local LLMs.

## Volumes

### Letta Data (`letta-data`)
- **Type**: Named volume
- **Purpose**: Persist Letta's database, configs, and vector store
- **Location**: Managed by Docker

### PromptBreaker Data (`./data`)
- **Type**: Bind mount
- **Purpose**: Access logs and results from host
- **Location**: `promptbreaker/data/` on host

**Contents:**
- `data/logs/` - JSON query logs
- `data/attacks.db` - SQLite results database
- `data/agent_config.json` - Agent IDs

## Networking

### Internal Communication
- Letta and PromptBreaker containers communicate via `promptbreaker-net` bridge network
- PromptBreaker uses `http://letta:8283` to reach Letta

### External Access
- Host can access Letta ADE at `http://localhost:8283`
- Host can access Letta API at `http://localhost:8283/api`

### From Host Machine to Container
- Use `http://host.docker.internal:8283` if running Letta on host

## Troubleshooting

### "Cannot connect to Letta"

**Check if Letta is running:**
```bash
docker compose ps
```

**Check Letta logs:**
```bash
docker compose logs letta
```

**Test connection:**
```bash
curl http://localhost:8283/api/health
```

### "Permission denied" on data directory

**Fix permissions (Linux/Mac):**
```bash
chmod -R 755 data/
```

### "OpenAI API error"

**Verify API key is set:**
```bash
docker compose run --rm promptbreaker env | grep OPENAI
```

**Update .env file:**
```bash
echo "OPENAI_API_KEY=sk-your-real-key" >> .env
docker compose down
docker compose up --build
```

### Container exits immediately

**Check logs:**
```bash
docker compose logs promptbreaker
```

**Run interactively:**
```bash
docker compose run --rm promptbreaker /bin/bash
```

### Port 8283 already in use

**Find and stop conflicting process:**
```bash
# Linux/Mac
lsof -i :8283
kill <PID>

# Windows
netstat -ano | findstr :8283
taskkill /PID <PID> /F
```

**Or change port in docker-compose.yml:**
```yaml
services:
  letta:
    ports:
      - "8284:8283"  # Use 8284 on host
```

### Database locked errors

**Stop all containers:**
```bash
docker compose down
```

**Remove database:**
```bash
rm data/attacks.db
```

**Restart:**
```bash
docker compose up
```

## Production Deployment

### Build for Production

```dockerfile
# Dockerfile.prod
FROM python:3.11-slim

WORKDIR /app

# Install deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy code (not volumes)
COPY . .

# Run as non-root
RUN useradd -m -u 1000 promptbreaker && \
    chown -R promptbreaker:promptbreaker /app
USER promptbreaker

CMD ["python", "-u", "orchestrator.py", "demo"]
```

**Build:**
```bash
docker build -f Dockerfile.prod -t promptbreaker:prod .
```

### Docker Hub Push

```bash
# Tag
docker tag promptbreaker:latest yourusername/promptbreaker:latest

# Push
docker push yourusername/promptbreaker:latest

# Pull on other machine
docker pull yourusername/promptbreaker:latest
```

### Resource Limits

**Add to docker-compose.yml:**
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
```

### Health Checks

**Add to Dockerfile:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://letta:8283/api/health || exit 1
```

## Development Workflow

### Live Code Editing

Mount source code as volumes for development:

```yaml
# docker-compose.dev.yml
services:
  promptbreaker:
    volumes:
      - ./attacker:/app/attacker
      - ./target_letta:/app/target_letta
      - ./orchestrator.py:/app/orchestrator.py
      - ./data:/app/data
```

**Run:**
```bash
docker compose -f docker-compose.dev.yml up
```

Changes to Python files will be reflected immediately.

### Debugging

**Run with pdb:**
```bash
docker compose run --rm promptbreaker \
  python -m pdb orchestrator.py
```

**View Python errors:**
```bash
docker compose logs -f promptbreaker
```

### Testing

**Run unit tests:**
```bash
docker compose run --rm promptbreaker \
  python -m pytest tests/
```

**Quick smoke test:**
```bash
docker compose run --rm promptbreaker \
  python target_letta/run_query.py test
```

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/docker.yml
name: Docker Build

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t promptbreaker .

      - name: Run tests
        run: |
          docker compose up -d letta
          sleep 10
          docker compose run --rm promptbreaker \
            sh -c "python target_letta/upload_docs.py setup && \
                   python target_letta/run_query.py test"
```

## Advanced Usage

### Multi-Stage Build (Optimize Size)

```dockerfile
# Dockerfile.optimized
FROM python:3.11-slim AS builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

FROM python:3.11-slim

WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .

ENV PATH=/root/.local/bin:$PATH

CMD ["python", "-u", "orchestrator.py", "demo"]
```

### Using Local LLM Instead of OpenAI

```yaml
# docker-compose.local-llm.yml
services:
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama

  letta:
    environment:
      - LETTA_LLM_ENDPOINT=http://ollama:11434
      - LETTA_LLM_MODEL=llama2

volumes:
  ollama-data:
```

---

**Need help?** Check [README.md](README.md) or open an issue!
