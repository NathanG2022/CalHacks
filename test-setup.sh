#!/bin/bash

# CalHacks Docker Setup Test Script
# This script tests if all services are running correctly

set -e

echo "🧪 Testing CalHacks Docker Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test HTTP endpoint
test_endpoint() {
    local url=$1
    local name=$2
    local timeout=${3:-10}
    
    echo -n "Testing $name... "
    
    if curl -f -s --max-time $timeout "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        return 1
    fi
}

# Function to test Docker container
test_container() {
    local container=$1
    local name=$2
    
    echo -n "Testing $name container... "
    
    if docker ps --format "table {{.Names}}" | grep -q "^$container$"; then
        echo -e "${GREEN}✓ RUNNING${NC}"
        return 0
    else
        echo -e "${RED}✗ NOT RUNNING${NC}"
        return 1
    fi
}

echo ""
echo "🔍 Checking Docker containers..."

# Test containers
test_container "calhacks-letta-db" "Letta Database"
test_container "calhacks-letta-server" "Letta Server"
test_container "calhacks-letta-nginx" "Letta Nginx"
test_container "calhacks-promptbreaker" "PromptBreaker"
test_container "calhacks-client" "CalHacks Client"
test_container "calhacks-server" "CalHacks Server"

echo ""
echo "🌐 Testing HTTP endpoints..."

# Test endpoints
test_endpoint "http://localhost:8283/health" "Letta Server Health" 15
test_endpoint "http://localhost:3001/api/health" "CalHacks API Health" 10
test_endpoint "http://localhost:5173" "CalHacks Client" 10
test_endpoint "http://localhost:80" "Letta Nginx" 10

echo ""
echo "📊 Docker Compose Status:"
docker-compose ps

echo ""
echo "💾 Disk Usage:"
docker system df

echo ""
echo "🔧 Useful Commands:"
echo "  • View logs: docker-compose logs -f"
echo "  • Stop all: docker-compose down"
echo "  • Restart: docker-compose restart"
echo "  • Update: docker-compose up --build -d"

echo ""
echo "✅ Test complete!"
