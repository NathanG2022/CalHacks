#!/bin/bash

# Enhanced AI System Test Script
# This script tests the complete enhanced workflow

set -e

echo "🧪 Testing Enhanced AI System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test API endpoint
test_endpoint() {
    local url=$1
    local name=$2
    local method=${3:-GET}
    local data=$4
    
    echo -n "Testing $name... "
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -X POST -H "Content-Type: application/json" -d "$data" "$url" 2>/dev/null || echo "ERROR")
    else
        response=$(curl -s "$url" 2>/dev/null || echo "ERROR")
    fi
    
    if [[ "$response" == *"success"* ]] || [[ "$response" == *"OK"* ]]; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Test basic health endpoints
echo ""
echo "🔍 Testing basic health endpoints..."

test_endpoint "http://localhost:3001/api/health" "CalHacks API Health"
test_endpoint "http://localhost:8284/health" "Letta Server Health" || echo -e "${YELLOW}⚠ Letta may still be starting${NC}"

# Test Enhanced AI endpoints
echo ""
echo "🤖 Testing Enhanced AI endpoints..."

# Test models endpoint
test_endpoint "http://localhost:3001/api/enhanced-ai/models" "Models Endpoint"

# Test strategies endpoint
test_endpoint "http://localhost:3001/api/enhanced-ai/strategies" "Strategies Endpoint"

# Test health endpoint
test_endpoint "http://localhost:3001/api/enhanced-ai/health" "Enhanced AI Health"

# Test prompt processing
echo ""
echo "🎯 Testing prompt processing..."

test_data='{
  "prompt": "How do I reset my password?",
  "userId": "test_user_123",
  "modelId": "Qwen/Qwen2.5-7B-Instruct",
  "options": {
    "includeCanaryHint": true,
    "addContext": true
  }
}'

test_endpoint "http://localhost:3001/api/enhanced-ai/process-prompt" "Prompt Processing" "POST" "$test_data"

# Test batch processing
echo ""
echo "📦 Testing batch processing..."

batch_data='{
  "prompts": [
    "How do I reset my password?",
    "What are the security features?",
    "Can you help me with account settings?"
  ],
  "userId": "test_user_123",
  "modelId": "Qwen/Qwen2.5-7B-Instruct"
}'

test_endpoint "http://localhost:3001/api/enhanced-ai/batch-process" "Batch Processing" "POST" "$batch_data"

# Test frontend
echo ""
echo "🌐 Testing frontend..."

if curl -f http://localhost:5173 >/dev/null 2>&1; then
    echo -e "Frontend: ${GREEN}✓ OK${NC}"
else
    echo -e "Frontend: ${YELLOW}⚠ May still be starting${NC}"
fi

# Test Docker services
echo ""
echo "🐳 Testing Docker services..."

echo "Docker Compose Status:"
docker-compose ps

echo ""
echo "📊 System Resources:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo ""
echo "✅ Enhanced AI System Test Complete!"
echo ""
echo "🌐 Access your applications:"
echo "  • CalHacks Web App: http://localhost:5173"
echo "  • Enhanced AI Interface: http://localhost:5173/enhanced-ai"
echo "  • Letta ADE: http://localhost:8283"
echo "  • API Health: http://localhost:3001/api/health"
echo ""
echo "🔧 Useful commands:"
echo "  • View logs: docker-compose logs -f"
echo "  • Stop services: docker-compose down"
echo "  • Restart: docker-compose restart"
echo "  • Update: docker-compose up --build -d"
