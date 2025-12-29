# CalHacks Docker Setup Guide

This guide will help you run your CalHacks program with Docker and Letta in a containerized environment.

## 🚀 Quick Start

### Prerequisites

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Docker Compose** (usually included with Docker Desktop)
- **OpenAI API Key** (required for Letta and PromptBreaker)

### One-Command Setup

**Windows:**
```bash
setup-docker.bat
```

**Mac/Linux:**
```bash
chmod +x setup-docker.sh
./setup-docker.sh
```

This will:
- Create all necessary environment files
- Build and start all Docker containers
- Set up the complete application stack
- Run the PromptBreaker demo automatically

## 📋 What Gets Deployed

The Docker setup includes:

1. **Letta Server** - AI agent platform with PostgreSQL database
2. **PromptBreaker** - RAG poisoning attack demonstration
3. **CalHacks Web App** - React frontend + Express backend
4. **Nginx** - Reverse proxy for Letta

## 🔧 Manual Setup

If you prefer to set up manually:

### 1. Create Environment Files

Create `.env` in the root directory:
```env
# OpenAI API Key (required)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Supabase Configuration (for web app)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Start Services

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🌐 Access Your Applications

After setup, you can access:

- **CalHacks Web App**: http://localhost:5173
- **CalHacks API**: http://localhost:3001
- **Letta Server**: http://localhost:8283
- **Letta ADE**: http://localhost:8283 (Agent Development Environment)

## 🎯 PromptBreaker Demo

The PromptBreaker demo runs automatically and demonstrates:

1. **Phase 1**: Baseline attack (no poison) → low success rate
2. **Phase 2**: Poisoned attack on vulnerable agent → high success rate
3. **Phase 3**: Poisoned attack on hardened agent → lower success rate
4. **Phase 4**: Mitigation (poison removed) → low success rate

### View Demo Results

```bash
# Check attack logs
ls promptbreaker/data/logs/

# View SQLite database
sqlite3 promptbreaker/data/attacks.db
```

## 🔍 Troubleshooting

### Services Not Starting

```bash
# Check service status
docker-compose ps

# View specific service logs
docker-compose logs letta_server
docker-compose logs promptbreaker
```

### Port Conflicts

If you have port conflicts, modify the ports in `docker-compose.yml`:

```yaml
ports:
  - "8284:8283"  # Change 8283 to 8284
  - "5174:5173"  # Change 5173 to 5174
```

### API Key Issues

Make sure your `.env` files contain valid API keys:

```bash
# Check environment variables
docker-compose exec letta_server env | grep OPENAI
```

### Database Issues

Reset the database:

```bash
# Stop services
docker-compose down

# Remove database volume
docker volume rm calhacks_letta_db_data

# Restart services
docker-compose up --build -d
```

## 🛠️ Development Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f letta_server
docker-compose logs -f promptbreaker
docker-compose logs -f calhacks_client
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart letta_server
```

### Update Services
```bash
# Rebuild and restart
docker-compose up --build -d

# Pull latest images
docker-compose pull
docker-compose up -d
```

### Access Container Shells
```bash
# Letta server
docker-compose exec letta_server bash

# PromptBreaker
docker-compose exec promptbreaker bash

# CalHacks server
docker-compose exec calhacks_server sh
```

## 📊 Monitoring

### Health Checks

All services include health checks. Check status:

```bash
# Service health
docker-compose ps

# Manual health check
curl http://localhost:8283/health
curl http://localhost:3001/api/health
curl http://localhost:5173
```

### Resource Usage

```bash
# Container resource usage
docker stats

# Specific container
docker stats calhacks-letta-server
```

## 🔐 Security Notes

- Environment files contain sensitive API keys
- Never commit `.env` files to version control
- Use Docker secrets for production deployments
- Regularly rotate API keys

## 🚀 Production Deployment

For production deployment:

1. **Use Docker secrets** for API keys
2. **Enable HTTPS** with proper certificates
3. **Set up monitoring** and logging
4. **Configure backup** for database volumes
5. **Use Docker Swarm** or **Kubernetes** for orchestration

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Letta Documentation](https://docs.letta.com)
- [PromptBreaker Demo Guide](promptbreaker/DEMO_GUIDE.md)

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables are set
3. Ensure Docker has enough resources
4. Check for port conflicts
5. Review the troubleshooting section above

For additional help, check the individual component documentation:
- [CalHacks README](README.md)
- [PromptBreaker README](promptbreaker/README.md)
- [Letta README](letta/README.md)















