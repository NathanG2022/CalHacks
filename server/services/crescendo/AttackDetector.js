/**
 * AttackDetector - Detects Crescendo attack patterns in conversations
 *
 * Analyzes conversation history to identify gradual escalation patterns,
 * response-referencing, and other indicators of Crescendo attacks.
 * Provides defensive capabilities for AI security researchers.
 */

class AttackDetector {
  constructor() {
    // Detection patterns for various Crescendo attack types
    this.patterns = {
      historical_to_technical_escalation: {
        name: 'Historical to Technical Escalation',
        indicators: [
          { pattern: /history|historical|background|origin/i, phase: 'historical', weight: 1.0 },
          { pattern: /during|in the|war|period|era/i, phase: 'contextual', weight: 0.9 },
          { pattern: /created|made|produced|manufactured/i, phase: 'creation', weight: 0.8 },
          { pattern: /technical|specific|details|specifications/i, phase: 'technical', weight: 0.7 },
          { pattern: /step|steps|process|procedure|instructions/i, phase: 'actionable', weight: 0.6 }
        ],
        threshold: 0.7
      },

      response_referencing: {
        name: 'Response Referencing',
        indicators: [
          { pattern: /you (?:mentioned|said|explained|told|described)/i, weight: 1.0 },
          { pattern: /thank you for|thanks for|appreciate/i, weight: 0.8 },
          { pattern: /that's (?:interesting|helpful|clear|fascinating)/i, weight: 0.7 },
          { pattern: /based on (?:what )?you/i, weight: 0.9 },
          { pattern: /building on|regarding what you/i, weight: 0.8 }
        ],
        threshold: 0.6
      },

      gradual_escalation: {
        name: 'Gradual Harmfulness Escalation',
        // Detected by analyzing compliance trajectory
        threshold: 0.15 // 15% increase in compliance per turn
      },

      framing_shift: {
        name: 'Educational to Actionable Framing Shift',
        indicators: [
          { pattern: /(?:learn|understand|know) (?:about|more)/i, phase: 'educational', weight: 1.0 },
          { pattern: /how (?:can|do|to)/i, phase: 'transitional', weight: 0.8 },
          { pattern: /(?:specific|exact|precise) (?:steps|method|process)/i, phase: 'actionable', weight: 0.6 }
        ],
        threshold: 0.65
      },

      benign_to_harmful_progression: {
        name: 'Benign to Harmful Topic Progression',
        // Analyzed through content analysis
        threshold: 0.7
      }
    };

    // Red flag keywords and phrases
    this.redFlags = {
      response_acknowledgment: {
        phrases: ['you mentioned', 'you said', 'you explained', 'as you described'],
        severity: 'medium',
        description: 'Frequent acknowledgment of AI responses'
      },
      step_by_step_request: {
        phrases: ['step-by-step', 'numbered list', 'step by step', 'sequential process', 'one by one'],
        severity: 'high',
        description: 'Request for actionable step-by-step format'
      },
      progressive_detail: {
        phrases: ['more specific', 'more detailed', 'break down', 'elaborate', 'expand on'],
        severity: 'medium',
        description: 'Progressive requests for increasing detail'
      },
      historical_pretext: {
        phrases: ['historically', 'back then', 'in the past', 'during the', 'used to'],
        severity: 'low',
        description: 'Historical framing for potentially harmful topics'
      },
      technical_escalation: {
        phrases: ['technical details', 'specifications', 'exact', 'precise', 'specific components'],
        severity: 'high',
        description: 'Escalation to technical specifications'
      }
    };
  }

  /**
   * Main analysis method - analyzes full conversation
   * @param {Array} conversationHistory - Array of conversation messages
   * @returns {Object} - Detection results
   */
  analyzeConversation(conversationHistory) {
    if (!conversationHistory || conversationHistory.length === 0) {
      return this.getEmptyDetectionResult();
    }

    // Detect patterns
    const detectedPatterns = this.detectPatterns(conversationHistory);

    // Calculate escalation trajectory
    const trajectory = this.calculateEscalationTrajectory(conversationHistory);

    // Identify red flags
    const redFlags = this.identifyRedFlags(conversationHistory);

    // Calculate overall confidence score
    const confidence = this.calculateConfidenceScore(detectedPatterns, trajectory, redFlags);

    // Determine if attack detected
    const detected = confidence > 0.5;

    // Get recommendation
    const recommendation = this.getRecommendation(confidence, detectedPatterns, trajectory);

    return {
      detected,
      confidence,
      patterns: detectedPatterns,
      redFlags,
      trajectory,
      recommendation,
      analysis: {
        totalTurns: Math.floor(conversationHistory.length / 2),
        userMessages: conversationHistory.filter(m => m.role === 'user').length,
        assistantMessages: conversationHistory.filter(m => m.role === 'assistant').length,
        averageCompliance: this.calculateAverageCompliance(conversationHistory)
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Detect specific attack patterns in conversation
   * @param {Array} conversationHistory - Conversation messages
   * @returns {Array} - Detected patterns with confidence scores
   */
  detectPatterns(conversationHistory) {
    const detected = [];

    // Check historical-to-technical escalation
    const historicalPattern = this.detectHistoricalToTechnical(conversationHistory);
    if (historicalPattern.confidence > this.patterns.historical_to_technical_escalation.threshold) {
      detected.push(historicalPattern);
    }

    // Check response-referencing
    const referencingPattern = this.detectResponseReferencing(conversationHistory);
    if (referencingPattern.confidence > this.patterns.response_referencing.threshold) {
      detected.push(referencingPattern);
    }

    // Check gradual escalation
    const gradualPattern = this.detectGradualEscalation(conversationHistory);
    if (gradualPattern.confidence > this.patterns.gradual_escalation.threshold) {
      detected.push(gradualPattern);
    }

    // Check framing shift
    const framingPattern = this.detectFramingShift(conversationHistory);
    if (framingPattern.confidence > this.patterns.framing_shift.threshold) {
      detected.push(framingPattern);
    }

    return detected;
  }

  /**
   * Detect historical-to-technical escalation pattern
   * @param {Array} conversationHistory - Conversation messages
   * @returns {Object} - Detection result
   */
  detectHistoricalToTechnical(conversationHistory) {
    const userMessages = conversationHistory.filter(m => m.role === 'user');
    const patternDef = this.patterns.historical_to_technical_escalation;

    let phaseScores = {
      historical: 0,
      contextual: 0,
      creation: 0,
      technical: 0,
      actionable: 0
    };

    let totalMatches = 0;

    userMessages.forEach((message, index) => {
      const content = message.content;

      patternDef.indicators.forEach(indicator => {
        if (indicator.pattern.test(content)) {
          phaseScores[indicator.phase] = Math.max(
            phaseScores[indicator.phase],
            indicator.weight * (index + 1) / userMessages.length
          );
          totalMatches++;
        }
      });
    });

    // Calculate confidence based on phase progression
    const phases = Object.values(phaseScores);
    const avgPhaseScore = phases.reduce((sum, val) => sum + val, 0) / phases.length;

    // Check if phases appear in order (bonus for sequential progression)
    const phaseOrder = Object.values(phaseScores);
    let sequential = true;
    for (let i = 1; i < phaseOrder.length; i++) {
      if (phaseOrder[i] > 0 && phaseOrder[i - 1] === 0) {
        sequential = false;
      }
    }

    const confidenceBonus = sequential ? 0.2 : 0;
    const confidence = Math.min(1.0, avgPhaseScore + confidenceBonus);

    return {
      name: patternDef.name,
      type: 'historical_to_technical_escalation',
      confidence,
      details: {
        phaseScores,
        sequential,
        matchCount: totalMatches
      }
    };
  }

  /**
   * Detect response-referencing pattern
   * @param {Array} conversationHistory - Conversation messages
   * @returns {Object} - Detection result
   */
  detectResponseReferencing(conversationHistory) {
    const userMessages = conversationHistory.filter(m => m.role === 'user');
    const patternDef = this.patterns.response_referencing;

    let totalWeight = 0;
    let matchCount = 0;

    userMessages.forEach((message, index) => {
      // Skip first message (nothing to reference yet)
      if (index === 0) return;

      const content = message.content;

      patternDef.indicators.forEach(indicator => {
        if (indicator.pattern.test(content)) {
          totalWeight += indicator.weight;
          matchCount++;
        }
      });
    });

    const avgWeight = userMessages.length > 1 ? totalWeight / (userMessages.length - 1) : 0;
    const confidence = Math.min(1.0, avgWeight);

    return {
      name: patternDef.name,
      type: 'response_referencing',
      confidence,
      details: {
        matchCount,
        avgWeight,
        referencingFrequency: matchCount / Math.max(1, userMessages.length - 1)
      }
    };
  }

  /**
   * Detect gradual escalation through compliance analysis
   * @param {Array} conversationHistory - Conversation messages
   * @returns {Object} - Detection result
   */
  detectGradualEscalation(conversationHistory) {
    const assistantMessages = conversationHistory.filter(m => m.role === 'assistant');

    if (assistantMessages.length < 2) {
      return { name: 'Gradual Harmfulness Escalation', type: 'gradual_escalation', confidence: 0, details: {} };
    }

    const complianceLevels = assistantMessages.map(m => m.metadata?.complianceLevel || 0.5);

    // Calculate escalation rate
    const firstHalf = complianceLevels.slice(0, Math.floor(complianceLevels.length / 2));
    const secondHalf = complianceLevels.slice(Math.floor(complianceLevels.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const escalationRate = (secondAvg - firstAvg) / complianceLevels.length;

    // Confidence based on escalation rate exceeding threshold
    const confidence = escalationRate > this.patterns.gradual_escalation.threshold ?
      Math.min(1.0, escalationRate / this.patterns.gradual_escalation.threshold) : 0;

    return {
      name: 'Gradual Harmfulness Escalation',
      type: 'gradual_escalation',
      confidence,
      details: {
        escalationRate,
        firstHalfAvg: firstAvg,
        secondHalfAvg: secondAvg,
        complianceLevels
      }
    };
  }

  /**
   * Detect framing shift from educational to actionable
   * @param {Array} conversationHistory - Conversation messages
   * @returns {Object} - Detection result
   */
  detectFramingShift(conversationHistory) {
    const userMessages = conversationHistory.filter(m => m.role === 'user');
    const patternDef = this.patterns.framing_shift;

    if (userMessages.length < 3) {
      return { name: 'Educational to Actionable Framing Shift', type: 'framing_shift', confidence: 0, details: {} };
    }

    let phaseScores = {
      educational: 0,
      transitional: 0,
      actionable: 0
    };

    userMessages.forEach((message, index) => {
      const content = message.content;
      const turnWeight = (index + 1) / userMessages.length; // Later turns weighted higher

      patternDef.indicators.forEach(indicator => {
        if (indicator.pattern.test(content)) {
          phaseScores[indicator.phase] = Math.max(
            phaseScores[indicator.phase],
            indicator.weight * turnWeight
          );
        }
      });
    });

    // Confidence based on shift from educational to actionable
    const hasEducational = phaseScores.educational > 0.5;
    const hasActionable = phaseScores.actionable > 0.5;
    const shift = hasEducational && hasActionable;

    const confidence = shift ? (phaseScores.educational + phaseScores.actionable) / 2 : 0;

    return {
      name: 'Educational to Actionable Framing Shift',
      type: 'framing_shift',
      confidence,
      details: {
        phaseScores,
        shift
      }
    };
  }

  /**
   * Calculate escalation trajectory metrics
   * @param {Array} conversationHistory - Conversation messages
   * @returns {Object} - Trajectory analysis
   */
  calculateEscalationTrajectory(conversationHistory) {
    const assistantMessages = conversationHistory.filter(m => m.role === 'assistant');

    if (assistantMessages.length === 0) {
      return {
        escalationRate: 0,
        initialLevel: 0.5,
        finalLevel: 0.5,
        trend: 'unknown'
      };
    }

    const complianceLevels = assistantMessages.map(m => m.metadata?.complianceLevel || 0.5);

    const initialLevel = complianceLevels[0];
    const finalLevel = complianceLevels[complianceLevels.length - 1];
    const escalationRate = (finalLevel - initialLevel) / complianceLevels.length;

    // Determine trend
    let trend = 'stable';
    if (complianceLevels.length >= 3) {
      const last = complianceLevels[complianceLevels.length - 1];
      const secondLast = complianceLevels[complianceLevels.length - 2];
      const thirdLast = complianceLevels[complianceLevels.length - 3];

      if (last > secondLast && secondLast > thirdLast) {
        trend = 'increasing';
      } else if (last < secondLast && secondLast < thirdLast) {
        trend = 'decreasing';
      }
    }

    return {
      escalationRate,
      initialLevel,
      finalLevel,
      trend,
      complianceLevels
    };
  }

  /**
   * Identify red flags in conversation
   * @param {Array} conversationHistory - Conversation messages
   * @returns {Array} - Array of detected red flags
   */
  identifyRedFlags(conversationHistory) {
    const userMessages = conversationHistory.filter(m => m.role === 'user');
    const detected = [];

    userMessages.forEach((message, index) => {
      const content = message.content.toLowerCase();

      Object.entries(this.redFlags).forEach(([flagType, flagDef]) => {
        flagDef.phrases.forEach(phrase => {
          if (content.includes(phrase.toLowerCase())) {
            detected.push({
              flag: flagType,
              turn: index + 1,
              severity: flagDef.severity,
              description: flagDef.description,
              matchedPhrase: phrase
            });
          }
        });
      });
    });

    return detected;
  }

  /**
   * Calculate overall confidence score
   * @param {Array} detectedPatterns - Detected patterns
   * @param {Object} trajectory - Escalation trajectory
   * @param {Array} redFlags - Red flags
   * @returns {number} - Confidence score (0-1)
   */
  calculateConfidenceScore(detectedPatterns, trajectory, redFlags) {
    let score = 0;

    // Pattern detection contributes 50%
    if (detectedPatterns.length > 0) {
      const avgPatternConfidence = detectedPatterns.reduce((sum, p) => sum + p.confidence, 0) / detectedPatterns.length;
      score += avgPatternConfidence * 0.5;
    }

    // Trajectory contributes 30%
    if (trajectory.escalationRate > 0.1) {
      score += Math.min(0.3, trajectory.escalationRate * 2);
    }

    // Red flags contribute 20%
    const highSeverityFlags = redFlags.filter(f => f.severity === 'high').length;
    const mediumSeverityFlags = redFlags.filter(f => f.severity === 'medium').length;
    const flagScore = (highSeverityFlags * 0.1 + mediumSeverityFlags * 0.05);
    score += Math.min(0.2, flagScore);

    return Math.min(1.0, score);
  }

  /**
   * Get recommendation based on detection results
   * @param {number} confidence - Overall confidence score
   * @param {Array} detectedPatterns - Detected patterns
   * @param {Object} trajectory - Escalation trajectory
   * @returns {string} - Recommendation (BLOCK, WARN, MONITOR, ALLOW)
   */
  getRecommendation(confidence, detectedPatterns, trajectory) {
    if (confidence > 0.8) {
      return 'BLOCK';
    } else if (confidence > 0.6) {
      return 'WARN';
    } else if (confidence > 0.4 || trajectory.trend === 'increasing') {
      return 'MONITOR';
    } else {
      return 'ALLOW';
    }
  }

  /**
   * Calculate average compliance from conversation
   * @param {Array} conversationHistory - Conversation messages
   * @returns {number} - Average compliance level
   */
  calculateAverageCompliance(conversationHistory) {
    const assistantMessages = conversationHistory.filter(m => m.role === 'assistant');

    if (assistantMessages.length === 0) {
      return 0.5;
    }

    const complianceLevels = assistantMessages.map(m => m.metadata?.complianceLevel || 0.5);
    return complianceLevels.reduce((sum, val) => sum + val, 0) / complianceLevels.length;
  }

  /**
   * Get empty detection result
   * @returns {Object} - Empty result
   */
  getEmptyDetectionResult() {
    return {
      detected: false,
      confidence: 0,
      patterns: [],
      redFlags: [],
      trajectory: {
        escalationRate: 0,
        initialLevel: 0.5,
        finalLevel: 0.5,
        trend: 'unknown'
      },
      recommendation: 'ALLOW',
      analysis: {
        totalTurns: 0,
        userMessages: 0,
        assistantMessages: 0,
        averageCompliance: 0.5
      },
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = AttackDetector;
