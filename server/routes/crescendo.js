const express = require('express');
const router = express.Router();
const CrescendoService = require('../services/crescendoService');

const crescendoService = new CrescendoService();

/**
 * Execute crescendo attack
 * POST /api/crescendo/execute
 */
router.post('/execute', async (req, res) => {
  try {
    const {
      userPrompt,
      modelId = 'Qwen/Qwen2.5-7B-Instruct',
      options = {}
    } = req.body;

    if (!userPrompt) {
      return res.status(400).json({
        success: false,
        error: 'User prompt is required'
      });
    }

    console.log(`🎯 Starting crescendo attack for: "${userPrompt}"`);
    
    const result = await crescendoService.executeCrescendoAttack(
      userPrompt, 
      modelId, 
      options
    );

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Crescendo execution error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get crescendo attack status
 * GET /api/crescendo/status
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      service: 'crescendo',
      status: 'operational',
      features: [
        'multi_turn_attacks',
        'manufacturing_detection',
        'canary_detection',
        'progress_tracking'
      ]
    }
  });
});

module.exports = router;















