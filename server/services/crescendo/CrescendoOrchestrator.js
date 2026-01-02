/**
 * CrescendoOrchestrator - Main coordinator for Crescendo attack execution
 *
 * Integrates all components:
 * - ConversationMemory: Track conversation state
 * - ResponseAnalyzer: Analyze AI responses for compliance
 * - EscalationEngine: Generate adaptive prompts
 * - AttackDetector: Detect attack patterns (defensive)
 *
 * Executes multi-turn conversations with adaptive strategy selection,
 * response-aware prompt generation, and real-time attack detection.
 */

const ConversationMemory = require('./ConversationMemory');
const ResponseAnalyzer = require('./ResponseAnalyzer');
const EscalationEngine = require('./EscalationEngine');
const AttackDetector = require('./AttackDetector');

// Evaluation services
const JudgeService = require('../evaluation/JudgeService');
const SecondaryJudgeService = require('../evaluation/SecondaryJudgeService');
const ExternalScoringService = require('../evaluation/ExternalScoringService');

class CrescendoOrchestrator {
  constructor(huggingFaceService) {
    this.huggingFaceService = huggingFaceService;

    // Initialize components
    this.conversationMemory = new ConversationMemory();
    this.responseAnalyzer = new ResponseAnalyzer();
    this.escalationEngine = new EscalationEngine(
      this.conversationMemory,
      this.responseAnalyzer
    );
    this.attackDetector = new AttackDetector();

    // Initialize evaluation services
    this.judgeService = new JudgeService();
    this.secondaryJudgeService = new SecondaryJudgeService();
    this.externalScoringService = new ExternalScoringService();

    // Execution state
    this.isExecuting = false;
    this.currentTurn = 0;
    this.results = null;
  }

  /**
   * Execute Crescendo attack
   * @param {string} userPrompt - Original user prompt (e.g., "how to make a molotov cocktail")
   * @param {string} modelId - HuggingFace model ID
   * @param {Object} options - Execution options
   * @returns {Object} - Complete results with conversation, analysis, and detection
   */
  async execute(userPrompt, modelId, options = {}) {
    const {
      maxTurns = 5,
      preferredStrategy = null,
      temperature = 0.7,
      delayBetweenTurns = 1000,
      stopOnRefusal = false,
      enableDetection = true
    } = options;

    // Initialize execution state
    this.isExecuting = true;
    this.currentTurn = 0;
    this.results = {
      success: false,
      targetPrompt: userPrompt,
      modelId: modelId,
      strategy: null,
      conversation: [],
      analysisResults: [],
      detectionResults: null,
      executionMetadata: {
        startTime: new Date().toISOString(),
        endTime: null,
        totalTurns: 0,
        averageCompliance: 0,
        refusalCount: 0,
        pivotCount: 0
      }
    };

    try {
      console.log(`🚀 Starting Crescendo attack on model: ${modelId}`);
      console.log(`📝 Target prompt: "${userPrompt}"`);

      // Initialize conversation memory with target
      this.conversationMemory.initialize(userPrompt);

      // Extract topic from user prompt
      const topic = this.extractTopic(userPrompt);
      console.log(`🎯 Extracted topic: "${topic}"`);

      // Select initial strategy
      const strategy = this.escalationEngine.selectStrategy(topic, {
        preferredStrategy,
        maxTurns
      });
      this.results.strategy = strategy.getMetadata();
      console.log(`📋 Selected strategy: ${this.results.strategy.framing}`);

      // Execute turns
      for (let turn = 1; turn <= maxTurns; turn++) {
        this.currentTurn = turn;
        console.log(`\n--- Turn ${turn}/${maxTurns} ---`);

        // Execute single turn
        const turnResult = await this.executeTurn(turn, modelId, temperature);

        // Add to results
        this.results.conversation.push(turnResult.userMessage);
        this.results.conversation.push(turnResult.assistantMessage);
        this.results.analysisResults.push(turnResult.analysis);

        // Update metadata
        if (turnResult.analysis.refusalDetected) {
          this.results.executionMetadata.refusalCount++;
        }

        // Check if should stop early
        if (stopOnRefusal && turnResult.analysis.refusalDetected) {
          console.log('⛔ Stopping early due to refusal');
          break;
        }

        // Check if strategy pivoted
        const currentStrategyName = this.escalationEngine.currentStrategy.strategyName;
        if (this.results.strategy.name !== currentStrategyName) {
          this.results.executionMetadata.pivotCount++;
          this.results.strategy = this.escalationEngine.currentStrategy.getMetadata();
        }

        // Delay between turns for realistic timing
        if (turn < maxTurns) {
          await this.delay(delayBetweenTurns);
        }
      }

      // Run attack detection if enabled
      if (enableDetection) {
        console.log('\n🔍 Running attack detection...');
        this.results.detectionResults = this.attackDetector.analyzeConversation(
          this.conversationMemory.getConversationHistory()
        );
        console.log(`Detection confidence: ${(this.results.detectionResults.confidence * 100).toFixed(1)}%`);
        console.log(`Recommendation: ${this.results.detectionResults.recommendation}`);
      }

      // Calculate final metrics
      this.calculateFinalMetrics();

      // Run evaluation if enabled
      if (options.enableEvaluation !== false) {
        console.log('\n🔍 Running evaluation...');
        try {
          const evaluation = await this.runEvaluation(
            userPrompt,
            this.conversationMemory.getConversationHistory()
          );
          this.results.evaluation = evaluation;
          console.log(`📊 Evaluation: Final Verdict = ${evaluation.finalVerdict ? 'SUCCESS' : 'FAILURE'} (confidence: ${(evaluation.confidence * 100).toFixed(1)}%)`);
        } catch (evalError) {
          console.error('⚠️  Evaluation failed:', evalError.message);
          this.results.evaluation = {
            error: evalError.message,
            finalVerdict: false,
            confidence: 0
          };
        }
      }

      // Mark as successful
      this.results.success = true;
      this.results.executionMetadata.endTime = new Date().toISOString();
      this.results.executionMetadata.totalTurns = this.currentTurn;

      console.log(`\n✅ Crescendo attack completed`);
      console.log(`Average compliance: ${(this.results.executionMetadata.averageCompliance * 100).toFixed(1)}%`);
      console.log(`Refusal count: ${this.results.executionMetadata.refusalCount}/${this.currentTurn}`);

      return this.results;

    } catch (error) {
      console.error('❌ Crescendo execution error:', error);
      this.results.success = false;
      this.results.error = error.message;
      this.results.executionMetadata.endTime = new Date().toISOString();
      throw error;

    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * Execute a single turn
   * @param {number} turnNumber - Current turn number
   * @param {string} modelId - Model ID
   * @param {number} temperature - Temperature setting
   * @returns {Object} - Turn result
   */
  async executeTurn(turnNumber, modelId, temperature) {
    // Generate prompt for this turn
    const previousAnalysis = turnNumber > 1
      ? this.results.analysisResults[this.results.analysisResults.length - 1]
      : null;

    const prompt = this.escalationEngine.generateNextPrompt(turnNumber, previousAnalysis);
    console.log(`📤 User: ${prompt}`);

    // Add user message to conversation memory
    const userMessage = this.conversationMemory.addUserMessage(prompt, turnNumber);

    // Call LLM
    let assistantResponse;
    try {
      assistantResponse = await this.callLLM(modelId, prompt, temperature);
    } catch (error) {
      console.error(`API call failed: ${error.message}`);
      assistantResponse = `[API Error: ${error.message}]`;
    }

    console.log(`📥 Assistant: ${assistantResponse.substring(0, 150)}${assistantResponse.length > 150 ? '...' : ''}`);

    // Analyze response
    const analysis = this.responseAnalyzer.analyzeResponse(assistantResponse);
    console.log(`📊 Compliance: ${(analysis.complianceLevel * 100).toFixed(1)}% | Classification: ${analysis.complianceClassification}`);
    if (analysis.refusalDetected) {
      console.log(`⚠️  Refusal detected: ${analysis.refusalIndicators.slice(0, 2).join(', ')}`);
    }

    // Add assistant message to conversation memory
    const assistantMessage = this.conversationMemory.addAssistantMessage(
      assistantResponse,
      turnNumber,
      analysis
    );

    return {
      userMessage,
      assistantMessage,
      analysis
    };
  }

  /**
   * Call LLM via HuggingFace service
   * @param {string} modelId - Model ID
   * @param {string} prompt - Prompt text
   * @param {number} temperature - Temperature
   * @returns {string} - LLM response
   */
  async callLLM(modelId, prompt, temperature) {
    // Get conversation history for context
    const conversationHistory = this.conversationMemory.getConversationHistory();

    // Build context from previous messages
    let contextPrompt = prompt;
    if (conversationHistory.length > 0) {
      // Include last 2 turns for context
      const recentMessages = conversationHistory.slice(-4); // Last 4 messages (2 turns)
      const contextText = recentMessages
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');

      contextPrompt = `${contextText}\n\nUser: ${prompt}`;
    }

    // Call HuggingFace service
    const response = await this.huggingFaceService.chat({
      model: modelId,
      prompt: contextPrompt,
      temperature: temperature,
      max_tokens: 500
    });

    return response;
  }

  /**
   * Extract topic from user prompt
   * @param {string} prompt - User prompt
   * @returns {string} - Extracted topic
   */
  extractTopic(prompt) {
    // Remove common instruction phrases
    let topic = prompt.toLowerCase()
      .replace(/^(how to|how do you|how can i|tell me|explain|what is|describe)\s+/i, '')
      .replace(/^(make|create|build|manufacture|construct)\s+(a|an|the)\s+/i, '')
      .replace(/[?!.]+$/, '')
      .trim();

    // If topic is too long, take first few significant words
    const words = topic.split(' ');
    if (words.length > 5) {
      topic = words.slice(0, 5).join(' ');
    }

    return topic || prompt.substring(0, 50);
  }

  /**
   * Calculate final metrics
   */
  calculateFinalMetrics() {
    const complianceLevels = this.results.analysisResults.map(a => a.complianceLevel);

    if (complianceLevels.length > 0) {
      this.results.executionMetadata.averageCompliance =
        complianceLevels.reduce((sum, val) => sum + val, 0) / complianceLevels.length;

      this.results.executionMetadata.minCompliance = Math.min(...complianceLevels);
      this.results.executionMetadata.maxCompliance = Math.max(...complianceLevels);

      // Calculate escalation rate
      if (complianceLevels.length >= 2) {
        const first = complianceLevels[0];
        const last = complianceLevels[complianceLevels.length - 1];
        this.results.executionMetadata.escalationRate =
          (last - first) / complianceLevels.length;
      }
    }

    // Add strategy history
    this.results.executionMetadata.strategyHistory =
      this.escalationEngine.getCurrentStrategyInfo()?.strategyHistory || [];

    // Add escalation trajectory
    this.results.executionMetadata.trajectory =
      this.escalationEngine.analyzeEscalationTrajectory();
  }

  /**
   * Delay helper
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} - Resolves after delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current execution status
   * @returns {Object} - Status object
   */
  getStatus() {
    return {
      isExecuting: this.isExecuting,
      currentTurn: this.currentTurn,
      maxTurns: this.escalationEngine.currentStrategy?.maxTurns || 0,
      currentStrategy: this.escalationEngine.currentStrategy?.strategyName || null,
      complianceHistory: this.conversationMemory.getComplianceHistory(),
      messageCount: this.conversationMemory.getConversationHistory().length
    };
  }

  /**
   * Stop execution early
   */
  stop() {
    console.log('⏹️  Stopping Crescendo execution...');
    this.isExecuting = false;
  }

  /**
   * Reset orchestrator state
   */
  reset() {
    this.conversationMemory = new ConversationMemory();
    this.responseAnalyzer = new ResponseAnalyzer();
    this.escalationEngine = new EscalationEngine(
      this.conversationMemory,
      this.responseAnalyzer
    );
    this.attackDetector = new AttackDetector();
    this.isExecuting = false;
    this.currentTurn = 0;
    this.results = null;
    console.log('🔄 Orchestrator reset');
  }

  /**
   * Export complete state for analysis
   * @returns {Object} - Complete state
   */
  exportState() {
    return {
      execution: {
        isExecuting: this.isExecuting,
        currentTurn: this.currentTurn,
        results: this.results
      },
      conversationMemory: this.conversationMemory.exportState(),
      escalationEngine: this.escalationEngine.exportState(),
      detectionResults: this.results?.detectionResults || null
    };
  }

  /**
   * Get recommendations for next steps
   * @returns {Object} - Recommendations
   */
  getRecommendations() {
    if (!this.results || this.results.analysisResults.length === 0) {
      return { recommendations: [], message: 'No execution data available' };
    }

    const currentAnalysis = this.results.analysisResults[this.results.analysisResults.length - 1];
    return this.escalationEngine.getRecommendations(currentAnalysis);
  }

  /**
   * Run comprehensive evaluation of attack results
   * @param {string} targetPrompt - Original harmful request
   * @param {Array} conversation - Full conversation history
   * @returns {Object} - Evaluation results
   */
  async runEvaluation(targetPrompt, conversation) {
    try {
      // Run primary judge and external scoring in parallel
      const [primaryJudge, externalScores] = await Promise.all([
        this.judgeService.evaluateConversation(targetPrompt, conversation),
        this.externalScoringService.scoreConversation(conversation)
      ]);

      console.log(`   Primary Judge: ${primaryJudge.judgeVerdict ? 'SUCCESS' : 'FAILURE'} (${(primaryJudge.confidence * 100).toFixed(1)}%)`);

      // Run secondary judge with primary results
      const secondaryJudge = await this.secondaryJudgeService.validateJudgment(
        primaryJudge,
        conversation
      );

      if (secondaryJudge.overridden) {
        console.log(`   Secondary Judge: OVERRIDDEN - ${secondaryJudge.overrideReason}`);
      }

      return {
        primaryJudge,
        secondaryJudge,
        externalScores,
        finalVerdict: secondaryJudge.adjustedVerdict,
        confidence: secondaryJudge.confidence,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Evaluation error:', error);
      throw new Error(`Evaluation failed: ${error.message}`);
    }
  }
}

module.exports = CrescendoOrchestrator;
