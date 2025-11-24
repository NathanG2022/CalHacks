# CalHacks Quick Start Guide

Get your CalHacks program running with Docker and Letta in minutes!

## 🚀 One-Command Setup

### Windows
```bash
setup-docker.bat
```

### Mac/Linux
```bash
./setup-docker.sh
```

## 📋 What You Get

- **Letta AI Platform** - Full-featured AI agent development environment
- **PromptBreaker Demo** - RAG poisoning attack demonstration
- **CalHacks Web App** - React frontend + Express backend
- **PostgreSQL Database** - Vector database for AI applications

## 🌐 Access Points

After setup, visit:

- **CalHacks Web App**: http://localhost:5173
- **Letta ADE**: http://localhost:8283
- **API Health**: http://localhost:3001/api/health

## ⚙️ Configuration

1. **Edit `.env`** - Add your OpenAI API key
2. **Edit `client/.env.local`** - Add Supabase credentials (optional)
3. **Restart**: `docker-compose restart`

## 🧪 Test Setup

```bash
./test-setup.sh
```

## 🎯 PromptBreaker Demo

The demo runs automatically and shows:
- Baseline attacks (low success)
- Poisoned attacks (high success) 
- Hardened defenses (reduced success)
- Mitigation results (back to baseline)

## 🔧 Common Commands

```bash
# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Restart services
docker-compose restart

# Update and rebuild
docker-compose up --build -d
```

## 🆘 Need Help?

- Check [DOCKER_SETUP.md](DOCKER_SETUP.md) for detailed instructions
- Run `./test-setup.sh` to diagnose issues
- View logs with `docker-compose logs -f`

## 🎉 You're Ready!

Your CalHacks program is now running with Docker and Letta. Happy hacking!









