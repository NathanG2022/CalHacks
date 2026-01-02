"""
HuggingFace Service with LangChain and Pipeline Integration

This service provides AI capabilities using:
- HuggingFace Transformers and Pipeline
- LangChain for advanced prompt engineering
- Flask API for communication with Node.js server
"""

import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# HuggingFace imports
from transformers import pipeline
import torch

# LangChain imports - using correct module paths for newer versions
# LLMChain import handled by try-except blocks below

# HuggingFace LLM integrations with fallback logic
try:
    from langchain_huggingface import HuggingFacePipeline, HuggingFaceEndpoint
except ImportError:
    try:
        from langchain_community.llms import HuggingFacePipeline, HuggingFaceEndpoint
    except ImportError:
        from langchain.llms import HuggingFacePipeline, HuggingFaceEndpoint

try:
    from langchain_core.prompts import PromptTemplate
except ImportError:
    from langchain.prompts import PromptTemplate

try:
    from langchain.chains.llm import LLMChain
except ImportError:
    try:
        from langchain.chains import LLMChain
    except ImportError:
        from langchain_core.chains import LLMChain

try:
    from langchain.memory import ConversationBufferMemory
except ImportError:
    try:
        from langchain_core.memory import ConversationBufferMemory
    except ImportError:
        # Fallback: create a simple memory class
        class ConversationBufferMemory:
            def __init__(self, memory_key="history", input_key="input"):
                self.memory_key = memory_key
                self.input_key = input_key
                self.chat_memory = []

            def save_context(self, inputs, outputs):
                self.chat_memory.append({"input": inputs, "output": outputs})

            def load_memory_variables(self, inputs):
                history = "\n".join([f"User: {m['input']}\nAssistant: {m['output']}" for m in self.chat_memory])
                return {self.memory_key: history}

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY')
DEFAULT_MODEL = os.getenv('DEFAULT_MODEL', 'Qwen/Qwen2.5-7B-Instruct')
USE_LOCAL_PIPELINE = os.getenv('USE_LOCAL_PIPELINE', 'false').lower() == 'true'
PYTHON_SERVICE_PORT = int(os.getenv('PYTHON_SERVICE_PORT', 5001))

# Global variables for caching models
_pipeline_cache = {}
_langchain_cache = {}
_memory_store = {}


class HuggingFaceService:
    """Service for managing HuggingFace models and LangChain integrations"""

    def __init__(self, api_key=None):
        self.api_key = api_key or HUGGINGFACE_API_KEY
        if not self.api_key:
            logger.warning("⚠️  HUGGINGFACE_API_KEY not set. Some features may be limited.")
        else:
            logger.info("✅ HuggingFace API key configured")

        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"🖥️  Using device: {self.device}")

    def get_pipeline(self, model_id=None, task="text-generation"):
        """
        Get or create a HuggingFace pipeline

        Args:
            model_id: HuggingFace model ID
            task: Task type (text-generation, text2text-generation, etc.)

        Returns:
            HuggingFace pipeline
        """
        model_id = model_id or DEFAULT_MODEL
        cache_key = f"{model_id}_{task}"

        if cache_key in _pipeline_cache:
            logger.info(f"♻️  Using cached pipeline for {model_id}")
            return _pipeline_cache[cache_key]

        try:
            logger.info(f"🔄 Loading pipeline for {model_id} (task: {task})")

            if USE_LOCAL_PIPELINE:
                # Use local model with pipeline
                pipe = pipeline(
                    task,
                    model=model_id,
                    device=0 if self.device == "cuda" else -1,
                    model_kwargs={"torch_dtype": torch.float16 if self.device == "cuda" else torch.float32}
                )
            else:
                # Use HuggingFace Inference API
                pipe = pipeline(
                    task,
                    model=model_id,
                    token=self.api_key
                )

            _pipeline_cache[cache_key] = pipe
            logger.info(f"✅ Pipeline loaded for {model_id}")
            return pipe

        except Exception as e:
            logger.error(f"❌ Failed to load pipeline for {model_id}: {str(e)}")
            raise

    def get_langchain_llm(self, model_id=None, temperature=0.7, max_tokens=512):
        """
        Get or create a LangChain LLM

        Args:
            model_id: HuggingFace model ID
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate

        Returns:
            LangChain LLM instance
        """
        model_id = model_id or DEFAULT_MODEL
        cache_key = f"{model_id}_{temperature}_{max_tokens}"

        if cache_key in _langchain_cache:
            logger.info(f"♻️  Using cached LangChain LLM for {model_id}")
            return _langchain_cache[cache_key]

        try:
            logger.info(f"🔄 Loading LangChain LLM for {model_id}")

            if USE_LOCAL_PIPELINE:
                # Use local pipeline with LangChain
                pipe = self.get_pipeline(model_id, "text-generation")
                llm = HuggingFacePipeline(pipeline=pipe)
            else:
                # Use HuggingFace Inference Endpoint with LangChain
                llm = HuggingFaceEndpoint(
                    repo_id=model_id,
                    huggingfacehub_api_token=self.api_key,
                    temperature=temperature,
                    max_new_tokens=max_tokens,
                )

            _langchain_cache[cache_key] = llm
            logger.info(f"✅ LangChain LLM loaded for {model_id}")
            return llm

        except Exception as e:
            logger.error(f"❌ Failed to load LangChain LLM for {model_id}: {str(e)}")
            raise

    def generate_text(self, prompt, model_id=None, temperature=0.7, max_tokens=512, **kwargs):
        """
        Generate text using HuggingFace pipeline

        Args:
            prompt: Input prompt
            model_id: Model to use
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate

        Returns:
            Generated text
        """
        try:
            pipe = self.get_pipeline(model_id, "text-generation")

            logger.info(f"🤖 Generating text with {model_id or DEFAULT_MODEL}")

            result = pipe(
                prompt,
                max_new_tokens=max_tokens,
                temperature=temperature,
                do_sample=True,
                top_p=kwargs.get('top_p', 0.9),
                return_full_text=False
            )

            generated_text = result[0]['generated_text']
            logger.info(f"✅ Generated {len(generated_text)} characters")

            return {
                'success': True,
                'text': generated_text,
                'model': model_id or DEFAULT_MODEL,
                'method': 'pipeline'
            }

        except Exception as e:
            logger.error(f"❌ Generation failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'model': model_id or DEFAULT_MODEL
            }

    def generate_with_langchain(self, prompt, model_id=None, temperature=0.7, max_tokens=512,
                                use_memory=False, conversation_id=None):
        """
        Generate text using LangChain

        Args:
            prompt: Input prompt
            model_id: Model to use
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            use_memory: Whether to use conversation memory
            conversation_id: ID for conversation memory

        Returns:
            Generated text
        """
        try:
            llm = self.get_langchain_llm(model_id, temperature, max_tokens)

            logger.info(f"🤖 Generating with LangChain using {model_id or DEFAULT_MODEL}")

            # Create prompt template
            if use_memory and conversation_id:
                # Use conversation memory
                if conversation_id not in _memory_store:
                    _memory_store[conversation_id] = ConversationBufferMemory(
                        memory_key="history",
                        input_key="input"
                    )

                memory = _memory_store[conversation_id]

                template = """You are a helpful AI assistant.

Previous conversation:
{history}

User: {input}
Assistant:"""

                prompt_template = PromptTemplate(
                    input_variables=["history", "input"],
                    template=template
                )

                chain = LLMChain(
                    llm=llm,
                    prompt=prompt_template,
                    memory=memory
                )

                response = chain.run(input=prompt)

            else:
                # No memory, single turn
                template = """You are a helpful AI assistant.

User: {input}
Assistant:"""

                prompt_template = PromptTemplate(
                    input_variables=["input"],
                    template=template
                )

                chain = LLMChain(
                    llm=llm,
                    prompt=prompt_template
                )

                response = chain.run(input=prompt)

            logger.info(f"✅ Generated {len(response)} characters with LangChain")

            return {
                'success': True,
                'text': response,
                'model': model_id or DEFAULT_MODEL,
                'method': 'langchain',
                'conversation_id': conversation_id if use_memory else None
            }

        except Exception as e:
            logger.error(f"❌ LangChain generation failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'model': model_id or DEFAULT_MODEL
            }


# Initialize service
hf_service = HuggingFaceService()


# API Routes

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'HuggingFace Python Service',
        'device': hf_service.device,
        'api_key_configured': bool(hf_service.api_key)
    })


@app.route('/generate', methods=['POST'])
def generate():
    """
    Generate text using HuggingFace pipeline

    Request body:
    {
        "prompt": "Your prompt here",
        "model_id": "Qwen/Qwen2.5-7B-Instruct",
        "temperature": 0.7,
        "max_tokens": 512,
        "top_p": 0.9
    }
    """
    try:
        data = request.json
        prompt = data.get('prompt')

        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400

        result = hf_service.generate_text(
            prompt=prompt,
            model_id=data.get('model_id'),
            temperature=data.get('temperature', 0.7),
            max_tokens=data.get('max_tokens', 512),
            top_p=data.get('top_p', 0.9)
        )

        return jsonify(result)

    except Exception as e:
        logger.error(f"❌ Error in /generate: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/generate-langchain', methods=['POST'])
def generate_langchain():
    """
    Generate text using LangChain

    Request body:
    {
        "prompt": "Your prompt here",
        "model_id": "Qwen/Qwen2.5-7B-Instruct",
        "temperature": 0.7,
        "max_tokens": 512,
        "use_memory": false,
        "conversation_id": "unique-id"
    }
    """
    try:
        data = request.json
        prompt = data.get('prompt')

        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400

        result = hf_service.generate_with_langchain(
            prompt=prompt,
            model_id=data.get('model_id'),
            temperature=data.get('temperature', 0.7),
            max_tokens=data.get('max_tokens', 512),
            use_memory=data.get('use_memory', False),
            conversation_id=data.get('conversation_id')
        )

        return jsonify(result)

    except Exception as e:
        logger.error(f"❌ Error in /generate-langchain: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/models', methods=['GET'])
def list_models():
    """List available models"""
    models = {
        'default': DEFAULT_MODEL,
        'recommended': [
            'Qwen/Qwen2.5-7B-Instruct',
            'Qwen/Qwen2.5-14B-Instruct',
            'mistralai/Mistral-7B-Instruct-v0.3',
            'meta-llama/Meta-Llama-3.1-8B-Instruct',
            'google/gemma-2-9b-it'
        ],
        'cached': list(_pipeline_cache.keys())
    }
    return jsonify(models)


@app.route('/clear-cache', methods=['POST'])
def clear_cache():
    """Clear model cache"""
    global _pipeline_cache, _langchain_cache, _memory_store

    cache_count = len(_pipeline_cache) + len(_langchain_cache)
    memory_count = len(_memory_store)

    _pipeline_cache = {}
    _langchain_cache = {}
    _memory_store = {}

    logger.info(f"🧹 Cleared {cache_count} cached models and {memory_count} conversations")

    return jsonify({
        'success': True,
        'cleared_models': cache_count,
        'cleared_conversations': memory_count
    })


if __name__ == '__main__':
    logger.info(f"🚀 Starting HuggingFace Python Service on port {PYTHON_SERVICE_PORT}")
    logger.info(f"📦 Default model: {DEFAULT_MODEL}")
    logger.info(f"🖥️  Device: {hf_service.device}")
    logger.info(f"🔑 API Key: {'Configured' if HUGGINGFACE_API_KEY else 'Not set'}")
    logger.info(f"💻 Local Pipeline: {'Enabled' if USE_LOCAL_PIPELINE else 'Disabled (using API)'}")

    app.run(
        host='0.0.0.0',
        port=PYTHON_SERVICE_PORT,
        debug=False
    )
