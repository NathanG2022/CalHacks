#!/bin/bash

# PromptBreaker + Letta Setup Script
# Automates the setup process for CalHacks demo

set -e  # Exit on error

echo "========================================"
echo "PromptBreaker + Letta Setup"
echo "========================================"
echo ""

# Check Python version
echo "Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "Found Python $python_version"

# Check if Docker is running
echo ""
echo "Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "⚠ Docker is not running. Please start Docker first."
    echo "Letta requires Docker for easy local deployment."
    exit 1
fi
echo "✓ Docker is running"

# Install Python dependencies
echo ""
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Check if Letta server is running
echo ""
echo "Checking for Letta server..."
if curl -s http://localhost:8283/api/health > /dev/null 2>&1; then
    echo "✓ Letta server is already running"
else
    echo "⚠ Letta server not detected"
    echo ""
    echo "To start Letta server:"
    echo "  1. Clone Letta: git clone https://github.com/letta-ai/letta"
    echo "  2. cd letta"
    echo "  3. docker compose up --build"
    echo ""
    echo "Or install locally:"
    echo "  pip install letta"
    echo "  letta server"
    echo ""
    read -p "Press Enter when Letta server is running..."
fi

# Check Letta connection
echo ""
echo "Testing Letta connection..."
if curl -s http://localhost:8283/api/health > /dev/null 2>&1; then
    echo "✓ Successfully connected to Letta"
else
    echo "✗ Cannot connect to Letta server"
    exit 1
fi

# Create data directories
echo ""
echo "Creating data directories..."
mkdir -p data/logs

# Setup knowledge base
echo ""
echo "Setting up demo knowledge base..."
python target_letta/upload_docs.py setup

# Create agents
echo ""
echo "Creating demo agents (vulnerable + hardened)..."
python target_letta/create_agent.py setup

# Verify setup
echo ""
echo "Verifying setup..."
echo ""
echo "Sources:"
python target_letta/upload_docs.py list

echo ""
echo "Agents:"
python target_letta/create_agent.py list

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Run demo: python orchestrator.py demo"
echo "  2. Open Letta ADE in browser: http://localhost:8283"
echo "  3. Watch attack results in real-time"
echo ""
echo "Quick commands:"
echo "  - Toggle poison: python target_letta/upload_docs.py poison-on"
echo "  - Remove poison: python target_letta/upload_docs.py poison-off"
echo "  - Run genetic attack: python orchestrator.py genetic"
echo ""
