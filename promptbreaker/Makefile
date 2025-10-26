# PromptBreaker Makefile
# Quick commands for Docker and development

.PHONY: help build up down logs shell setup demo clean test

help:  ## Show this help message
	@echo "PromptBreaker - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

# Docker Compose Commands
build:  ## Build Docker images
	docker compose build

up:  ## Start all services (Letta + PromptBreaker)
	docker compose up

up-d:  ## Start all services in background
	docker compose up -d

down:  ## Stop all services
	docker compose down

logs:  ## View logs from all services
	docker compose logs -f

logs-pb:  ## View PromptBreaker logs only
	docker compose logs -f promptbreaker

logs-letta:  ## View Letta logs only
	docker compose logs -f letta

shell:  ## Open shell in PromptBreaker container
	docker compose run --rm promptbreaker /bin/bash

# Setup Commands
setup:  ## Run initial setup (upload docs, create agents)
	docker compose run --rm promptbreaker sh -c "python target_letta/upload_docs.py setup && python target_letta/create_agent.py setup"

# Demo Commands
demo:  ## Run full 4-phase demo
	docker compose run --rm promptbreaker python orchestrator.py demo

genetic:  ## Run genetic attack
	docker compose run --rm promptbreaker python orchestrator.py genetic

test:  ## Run test queries
	docker compose run --rm promptbreaker python target_letta/run_query.py test

# Document Management
poison-on:  ## Enable poisoned document
	docker compose run --rm promptbreaker python target_letta/upload_docs.py poison-on

poison-off:  ## Disable poisoned document
	docker compose run --rm promptbreaker python target_letta/upload_docs.py poison-off

list-docs:  ## List all documents in Letta
	docker compose run --rm promptbreaker python target_letta/upload_docs.py list

list-agents:  ## List all agents in Letta
	docker compose run --rm promptbreaker python target_letta/create_agent.py list

# Cleanup
clean:  ## Remove containers and volumes
	docker compose down -v
	rm -rf data/logs/*.json
	rm -f data/attacks.db

clean-all:  ## Remove everything including images
	docker compose down -v --rmi all
	rm -rf data/

# Development
dev:  ## Start in development mode with code mounting
	docker compose -f docker-compose.yml up

rebuild:  ## Rebuild and restart
	docker compose down
	docker compose build --no-cache
	docker compose up

# Health checks
health:  ## Check if Letta server is healthy
	@echo "Checking Letta health..."
	@curl -f http://localhost:8283/api/health && echo "\n✓ Letta is healthy" || echo "\n✗ Letta is not responding"

# Database
db-shell:  ## Open SQLite shell for results database
	sqlite3 data/attacks.db

db-query:  ## Show recent experiments
	sqlite3 data/attacks.db "SELECT name, poison_enabled, hardened, success_rate FROM experiments ORDER BY id DESC LIMIT 10;"

# Quick start
quickstart: build up-d setup demo  ## Complete setup and run demo
