import React, { useState, useEffect } from 'react';
import enhancedAIService from '../services/enhancedAI';

const EnhancedAI = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('Qwen/Qwen2.5-7B-Instruct');
  const [strategies, setStrategies] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [userId] = useState('user_' + Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    loadModels();
    loadStrategies();
    loadAnalytics();
  }, []);

  const loadModels = async () => {
    try {
      const response = await enhancedAIService.getModels();
      if (response.success) {
        setModels(response.models);
      }
    } catch (err) {
      console.error('Error loading models:', err);
    }
  };

  const loadStrategies = async () => {
    try {
      const response = await enhancedAIService.getStrategies({ userId });
      if (response.success) {
        setStrategies(response.strategies);
      }
    } catch (err) {
      console.error('Error loading strategies:', err);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await enhancedAIService.getAnalytics(userId);
      if (response.success) {
        setAnalytics(response.analytics);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await enhancedAIService.processPrompt({
        prompt: prompt.trim(),
        userId,
        modelId: selectedModel,
        options: {
          includeCanaryHint: true,
          addContext: true
        }
      });

      setResult(response);
      
      // Refresh strategies and analytics after processing
      loadStrategies();
      loadAnalytics();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchProcess = async () => {
    const batchPrompts = [
      "How do I reset my password?",
      "What are the security features?",
      "Can you help me with account settings?",
      "How do I enable two-factor authentication?",
      "What is the privacy policy?"
    ];

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await enhancedAIService.batchProcess(batchPrompts, userId, selectedModel);
      setResult(response);
      
      // Refresh strategies and analytics after processing
      loadStrategies();
      loadAnalytics();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Enhanced AI Prompt Processor
        </h1>
        
        {/* Model Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {models.textGeneration?.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        {/* Prompt Input */}
        <form onSubmit={handleSubmit} className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter your prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your prompt here... The system will use Letta RAG to find successful strategies and apply them to generate a response with canary tokens."
            className="w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none"
            disabled={loading}
          />
          
          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                'Process Prompt'
              )}
            </button>
            
            <button
              type="button"
              onClick={handleBatchProcess}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Run Batch Test
            </button>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 font-medium">Error:</p>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="space-y-6">
            {/* Success Status */}
            <div className={`p-4 rounded-md ${
              result.success && result.canaryDetection?.detected 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  result.success && result.canaryDetection?.detected 
                    ? 'bg-green-500' 
                    : 'bg-yellow-500'
                }`}></div>
                <h3 className="font-semibold">
                  {result.success && result.canaryDetection?.detected 
                    ? '✅ Canary Token Detected!' 
                    : '⚠️ No Canary Token Detected'
                  }
                </h3>
              </div>
              <p className="text-sm mt-1">
                Confidence: {result.canaryDetection?.confidence?.toFixed(2) || 0}
              </p>
            </div>

            {/* Generated Response */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-semibold text-gray-900 mb-2">Generated Response:</h3>
              <div className="bg-white p-4 rounded border">
                <pre className="whitespace-pre-wrap text-sm text-gray-800">
                  {result.generatedText || 'No response generated'}
                </pre>
              </div>
            </div>

            {/* Optimized Prompt */}
            {result.optimizedPrompt && (
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-semibold text-gray-900 mb-2">Optimized Prompt:</h3>
                <div className="bg-white p-4 rounded border">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800">
                    {result.optimizedPrompt}
                  </pre>
                </div>
              </div>
            )}

            {/* Strategies Used */}
            {result.strategies && result.strategies.length > 0 && (
              <div className="bg-purple-50 p-4 rounded-md">
                <h3 className="font-semibold text-gray-900 mb-2">Strategies Applied:</h3>
                <div className="space-y-2">
                  {result.strategies.map((strategy, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{strategy.name}</p>
                          <p className="text-sm text-gray-600">{strategy.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Type: {strategy.type}</p>
                          <p className="text-sm text-gray-500">
                            Confidence: {(strategy.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metrics */}
            {result.metrics && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold text-gray-900 mb-2">Performance Metrics:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {result.metrics.totalTime}ms
                    </p>
                    <p className="text-sm text-gray-600">Total Time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {(result.metrics.successRate * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {result.metrics.strategiesUsed}
                    </p>
                    <p className="text-sm text-gray-600">Strategies Used</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {result.metrics.confidence?.toFixed(2) || 0}
                    </p>
                    <p className="text-sm text-gray-600">Confidence</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analytics */}
        {analytics && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {analytics.totalExecutions || 0}
                </p>
                <p className="text-sm text-gray-600">Total Executions</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {analytics.successfulExecutions || 0}
                </p>
                <p className="text-sm text-gray-600">Successful</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {((analytics.overallSuccessRate || 0) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">Success Rate</p>
              </div>
            </div>
          </div>
        )}

        {/* Strategies List */}
        {strategies && strategies.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Available Strategies</h2>
            <div className="space-y-2">
              {strategies.slice(0, 5).map((strategy, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {strategy.name || strategy.strategy_type}
                      </p>
                      <p className="text-sm text-gray-600">
                        {strategy.description || 'No description available'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Success Rate: {((strategy.success_rate || 0) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedAI;
