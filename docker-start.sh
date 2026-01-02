#!/bin/bash

# CalHacks Docker Startup Script

echo "🚀 Starting CalHacks AI Safety Testing Webapp"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo ""
    echo "Please create a .env file with your configuration."
    echo "You can copy .env.example as a starting point:"
    echo ""
    echo "  cp .env.example .env"
    echo ""
    echo "Then edit .env with your API keys and configuration."
    exit 1
fi

echo "✅ Environment file found"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo ""
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Ask user what to start
echo "What would you like to start?"
echo ""
echo "1. Full stack (All services including Letta)"
echo "2. Web app only (Python + Server + Client)"
echo "3. Just rebuild services (no start)"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🔨 Building and starting all services..."
        docker-compose up --build
        ;;
    2)
        echo ""
        echo "🔨 Building and starting web app services..."
        docker-compose up --build python_service calhacks_server calhacks_client
        ;;
    3)
        echo ""
        echo "🔨 Rebuilding services..."
        docker-compose build
        echo ""
        echo "✅ Build complete!"
        echo ""
        echo "To start services, run:"
        echo "  docker-compose up"
        ;;
    *)
        echo ""
        echo "❌ Invalid choice"
        exit 1
        ;;
esac
