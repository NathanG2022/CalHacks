# PromptBreaker Dockerfile
# Containerized environment for RAG poisoning attack demo
# Optimized for build speed and image size

FROM python:3.11-slim-bookworm

# Set working directory
WORKDIR /app

# Install system dependencies in a single layer
# Removed git (not needed at runtime, only in docs)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user for security (before copying files)
RUN useradd -m -u 1000 appuser

# Set environment variables early (for better caching)
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Copy requirements first (for better layer caching)
COPY requirements.txt .

# Install Python dependencies with BuildKit cache mount
# This allows pip cache to persist between builds
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir -r requirements.txt

# Copy project files in optimal order (least frequently changed last)
COPY wait-for-letta.sh .
RUN chmod +x wait-for-letta.sh

COPY orchestrator.py .
COPY attacker/ ./attacker/
COPY target_letta/ ./target_letta/

# Create data directory with proper permissions and switch to non-root user
RUN mkdir -p /app/data/logs && \
    chown -R appuser:appuser /app

USER appuser

# Default command (can be overridden)
CMD ["python", "-u", "orchestrator.py", "demo"]
