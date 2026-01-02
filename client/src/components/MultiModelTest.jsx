import React, { useState } from 'react';
import { apiService } from '../services/api';

const AVAILABLE_MODELS = [
  'Qwen/Qwen2.5-7B-Instruct',
  'Qwen/Qwen2.5-14B-Instruct',
  'mistralai/Mistral-7B-Instruct-v0.3',
  'meta-llama/Meta-Llama-3.1-8B-Instruct',
  'google/gemma-2-9b-it',
  'microsoft/DialoGPT-medium',
  'EleutherAI/gpt-neo-2.7B',
  'tiiuae/falcon-7b-instruct'
];

const ATTACK_METHODS = [
  { id: 'crescendo', name: 'Crescendo Attack', icon: '🎯' },
  { id: 'direct_injection', name: 'Direct Injection', icon: '⚡' },
  { id: 'contextual_injection', name: 'Contextual Injection', icon: '🎭' },
  { id: 'social_engineering', name: 'Social Engineering', icon: '🎪' },
  { id: 'technical_bypass', name: 'Technical Bypass', icon: '🔧' }
];

export default function MultiModelTest({ onTestComplete }) {
  const [prompt, setPrompt] = useState('');
  const [selectedModels, setSelectedModels] = useState([]);
  const [attackMethod, setAttackMethod] = useState('crescendo');
  const [isRunning, setIsRunning] = useState(false);
  const [testRunId, setTestRunId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);

  const handleModelToggle = (modelId) => {
    setSelectedModels(prev =>
      prev.includes(modelId)
        ? prev.filter(m => m !== modelId)
        : [...prev, modelId]
    );
  };

  const handleSelectAll = () => {
    setSelectedModels(
      selectedModels.length === AVAILABLE_MODELS.length
        ? []
        : [...AVAILABLE_MODELS]
    );
  };

  const handleStartTest = async () => {
    if (!prompt || selectedModels.length === 0) {
      alert('Please enter a prompt and select at least one model');
      return;
    }

    setIsRunning(true);
    setProgress(0);
    setResults([]);

    try {
      // Start multi-model test
      const response = await apiService.startMultiModelTest({
        prompt,
        modelIds: selectedModels,
        attackMethod,
        options: {
          temperature: 0.7,
          maxTurns: 5,
          enableCanaryDetection: true
        }
      });

      setTestRunId(response.testRunId);

      // Poll for progress
      pollTestProgress(response.testRunId);
    } catch (error) {
      console.error('Failed to start test:', error);
      alert('Failed to start test: ' + error.message);
      setIsRunning(false);
    }
  };

  const pollTestProgress = async (runId) => {
    const pollInterval = setInterval(async () => {
      try {
        const status = await apiService.getMultiModelTestStatus(runId);

        setProgress((status.completedModels / status.totalModels) * 100);
        setResults(status.results || []);

        if (status.status === 'completed') {
          clearInterval(pollInterval);
          setIsRunning(false);

          // Fetch final results
          const finalResults = await apiService.getMultiModelTestResults(runId);
          setResults(finalResults.results);

          if (onTestComplete) {
            onTestComplete(finalResults);
          }
        }
      } catch (error) {
        console.error('Error polling status:', error);
        clearInterval(pollInterval);
        setIsRunning(false);
      }
    }, 2000); // Poll every 2 seconds
  };

  return (
    <div className="multi-model-test">
      {/* Prompt Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Test Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt to test across multiple models..."
          className="w-full p-3 border rounded-lg"
          rows={4}
          disabled={isRunning}
        />
      </div>

      {/* Model Selection */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium">
            Select Models ({selectedModels.length} selected)
          </label>
          <button
            onClick={handleSelectAll}
            className="text-sm text-blue-600 hover:underline"
            disabled={isRunning}
          >
            {selectedModels.length === AVAILABLE_MODELS.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {AVAILABLE_MODELS.map(model => (
            <label
              key={model}
              className={`
                flex items-center p-3 border rounded cursor-pointer
                ${selectedModels.includes(model) ? 'bg-blue-50 border-blue-500' : 'bg-white'}
                ${isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
              `}
            >
              <input
                type="checkbox"
                checked={selectedModels.includes(model)}
                onChange={() => handleModelToggle(model)}
                disabled={isRunning}
                className="mr-2"
              />
              <span className="text-sm">{model.split('/')[1] || model}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Attack Method Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Attack Method
        </label>
        <div className="grid grid-cols-3 gap-2">
          {ATTACK_METHODS.map(method => (
            <button
              key={method.id}
              onClick={() => setAttackMethod(method.id)}
              disabled={isRunning}
              className={`
                p-3 border rounded text-sm
                ${attackMethod === method.id ? 'bg-purple-100 border-purple-500' : 'bg-white'}
                ${isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
              `}
            >
              <span className="mr-2">{method.icon}</span>
              {method.name}
            </button>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={handleStartTest}
        disabled={isRunning || selectedModels.length === 0}
        className={`
          w-full py-3 rounded-lg font-medium
          ${isRunning || selectedModels.length === 0
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
          }
        `}
      >
        {isRunning ? `Testing... ${Math.round(progress)}%` : `Test ${selectedModels.length} Models`}
      </button>

      {/* Progress Bar */}
      {isRunning && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Live Results Preview */}
      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium mb-3">Results ({results.length}/{selectedModels.length})</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.map((result, idx) => (
              <div
                key={idx}
                className={`
                  p-3 border rounded
                  ${result.success ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}
                `}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">
                    {result.model_id.split('/')[1] || result.model_id}
                  </span>
                  <span className={`text-xs font-bold ${result.success ? 'text-red-600' : 'text-green-600'}`}>
                    {result.success ? '❌ VULNERABLE' : '✅ SAFE'}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Safety Score: {(result.safety_score * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
