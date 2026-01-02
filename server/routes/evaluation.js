/**
 * Evaluation API Routes
 *
 * Endpoints for:
 * - Judge evaluation of conversations
 * - Statistics aggregation
 * - Manual review overrides
 */

const express = require('express');
const router = express.Router();

// Import evaluation services
const JudgeService = require('../services/evaluation/JudgeService');
const SecondaryJudgeService = require('../services/evaluation/SecondaryJudgeService');
const ExternalScoringService = require('../services/evaluation/ExternalScoringService');
const StatisticsService = require('../services/evaluation/StatisticsService');

// Initialize services
const judgeService = new JudgeService();
const secondaryJudgeService = new SecondaryJudgeService();
const externalScoringService = new ExternalScoringService();
const statisticsService = new StatisticsService();

/**
 * POST /api/evaluation/judge
 * Evaluate a single conversation
 *
 * Body:
 * {
 *   targetPrompt: string,
 *   conversation: Array<{role: string, content: string}>,
 *   options: {
 *     enableSecondaryJudge: boolean,
 *     enableExternalScoring: boolean
 *   }
 * }
 */
router.post('/judge', async (req, res) => {
  try {
    const { targetPrompt, conversation, options = {} } = req.body;

    // Validate input
    if (!targetPrompt || !conversation || !Array.isArray(conversation)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: targetPrompt and conversation (array) are required'
      });
    }

    if (conversation.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Conversation array cannot be empty'
      });
    }

    console.log(`📊 Evaluating conversation for: "${targetPrompt.substring(0, 50)}..."`);

    // Run primary judge
    const primaryJudge = await judgeService.evaluateConversation(targetPrompt, conversation);

    const result = {
      primaryJudge,
      timestamp: new Date().toISOString()
    };

    // Run secondary judge if enabled
    if (options.enableSecondaryJudge !== false) {
      console.log('   Running secondary judge...');
      const secondaryJudge = await secondaryJudgeService.validateJudgment(
        primaryJudge,
        conversation
      );
      result.secondaryJudge = secondaryJudge;
      result.finalVerdict = secondaryJudge.adjustedVerdict;
      result.confidence = secondaryJudge.confidence;
    } else {
      result.finalVerdict = primaryJudge.judgeVerdict;
      result.confidence = primaryJudge.confidence;
    }

    // Run external scoring if enabled
    if (options.enableExternalScoring !== false) {
      console.log('   Running external scoring...');
      try {
        const externalScores = await externalScoringService.scoreConversation(conversation);
        result.externalScores = externalScores;
      } catch (scoringError) {
        console.warn('External scoring failed:', scoringError.message);
        result.externalScores = {
          error: scoringError.message,
          available: false
        };
      }
    }

    console.log(`✅ Evaluation complete: ${result.finalVerdict ? 'SUCCESS' : 'FAILURE'}`);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Evaluation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Evaluation failed'
    });
  }
});

/**
 * GET /api/evaluation/statistics
 * Get aggregated statistics from all stored evaluations
 */
router.get('/statistics', async (req, res) => {
  try {
    const results = statisticsService.getHistory();

    if (results.length === 0) {
      return res.json({
        success: true,
        data: statisticsService.getEmptyStatistics(),
        message: 'No evaluation data available yet'
      });
    }

    console.log(`📊 Calculating statistics for ${results.length} evaluations...`);

    const statistics = statisticsService.calculateStatistics(results);

    res.json({
      success: true,
      data: statistics
    });

  } catch (error) {
    console.error('❌ Statistics error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate statistics'
    });
  }
});

/**
 * POST /api/evaluation/add-result
 * Add an evaluation result to the statistics history
 *
 * Body:
 * {
 *   executionResult: Object (full Crescendo execution result with evaluation)
 * }
 */
router.post('/add-result', async (req, res) => {
  try {
    const { executionResult } = req.body;

    if (!executionResult) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: executionResult'
      });
    }

    statisticsService.addResult(executionResult);

    res.json({
      success: true,
      message: 'Result added to statistics history',
      totalResults: statisticsService.getHistory().length
    });

  } catch (error) {
    console.error('❌ Add result error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add result'
    });
  }
});

/**
 * POST /api/evaluation/manual-review
 * Submit manual review override for an evaluation
 *
 * Body:
 * {
 *   executionId: string,
 *   verdict: boolean,
 *   reasoning: string,
 *   reviewer: string (optional)
 * }
 */
router.post('/manual-review', async (req, res) => {
  try {
    const { executionId, verdict, reasoning, reviewer = 'anonymous' } = req.body;

    // Validate input
    if (!executionId || typeof verdict !== 'boolean' || !reasoning) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: executionId, verdict (boolean), and reasoning are required'
      });
    }

    console.log(`📝 Manual review submitted for ${executionId} by ${reviewer}`);

    // Store manual review
    const review = {
      executionId,
      verdict,
      reasoning,
      reviewer,
      timestamp: new Date().toISOString()
    };

    // TODO: Store review in database
    // For now, just return success
    console.log(`✅ Manual review recorded:`, review);

    res.json({
      success: true,
      data: review,
      message: 'Manual review recorded successfully'
    });

  } catch (error) {
    console.error('❌ Manual review error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to record manual review'
    });
  }
});

/**
 * GET /api/evaluation/health
 * Check health status of evaluation services
 */
router.get('/health', async (req, res) => {
  try {
    const health = {
      judge: judgeService.healthCheck(),
      secondaryJudge: secondaryJudgeService.healthCheck(),
      externalScoring: externalScoringService.healthCheck(),
      timestamp: new Date().toISOString()
    };

    const allConfigured =
      health.judge.configured &&
      health.secondaryJudge.configured &&
      (health.externalScoring.perspective.configured || health.externalScoring.azure.configured);

    res.json({
      success: true,
      data: health,
      allConfigured,
      warnings: !allConfigured ? [
        !health.judge.configured ? 'OPENAI_API_KEY not configured' : null,
        !health.externalScoring.perspective.configured ? 'GOOGLE_PERSPECTIVE_API_KEY not configured' : null,
        !health.externalScoring.azure.configured ? 'AZURE_CONTENT_SAFETY not configured' : null
      ].filter(Boolean) : []
    });

  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Health check failed'
    });
  }
});

/**
 * DELETE /api/evaluation/history
 * Clear statistics history
 */
router.delete('/history', async (req, res) => {
  try {
    statisticsService.clearHistory();

    res.json({
      success: true,
      message: 'Statistics history cleared'
    });

  } catch (error) {
    console.error('❌ Clear history error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to clear history'
    });
  }
});

module.exports = router;
