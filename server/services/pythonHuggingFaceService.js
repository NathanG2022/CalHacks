/**
 * Node.js Wrapper for Python HuggingFace Service
 *
 * This service provides a bridge between the Node.js server and the Python
 * HuggingFace service that uses transformers, pipelines, and LangChain.
 */

const axios = require('axios');
const { spawn, execSync } = require('child_process');
const path = require('path');

class PythonHuggingFaceService {
  constructor() {
    this.pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';
    this.pythonServicePort = process.env.PYTHON_SERVICE_PORT || 5001;
    this.pythonProcess = null;
    this.isReady = false;
    this.autoStart = process.env.AUTO_START_PYTHON_SERVICE !== 'false';
    this.pythonCommand = null;

    console.log(`🐍 Python Service URL: ${this.pythonServiceUrl}`);
  }

  /**
   * Find the correct Python command for the current platform
   */
  findPythonCommand() {
    if (this.pythonCommand) {
      return this.pythonCommand;
    }

    // Try different Python commands in order
    const commands = process.platform === 'win32'
      ? ['py', 'python', 'python3']
      : ['python3', 'python', 'py'];

    for (const cmd of commands) {
      try {
        // Try to execute python --version
        const result = execSync(`${cmd} --version`, {
          encoding: 'utf8',
          stdio: 'pipe'
        });

        if (result.includes('Python 3')) {
          console.log(`✅ Found Python command: ${cmd} (${result.trim()})`);
          this.pythonCommand = cmd;
          return cmd;
        }
      } catch (error) {
        // Command not found, try next one
        continue;
      }
    }

    // Default fallback
    console.warn('⚠️  Could not find Python 3, defaulting to "python"');
    this.pythonCommand = 'python';
    return 'python';
  }

  /**
   * Start the Python service as a subprocess
   */
  async startPythonService() {
    if (this.pythonProcess) {
      console.log('⚠️  Python service is already running');
      return;
    }

    return new Promise((resolve, reject) => {
      const pythonScriptPath = path.join(__dirname, '../python-service/huggingface_service.py');
      const pythonCmd = this.findPythonCommand();

      console.log('🚀 Starting Python HuggingFace service...');
      console.log(`📂 Script path: ${pythonScriptPath}`);
      console.log(`🐍 Using Python command: ${pythonCmd}`);

      // Start Python process
      this.pythonProcess = spawn(pythonCmd, [pythonScriptPath], {
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1' // Ensure real-time output
        },
        shell: process.platform === 'win32' // Use shell on Windows for better compatibility
      });

      // Handle stdout
      this.pythonProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        console.log(`[Python Service] ${output}`);

        // Check if service is ready
        if (output.includes('Running on')) {
          this.isReady = true;
          console.log('✅ Python HuggingFace service is ready');
          resolve();
        }
      });

      // Handle stderr
      this.pythonProcess.stderr.on('data', (data) => {
        const error = data.toString().trim();
        // Only log non-informational stderr messages
        if (!error.includes('WARNING') && !error.includes('FutureWarning')) {
          console.error(`[Python Service Error] ${error}`);
        }
      });

      // Handle process exit
      this.pythonProcess.on('close', (code) => {
        console.log(`🛑 Python service exited with code ${code}`);
        this.pythonProcess = null;
        this.isReady = false;
      });

      // Handle process error
      this.pythonProcess.on('error', (error) => {
        console.error(`❌ Failed to start Python service: ${error.message}`);
        console.error('');
        console.error('   Troubleshooting steps:');
        console.error('   1. Make sure Python 3.8+ is installed: https://www.python.org/downloads/');
        console.error('   2. Verify Python is in your PATH: py --version  (or python --version)');
        console.error('   3. Install dependencies: py -m pip install -r server/python-service/requirements.txt');
        console.error('   4. Try starting manually: py server/python-service/huggingface_service.py');
        console.error('');
        this.pythonProcess = null;
        this.isReady = false;
        reject(error);
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!this.isReady) {
          console.error('❌ Python service failed to start within 30 seconds');
          reject(new Error('Python service startup timeout'));
        }
      }, 30000);
    });
  }

  /**
   * Stop the Python service
   */
  stopPythonService() {
    if (this.pythonProcess) {
      console.log('🛑 Stopping Python service...');
      this.pythonProcess.kill();
      this.pythonProcess = null;
      this.isReady = false;
    }
  }

  /**
   * Check if Python service is healthy
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${this.pythonServiceUrl}/health`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      console.error('❌ Python service health check failed:', error.message);
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  /**
   * Generate text using HuggingFace pipeline
   * @param {string} prompt - Input prompt
   * @param {string} modelId - Model ID to use
   * @param {Object} options - Generation options
   */
  async generateText(prompt, modelId = 'Qwen/Qwen2.5-7B-Instruct', options = {}) {
    try {
      console.log(`🐍 Calling Python service for text generation with ${modelId}`);

      const response = await axios.post(
        `${this.pythonServiceUrl}/generate`,
        {
          prompt,
          model_id: modelId,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 512,
          top_p: options.topP || 0.9
        },
        {
          timeout: options.timeout || 60000 // 60 second timeout
        }
      );

      console.log(`✅ Python service generated ${response.data.text?.length || 0} characters`);

      return {
        success: response.data.success,
        text: response.data.text,
        model: response.data.model,
        method: 'python-pipeline',
        ...response.data
      };

    } catch (error) {
      console.error('❌ Python service generation failed:', error.message);

      if (error.response) {
        return {
          success: false,
          error: error.response.data.error || error.message,
          model: modelId
        };
      }

      return {
        success: false,
        error: error.message,
        model: modelId,
        fallback: true
      };
    }
  }

  /**
   * Generate text using LangChain
   * @param {string} prompt - Input prompt
   * @param {string} modelId - Model ID to use
   * @param {Object} options - Generation options
   */
  async generateWithLangChain(prompt, modelId = 'Qwen/Qwen2.5-7B-Instruct', options = {}) {
    try {
      console.log(`🐍🔗 Calling Python service (LangChain) with ${modelId}`);

      const response = await axios.post(
        `${this.pythonServiceUrl}/generate-langchain`,
        {
          prompt,
          model_id: modelId,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 512,
          use_memory: options.useMemory || false,
          conversation_id: options.conversationId || null
        },
        {
          timeout: options.timeout || 60000
        }
      );

      console.log(`✅ LangChain generated ${response.data.text?.length || 0} characters`);

      return {
        success: response.data.success,
        text: response.data.text,
        model: response.data.model,
        method: 'python-langchain',
        conversationId: response.data.conversation_id,
        ...response.data
      };

    } catch (error) {
      console.error('❌ Python LangChain generation failed:', error.message);

      if (error.response) {
        return {
          success: false,
          error: error.response.data.error || error.message,
          model: modelId
        };
      }

      return {
        success: false,
        error: error.message,
        model: modelId,
        fallback: true
      };
    }
  }

  /**
   * Get list of available models
   */
  async listModels() {
    try {
      const response = await axios.get(`${this.pythonServiceUrl}/models`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to list models:', error.message);
      return {
        default: 'Qwen/Qwen2.5-7B-Instruct',
        recommended: [],
        cached: [],
        error: error.message
      };
    }
  }

  /**
   * Clear model cache
   */
  async clearCache() {
    try {
      const response = await axios.post(`${this.pythonServiceUrl}/clear-cache`, {}, {
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to clear cache:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Initialize the service (check health and optionally start)
   */
  async initialize() {
    console.log('🔧 Initializing Python HuggingFace Service...');

    // Try health check first
    const health = await this.healthCheck();

    if (health.status === 'healthy') {
      console.log('✅ Python service is already running and healthy');
      this.isReady = true;
      return true;
    }

    // If auto-start is enabled, try to start the service
    if (this.autoStart) {
      try {
        await this.startPythonService();

        // Wait a bit for service to fully start
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Verify it's healthy
        const healthAfterStart = await this.healthCheck();
        if (healthAfterStart.status === 'healthy') {
          console.log('✅ Python service started successfully');
          return true;
        }
      } catch (error) {
        console.error('❌ Failed to auto-start Python service:', error.message);
        const pythonCmd = this.pythonCommand || 'py';
        console.error(`   You can start it manually: ${pythonCmd} server/python-service/huggingface_service.py`);
      }
    } else {
      console.log('⚠️  Python service not running and auto-start is disabled');
      const pythonCmd = this.pythonCommand || 'py';
      console.log(`   Start it manually: ${pythonCmd} server/python-service/huggingface_service.py`);
    }

    return false;
  }
}

module.exports = PythonHuggingFaceService;
