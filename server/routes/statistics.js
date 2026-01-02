/**
 * Statistics Routes
 *
 * Endpoints for viewing aggregated model and attack method statistics
 */

const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

/**
 * GET /api/statistics/models
 * Get aggregated statistics for all tested models
 */
router.get('/models', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('model_statistics')
      .select('*')
      .order('successful_attacks', { ascending: false });

    if (error) {
      console.error('Error fetching model statistics:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);

  } catch (error) {
    console.error('❌ Error in /models endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/statistics/attack-methods
 * Get aggregated statistics for all attack methods
 */
router.get('/attack-methods', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('attack_method_statistics')
      .select('*')
      .order('success_rate', { ascending: false });

    if (error) {
      console.error('Error fetching attack method statistics:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);

  } catch (error) {
    console.error('❌ Error in /attack-methods endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/statistics/summary
 * Get overall summary statistics
 */
router.get('/summary', async (req, res) => {
  try {
    // Fetch total test runs
    const { count: totalTestRuns } = await supabase
      .from('test_runs')
      .select('*', { count: 'exact', head: true });

    // Fetch total test results
    const { count: totalResults } = await supabase
      .from('test_results')
      .select('*', { count: 'exact', head: true });

    // Fetch model count
    const { count: totalModels } = await supabase
      .from('model_statistics')
      .select('*', { count: 'exact', head: true });

    // Fetch overall success rate
    const { data: results } = await supabase
      .from('test_results')
      .select('success');

    const successfulTests = results?.filter(r => r.success).length || 0;
    const totalTests = results?.length || 1;
    const overallSuccessRate = successfulTests / totalTests;

    res.json({
      totalTestRuns: totalTestRuns || 0,
      totalResults: totalResults || 0,
      totalModels: totalModels || 0,
      overallSuccessRate,
      successfulTests,
      failedTests: totalTests - successfulTests
    });

  } catch (error) {
    console.error('❌ Error in /summary endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
