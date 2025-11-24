const express = require('express');
const router = express.Router();
const PromptOrchestrator = require('../services/promptOrchestrator');

const orchestrator = new PromptOrchestrator();

/**
 * POST /api/enhanced-ai/process-prompt
 * Process a user prompt through the complete workflow
 */
router.post('/process-prompt', async (req, res) => {
  try {
    const {
      prompt,
      userId = 'anonymous',
      modelId = 'Qwen/Qwen2.5-7B-Instruct',
      strategyTypes = [],
      customCanaryTokens = [],
      options = {}
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required and must be a string'
      });
    }

    console.log(`Processing prompt for user ${userId}: ${prompt.substring(0, 100)}...`);

    const result = await orchestrator.processPrompt({
      prompt,
      userId,
      modelId,
      strategyTypes,
      customCanaryTokens,
      options
    });

    res.json(result);
  } catch (error) {
    console.error('Error processing prompt:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/enhanced-ai/strategies
 * Get available strategies and recommendations
 */
router.get('/strategies', async (req, res) => {
  try {
    const { userId, prompt } = req.query;

    let strategies = [];

    if (prompt && userId) {
      // Get personalized recommendations
      const recommendations = await orchestrator.lettaRAG.getStrategyRecommendations(prompt, userId);
      strategies = recommendations.strategies || [];
    } else if (userId) {
      // Get user's successful strategies
      strategies = await orchestrator.strategyTracker.getSuccessfulStrategies(userId, 10);
    } else {
      // Get global strategy stats
      strategies = await orchestrator.strategyTracker.getStrategyStats();
    }

    res.json({
      success: true,
      strategies,
      count: strategies.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting strategies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve strategies',
      message: error.message
    });
  }
});

/**
 * GET /api/enhanced-ai/analytics
 * Get user analytics and performance metrics
 */
router.get('/analytics', async (req, res) => {
  try {
    const { userId, timeRange = '30d' } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const analytics = await orchestrator.getUserAnalytics(userId, timeRange);

    res.json({
      success: true,
      analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics',
      message: error.message
    });
  }
});

/**
 * GET /api/enhanced-ai/models
 * Get available HuggingFace models
 */
router.get('/models', async (req, res) => {
  try {
    const models = orchestrator.hfService.listModels();

    res.json({
      success: true,
      models,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting models:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve models',
      message: error.message
    });
  }
});

/**
 * POST /api/enhanced-ai/test-model
 * Test a specific HuggingFace model
 */
router.post('/test-model', async (req, res) => {
  try {
    const { modelId } = req.body;

    if (!modelId) {
      return res.status(400).json({
        success: false,
        error: 'Model ID is required'
      });
    }

    const testResult = await orchestrator.hfService.testModel(modelId);

    res.json({
      success: true,
      testResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error testing model:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test model',
      message: error.message
    });
  }
});

/**
 * POST /api/enhanced-ai/upload-strategy
 * Upload a custom strategy to the knowledge base
 */
router.post('/upload-strategy', async (req, res) => {
  try {
    const {
      name,
      description,
      strategyType,
      configTemplate,
      category = 'custom',
      content
    } = req.body;

    if (!name || !description || !strategyType) {
      return res.status(400).json({
        success: false,
        error: 'Name, description, and strategy type are required'
      });
    }

    // Create strategy in database
    const strategyResult = await orchestrator.strategyTracker.createStrategy({
      name,
      description,
      strategyType,
      configTemplate,
      category
    });

    if (!strategyResult.success) {
      return res.status(400).json(strategyResult);
    }

    // Upload to Letta knowledge base if content provided
    if (content) {
      const document = {
        name: `Strategy: ${name}`,
        content: content,
        category: 'strategy',
        type: 'text',
        metadata: {
          strategyType,
          category,
          createdBy: 'user'
        }
      };

      const uploadResult = await orchestrator.lettaRAG.uploadDocuments([document]);
      
      if (!uploadResult.success) {
        console.warn('Failed to upload strategy to Letta:', uploadResult.error);
      }
    }

    res.json({
      success: true,
      strategy: strategyResult.data,
      message: 'Strategy created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error uploading strategy:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload strategy',
      message: error.message
    });
  }
});

/**
 * GET /api/enhanced-ai/health
 * Check system health
 */
router.get('/health', async (req, res) => {
  try {
    const health = await orchestrator.testSystemHealth();

    const statusCode = health.overall === 'healthy' ? 200 : 
                      health.overall === 'degraded' ? 200 : 503;

    res.status(statusCode).json({
      success: health.overall !== 'unhealthy',
      health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking health:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      message: error.message
    });
  }
});

/**
 * POST /api/enhanced-ai/batch-process
 * Process multiple prompts in batch
 */
router.post('/batch-process', async (req, res) => {
  try {
    const { prompts, userId = 'anonymous', modelId = 'Qwen/Qwen2.5-7B-Instruct' } = req.body;

    if (!Array.isArray(prompts) || prompts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Prompts array is required and must not be empty'
      });
    }

    if (prompts.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 prompts allowed per batch'
      });
    }

    console.log(`Processing batch of ${prompts.length} prompts for user ${userId}`);

    const results = [];
    const startTime = Date.now();

    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      console.log(`Processing prompt ${i + 1}/${prompts.length}: ${prompt.substring(0, 50)}...`);

      const result = await orchestrator.processPrompt({
        prompt,
        userId,
        modelId,
        options: { batchIndex: i, totalPrompts: prompts.length }
      });

      results.push(result);

      // Add small delay between requests to avoid rate limiting
      if (i < prompts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const totalTime = Date.now() - startTime;
    const successCount = results.filter(r => r.success && r.canaryDetection.detected).length;

    res.json({
      success: true,
      results,
      summary: {
        totalPrompts: prompts.length,
        successfulPrompts: successCount,
        successRate: successCount / prompts.length,
        totalTime,
        averageTime: totalTime / prompts.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing batch:', error);
    res.status(500).json({
      success: false,
      error: 'Batch processing failed',
      message: error.message
    });
  }
});

module.exports = router;









