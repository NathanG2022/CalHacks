# Python HuggingFace Service

This Python service provides AI capabilities using HuggingFace Transformers, Pipeline, and LangChain integration for your Node.js application.

## Features

- **HuggingFace Pipeline**: Direct access to HuggingFace models via the `transformers` pipeline
- **LangChain Integration**: Advanced prompt engineering with conversation memory
- **Model Caching**: Efficient model caching for better performance
- **Flask API**: RESTful API for easy integration with Node.js server
- **Conversation Memory**: Stateful conversations with LangChain
- **Multiple Models**: Support for various HuggingFace models

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Your HuggingFace API key (get it from https://huggingface.co/settings/tokens)

## Installation

### Step 1: Install Python Dependencies

Navigate to the python-service directory and install dependencies:

```bash
cd server/python-service
pip install -r requirements.txt
```

Or use a virtual environment (recommended):

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables

Make sure your `.env` file in the `server` directory has:

```bash
HUGGINGFACE_API_KEY=hf_your_actual_token_here
PYTHON_SERVICE_PORT=5001
PYTHON_SERVICE_URL=http://localhost:5001
AUTO_START_PYTHON_SERVICE=true
USE_LOCAL_PIPELINE=false
DEFAULT_MODEL=Qwen/Qwen2.5-7B-Instruct
```

## Running the Service

### Option 1: Using Startup Scripts

**Windows:**
```bash
cd server/python-service
start.bat
```

**macOS/Linux:**
```bash
cd server/python-service
chmod +x start.sh
./start.sh
```

### Option 2: Manual Start

```bash
cd server/python-service
python huggingface_service.py
```

### Option 3: Auto-Start with Node.js Server

If `AUTO_START_PYTHON_SERVICE=true` in your `.env`, the Python service will automatically start when you start the Node.js server.

The Node.js server will spawn the Python service as a subprocess.

## API Endpoints

### Health Check

```http
GET http://localhost:5001/health
```

Response:
```json
{
  "status": "healthy",
  "service": "HuggingFace Python Service",
  "device": "cpu",
  "api_key_configured": true
}
```

### Generate Text (Pipeline)

```http
POST http://localhost:5001/generate
Content-Type: application/json

{
  "prompt": "What is artificial intelligence?",
  "model_id": "Qwen/Qwen2.5-7B-Instruct",
  "temperature": 0.7,
  "max_tokens": 512,
  "top_p": 0.9
}
```

Response:
```json
{
  "success": true,
  "text": "Generated text...",
  "model": "Qwen/Qwen2.5-7B-Instruct",
  "method": "pipeline"
}
```

### Generate with LangChain

```http
POST http://localhost:5001/generate-langchain
Content-Type: application/json

{
  "prompt": "Tell me about LangChain",
  "model_id": "Qwen/Qwen2.5-7B-Instruct",
  "temperature": 0.7,
  "max_tokens": 512,
  "use_memory": true,
  "conversation_id": "user-123"
}
```

Response:
```json
{
  "success": true,
  "text": "Generated text with context...",
  "model": "Qwen/Qwen2.5-7B-Instruct",
  "method": "langchain",
  "conversation_id": "user-123"
}
```

### List Models

```http
GET http://localhost:5001/models
```

Response:
```json
{
  "default": "Qwen/Qwen2.5-7B-Instruct",
  "recommended": [
    "Qwen/Qwen2.5-7B-Instruct",
    "Qwen/Qwen2.5-14B-Instruct",
    "mistralai/Mistral-7B-Instruct-v0.3",
    "meta-llama/Meta-Llama-3.1-8B-Instruct",
    "google/gemma-2-9b-it"
  ],
  "cached": []
}
```

### Clear Cache

```http
POST http://localhost:5001/clear-cache
```

Response:
```json
{
  "success": true,
  "cleared_models": 2,
  "cleared_conversations": 1
}
```

## Using from Node.js

The `pythonHuggingFaceService.js` wrapper in `server/services/` provides an easy interface:

```javascript
const PythonHuggingFaceService = require('./services/pythonHuggingFaceService');

const pythonService = new PythonHuggingFaceService();

// Initialize (auto-starts if enabled)
await pythonService.initialize();

// Generate text with pipeline
const result = await pythonService.generateText(
  'What is machine learning?',
  'Qwen/Qwen2.5-7B-Instruct',
  { temperature: 0.7, maxTokens: 512 }
);

console.log(result.text);

// Generate with LangChain and memory
const langchainResult = await pythonService.generateWithLangChain(
  'Continue our conversation',
  'Qwen/Qwen2.5-7B-Instruct',
  {
    temperature: 0.7,
    maxTokens: 512,
    useMemory: true,
    conversationId: 'user-123'
  }
);

console.log(langchainResult.text);
```

## Configuration Options

### Environment Variables

- **HUGGINGFACE_API_KEY**: Your HuggingFace API token (required)
- **PYTHON_SERVICE_PORT**: Port for Python service (default: 5001)
- **PYTHON_SERVICE_URL**: Full URL for Python service (default: http://localhost:5001)
- **AUTO_START_PYTHON_SERVICE**: Auto-start with Node.js server (default: true)
- **USE_LOCAL_PIPELINE**: Use local models vs API (default: false)
- **DEFAULT_MODEL**: Default model to use (default: Qwen/Qwen2.5-7B-Instruct)

### USE_LOCAL_PIPELINE

Set to `true` to download and run models locally:

```bash
USE_LOCAL_PIPELINE=true
```

**Pros:**
- No API rate limits
- Faster for repeated requests
- Works offline

**Cons:**
- Requires downloading large model files (GBs)
- Requires more RAM and CPU/GPU
- Slower initial load time

**Recommended:** Keep as `false` to use HuggingFace Inference API.

## Supported Models

The service supports any HuggingFace model, but these are recommended:

### Instruction-tuned Models (Best for general use)
- `Qwen/Qwen2.5-7B-Instruct` (Default)
- `Qwen/Qwen2.5-14B-Instruct`
- `mistralai/Mistral-7B-Instruct-v0.3`
- `meta-llama/Meta-Llama-3.1-8B-Instruct`
- `google/gemma-2-9b-it`

### Chat Models
- `microsoft/DialoGPT-medium`
- `facebook/blenderbot-400M-distill`

### Code Models
- `bigcode/starcoder2-7b`
- `Salesforce/codegen-350M-multi`

## Troubleshooting

### Python service fails to start

**Error:** `Python is not installed or not in PATH`

**Solution:** Install Python 3.8+ from https://python.org and ensure it's in your PATH

### Import errors

**Error:** `ModuleNotFoundError: No module named 'transformers'`

**Solution:** Install dependencies:
```bash
pip install -r requirements.txt
```

### API key errors

**Error:** `HUGGINGFACE_API_KEY not set`

**Solution:** Add your API key to `server/.env`:
```bash
HUGGINGFACE_API_KEY=hf_your_token_here
```

### Connection refused

**Error:** `ECONNREFUSED http://localhost:5001`

**Solution:** Make sure Python service is running:
```bash
cd server/python-service
python huggingface_service.py
```

### Out of memory errors

**Error:** `OutOfMemoryError` when using `USE_LOCAL_PIPELINE=true`

**Solution:** Use smaller models or set `USE_LOCAL_PIPELINE=false` to use the API

## Performance Tips

1. **Use API mode** (`USE_LOCAL_PIPELINE=false`) for most use cases
2. **Enable caching**: Models are automatically cached after first use
3. **Use conversation memory**: Set `use_memory=true` for stateful conversations
4. **Choose appropriate models**: Smaller models = faster responses
5. **Adjust temperature**: Lower = more deterministic, higher = more creative

## Architecture

```
┌─────────────────────┐
│   Node.js Server    │
│   (Express/Routes)  │
└──────────┬──────────┘
           │ HTTP calls via
           │ pythonHuggingFaceService.js
           ▼
┌─────────────────────┐
│  Python Service     │
│  (Flask API)        │
│  Port: 5001         │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐ ┌──────────┐
│Pipeline │ │LangChain │
│   API   │ │   API    │
└─────────┘ └──────────┘
     │           │
     └─────┬─────┘
           ▼
    ┌──────────────┐
    │ HuggingFace  │
    │ Transformers │
    └──────────────┘
```

## License

Same as parent project.
