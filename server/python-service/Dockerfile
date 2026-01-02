# Python HuggingFace Service Dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies needed for building Python packages
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    make \
    cmake \
    build-essential \
    libssl-dev \
    zlib1g-dev \
    libbz2-dev \
    libreadline-dev \
    libsqlite3-dev \
    wget \
    curl \
    llvm \
    libncurses5-dev \
    libncursesw5-dev \
    xz-utils \
    tk-dev \
    libffi-dev \
    liblzma-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Copy requirements file
COPY requirements.txt .

# Install PyTorch CPU version first (smaller and faster)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install other Python dependencies
RUN pip install --no-cache-dir -r requirements.txt || \
    (echo "Failed to install from requirements.txt, trying individual packages..." && \
     pip install --no-cache-dir Flask==3.0.0 flask-cors==4.0.0 python-dotenv==1.0.0 && \
     pip install --no-cache-dir transformers accelerate && \
     pip install --no-cache-dir langchain requests numpy sentencepiece protobuf)

# Copy service code
COPY huggingface_service.py .
# .env file not needed - environment variables passed via docker-compose.yml

# Expose port
EXPOSE 5001

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=huggingface_service.py
ENV PORT=5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:5001/health')"

# Start the service
CMD ["python", "huggingface_service.py"]
