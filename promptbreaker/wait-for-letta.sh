#!/bin/bash

# Wait for Letta server to be fully ready
echo "Waiting for Letta server to be ready..."

# Wait for basic connectivity
until curl -f http://letta_server:8283/ >/dev/null 2>&1; do
  echo "Letta server not responding, waiting 5 seconds..."
  sleep 5
done

echo "Letta server is responding, waiting for API to be ready..."

# Wait for API endpoints to be ready (simplified approach)
echo "Testing API connectivity..."
for i in {1..10}; do
  if curl -s http://letta_server:8283/v1/agents/ >/dev/null 2>&1; then
    echo "Letta API is ready!"
    break
  else
    echo "Letta API not ready, attempt $i/10, waiting 5 seconds..."
    sleep 5
  fi
done

echo "Letta server setup complete!"

# Run the setup and demo
echo "Setting up PromptBreaker demo..."
python target_letta/upload_docs.py setup
python target_letta/create_agent.py setup
echo "Running PromptBreaker demo..."
python orchestrator.py demo
