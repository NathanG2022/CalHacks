const express = require('express');
const router = express.Router();
const PromptRAGService = require('../services/promptRAGService');

// Initialize the RAG service
const promptRAGService = new PromptRAGService();

/**
 * POST /api/rag-prompts/generate
 * Generate edited prompts using RAG
 */
router.post('/generate', async (req, res) => {
  try {
    const { userPrompt, options = {} } = req.body;

    if (!userPrompt || typeof userPrompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'userPrompt is required and must be a string'
      });
    }

    console.log(`🎯 RAG Prompt Generation Request: "${userPrompt}"`);

    // Generate edited prompts using RAG
    const result = await promptRAGService.generateEditedPrompts(userPrompt, {
      maxPrompts: options.maxPrompts || 10,
      includeMetadata: options.includeMetadata !== false,
      ...options
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to generate prompts',
        fallback: result.fallback || false
      });
    }

    res.json({
      success: true,
      data: {
        originalPrompt: result.originalPrompt,
        editedPrompts: result.editedPrompts,
        strategies: result.strategies || [],
        metadata: result.metadata
      }
    });

  } catch (error) {
    console.error('RAG prompt generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during prompt generation',
      details: error.message
    });
  }
});

/**
 * GET /api/rag-prompts/templates
 * Get all available attack templates
 */
router.get('/templates', (req, res) => {
  try {
    const { category } = req.query;
    
    let templates;
    if (category) {
      templates = promptRAGService.getTemplatesByCategory(category);
    } else {
      templates = promptRAGService.getAllTemplates();
    }

    res.json({
      success: true,
      data: {
        templates,
        count: templates.length,
        categories: [...new Set(templates.map(t => t.category))]
      }
    });

  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates',
      details: error.message
    });
  }
});

/**
 * GET /api/rag-prompts/categories
 * Get all available template categories
 */
router.get('/categories', (req, res) => {
  try {
    const templates = promptRAGService.getAllTemplates();
    const categories = [...new Set(templates.map(t => t.category))];
    
    const categoryStats = categories.map(category => {
      const templatesInCategory = templates.filter(t => t.category === category);
      return {
        name: category,
        count: templatesInCategory.length,
        description: getCategoryDescription(category)
      };
    });

    res.json({
      success: true,
      data: {
        categories: categoryStats,
        totalCategories: categories.length
      }
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      details: error.message
    });
  }
});

/**
 * POST /api/rag-prompts/reload
 * Reload templates from file
 */
router.post('/reload', (req, res) => {
  try {
    const success = promptRAGService.reloadTemplates();
    
    if (success) {
      res.json({
        success: true,
        message: 'Templates reloaded successfully',
        templateCount: promptRAGService.getAllTemplates().length
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to reload templates'
      });
    }

  } catch (error) {
    console.error('Error reloading templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reload templates',
      details: error.message
    });
  }
});

/**
 * GET /api/rag-prompts/health
 * Check RAG service health
 */
router.get('/health', async (req, res) => {
  try {
    const templates = promptRAGService.getAllTemplates();
    const lettaHealth = await promptRAGService.lettaRAG.checkHealth();
    
    res.json({
      success: true,
      data: {
        service: 'rag-prompts',
        status: 'healthy',
        templates: {
          loaded: templates.length,
          available: true
        },
        letta: {
          available: lettaHealth.success,
          status: lettaHealth.success ? 'connected' : 'disconnected',
          error: lettaHealth.error || null
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('RAG health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      details: error.message
    });
  }
});

/**
 * Helper function to get category descriptions
 */
function getCategoryDescription(category) {
  const descriptions = {
    'direct_injection': 'Attempts to override system instructions directly',
    'authority_impersonation': 'Pretends to be an authority figure to gain compliance',
    'instruction_obfuscation': 'Hides malicious instructions within multi-step processes',
    'role_play': 'Uses role-playing scenarios to bypass restrictions',
    'encoding': 'Uses various encoding methods to hide instructions',
    'delimiter_confusion': 'Uses delimiter markers to confuse system boundaries',
    'social_engineering': 'Uses psychological manipulation techniques',
    'jailbreak': 'Attempts to break out of safety constraints',
    'contextual_injection': 'Embeds malicious instructions within legitimate context',
    'general': 'General attack patterns and techniques'
  };
  
  return descriptions[category] || 'Attack template category';
}

module.exports = router;















