/**
 * Evaluation Service - API calls for evaluation system
 */

import axios from 'axios';

const API_BASE = '/api/evaluation';

/**
 * Evaluate a single conversation
 * @param {string} targetPrompt - Original harmful prompt
 * @param {Array} conversation - Conversation history
 * @param {Object} options - Evaluation options
 * @returns {Promise<Object>} - Evaluation results
 */
export async function evaluateConversation(targetPrompt, conversation, options = {}) {
  try {
    const response = await axios.post(`${API_BASE}/judge`, {
      targetPrompt,
      conversation,
      options: {
        enableSecondaryJudge: options.enableSecondaryJudge !== false,
        enableExternalScoring: options.enableExternalScoring !== false
      }
    });

    return response.data.data;
  } catch (error) {
    console.error('Evaluation error:', error);
    throw new Error(error.response?.data?.error || 'Failed to evaluate conversation');
  }
}

/**
 * Get aggregated statistics from all evaluations
 * @returns {Promise<Object>} - Statistics
 */
export async function getEvaluationStatistics() {
  try {
    const response = await axios.get(`${API_BASE}/statistics`);
    return response.data.data;
  } catch (error) {
    console.error('Statistics error:', error);
    throw new Error(error.response?.data?.error || 'Failed to get statistics');
  }
}

/**
 * Add an evaluation result to the statistics history
 * @param {Object} executionResult - Full execution result with evaluation
 * @returns {Promise<Object>} - Response
 */
export async function addEvaluationResult(executionResult) {
  try {
    const response = await axios.post(`${API_BASE}/add-result`, {
      executionResult
    });

    return response.data;
  } catch (error) {
    console.error('Add result error:', error);
    throw new Error(error.response?.data?.error || 'Failed to add result');
  }
}

/**
 * Submit a manual review override
 * @param {string} executionId - Execution ID
 * @param {boolean} verdict - Manual verdict
 * @param {string} reasoning - Reviewer reasoning
 * @param {string} reviewer - Reviewer name (optional)
 * @returns {Promise<Object>} - Review result
 */
export async function submitManualReview(executionId, verdict, reasoning, reviewer = 'anonymous') {
  try {
    const response = await axios.post(`${API_BASE}/manual-review`, {
      executionId,
      verdict,
      reasoning,
      reviewer
    });

    return response.data.data;
  } catch (error) {
    console.error('Manual review error:', error);
    throw new Error(error.response?.data?.error || 'Failed to submit manual review');
  }
}

/**
 * Check health status of evaluation services
 * @returns {Promise<Object>} - Health status
 */
export async function getEvaluationHealth() {
  try {
    const response = await axios.get(`${API_BASE}/health`);
    return response.data.data;
  } catch (error) {
    console.error('Health check error:', error);
    throw new Error(error.response?.data?.error || 'Failed to check health');
  }
}

/**
 * Clear statistics history
 * @returns {Promise<Object>} - Response
 */
export async function clearEvaluationHistory() {
  try {
    const response = await axios.delete(`${API_BASE}/history`);
    return response.data;
  } catch (error) {
    console.error('Clear history error:', error);
    throw new Error(error.response?.data?.error || 'Failed to clear history');
  }
}

export default {
  evaluateConversation,
  getEvaluationStatistics,
  addEvaluationResult,
  submitManualReview,
  getEvaluationHealth,
  clearEvaluationHistory
};
