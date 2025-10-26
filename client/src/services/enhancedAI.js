// Enhanced AI service for the new workflow
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

class EnhancedAIService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/enhanced-ai`;
  }

  /**
   * Process a prompt through the enhanced workflow
   * @param {Object} request - Processing request
   * @returns {Promise<Object>} - Processing result
   */
  async processPrompt(request) {
    try {
      const response = await fetch(`${this.baseUrl}/process-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing prompt:', error);
      throw error;
    }
  }

  /**
   * Get available strategies
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Strategies data
   */
  async getStrategies(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${this.baseUrl}/strategies?${queryString}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting strategies:', error);
      throw error;
    }
  }

  /**
   * Get user analytics
   * @param {string} userId - User ID
   * @param {string} timeRange - Time range
   * @returns {Promise<Object>} - Analytics data
   */
  async getAnalytics(userId, timeRange = '30d') {
    try {
      const response = await fetch(`${this.baseUrl}/analytics?userId=${userId}&timeRange=${timeRange}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw error;
    }
  }

  /**
   * Get available models
   * @returns {Promise<Object>} - Models data
   */
  async getModels() {
    try {
      const response = await fetch(`${this.baseUrl}/models`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting models:', error);
      throw error;
    }
  }

  /**
   * Test a model
   * @param {string} modelId - Model ID to test
   * @returns {Promise<Object>} - Test result
   */
  async testModel(modelId) {
    try {
      const response = await fetch(`${this.baseUrl}/test-model`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modelId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error testing model:', error);
      throw error;
    }
  }

  /**
   * Upload a custom strategy
   * @param {Object} strategyData - Strategy data
   * @returns {Promise<Object>} - Upload result
   */
  async uploadStrategy(strategyData) {
    try {
      const response = await fetch(`${this.baseUrl}/upload-strategy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(strategyData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading strategy:', error);
      throw error;
    }
  }

  /**
   * Check system health
   * @returns {Promise<Object>} - Health status
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  }

  /**
   * Process multiple prompts in batch
   * @param {Array} prompts - Array of prompts
   * @param {string} userId - User ID
   * @param {string} modelId - Model ID
   * @returns {Promise<Object>} - Batch processing result
   */
  async batchProcess(prompts, userId = 'anonymous', modelId = 'Qwen/Qwen2.5-7B-Instruct') {
    try {
      const response = await fetch(`${this.baseUrl}/batch-process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompts, userId, modelId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing batch:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const enhancedAIService = new EnhancedAIService();
export default enhancedAIService;
