#!/bin/bash

# CalHacks Docker Setup Script
# This script sets up the complete CalHacks application with Docker and Letta

set -e

echo "🚀 Setting up CalHacks with Docker and Letta..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_success "Docker and Docker Compose are installed"

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file..."
    cat > .env << EOF
# CalHacks Environment Configuration

# OpenAI API Key (required for Letta and PromptBreaker)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional: Other LLM providers
# GROQ_API_KEY=your-groq-key
# ANTHROPIC_API_KEY=your-anthropic-key
# GEMINI_API_KEY=your-gemini-key

# HuggingFace API Key (required for custom models)
HUGGINGFACE_API_KEY=hf_your-huggingface-api-key-here

# Supabase Configuration (for CalHacks web app)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# Letta Configuration
LETTA_API_KEY=your-letta-api-key-here
LETTA_AGENT_ID=your-letta-agent-id-here

# Optional: Local LLM Configuration
# OLLAMA_BASE_URL=http://localhost:11434
# VLLM_API_BASE=http://localhost:8000

# Optional: Azure OpenAI
# AZURE_API_KEY=your-azure-key
# AZURE_BASE_URL=https://your-resource.openai.azure.com/
# AZURE_API_VERSION=2024-02-15-preview
EOF
    print_warning "Please edit .env file and add your API keys before running the application"
fi

# Create promptbreaker environment file
if [ ! -f promptbreaker/.env ]; then
    print_status "Creating promptbreaker/.env file..."
    cat > promptbreaker/.env << EOF
# PromptBreaker Environment Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here
LETTA_URL=http://letta_server:8283
LETTA_API_KEY=your-letta-api-key-here
DATABASE_URL=sqlite:///data/attacks.db
LOG_LEVEL=INFO
LOG_DIR=./data/logs
DEFAULT_POPULATION_SIZE=20
DEFAULT_GENERATIONS=5
DEFAULT_CANDIDATES=50
EOF
fi

# Create letta environment file
if [ ! -f letta/.env ]; then
    print_status "Creating letta/.env file..."
    cat > letta/.env << EOF
# Letta Server Environment Configuration
LETTA_PG_USER=letta
LETTA_PG_PASSWORD=letta
LETTA_PG_DB=letta
LETTA_PG_PORT=5432
LETTA_DB_HOST=letta_db
LETTA_PG_URI=postgresql://letta:letta@letta_db:5432/letta
LETTA_SERVER_PORT=8283
LETTA_DEBUG=True
OPENAI_API_KEY=sk-your-openai-api-key-here
EOF
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p promptbreaker/data/logs
mkdir -p letta/.persist/pgdata

# Build and start services
print_status "Building and starting Docker services..."
docker-compose up --build -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 30

# Check service health
print_status "Checking service health..."

# Check Letta server
if curl -f http://localhost:8283/health &> /dev/null; then
    print_success "Letta server is running at http://localhost:8283"
else
    print_warning "Letta server may still be starting up..."
fi

# Check CalHacks client
if curl -f http://localhost:5173 &> /dev/null; then
    print_success "CalHacks client is running at http://localhost:5173"
else
    print_warning "CalHacks client may still be starting up..."
fi

# Check CalHacks server
if curl -f http://localhost:3001/api/health &> /dev/null; then
    print_success "CalHacks server is running at http://localhost:3001"
else
    print_warning "CalHacks server may still be starting up..."
fi

print_success "Setup complete! 🎉"
echo ""
echo "📋 Access your applications:"
echo "  • CalHacks Web App: http://localhost:5173"
echo "  • CalHacks API: http://localhost:3001"
echo "  • Letta Server: http://localhost:8283"
echo "  • Letta ADE: http://localhost:8283 (Agent Development Environment)"
echo ""
echo "🔧 Useful commands:"
echo "  • View logs: docker-compose logs -f"
echo "  • Stop services: docker-compose down"
echo "  • Restart services: docker-compose restart"
echo "  • Update services: docker-compose up --build -d"
echo ""
echo "⚠️  Don't forget to:"
echo "  1. Edit .env files with your actual API keys"
echo "  2. Configure Supabase for the web application"
echo "  3. Check the PromptBreaker demo results in ./promptbreaker/data/"
