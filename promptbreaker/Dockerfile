# PromptBreaker Dockerfile
# Containerized environment for RAG poisoning attack demo

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for better caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY attacker/ ./attacker/
COPY target_letta/ ./target_letta/
COPY orchestrator.py .
COPY wait-for-letta.sh .
RUN chmod +x wait-for-letta.sh
COPY *.md ./

# Create data directory
RUN mkdir -p /app/data/logs

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV LETTA_URL=http://host.docker.internal:8283
ENV PYTHONPATH=/app

# Default command (can be overridden)
CMD ["python", "-u", "orchestrator.py", "demo"]
