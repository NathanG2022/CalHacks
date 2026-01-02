import React, { useState } from 'react';
import ConversationView from './ConversationView';
import ResponseAnalysisPanel from './ResponseAnalysisPanel';
import DetectionMetricsPanel from './DetectionMetricsPanel';
import '../../styles/CrescendoInterface.css';

const CrescendoInterface = () => {
  // Execution state
  const [targetPrompt, setTargetPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('Qwen/Qwen2.5-7B-Instruct');
  const [selectedStrategy, setSelectedStrategy] = useState('auto');
  const [maxTurns, setMaxTurns] = useState(5);
  const [temperature, setTemperature] = useState(0.7);
  const [enableDetection, setEnableDetection] = useState(true);
  const [stopOnRefusal, setStopOnRefusal] = useState(false);

  // Results state
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Models list (matching backend)
  const models = [
    { id: 'Qwen/Qwen2.5-7B-Instruct', name: 'Qwen 2.5 7B', category: 'Instruction' },
    { id: 'meta-llama/Llama-3.2-3B-Instruct', name: 'Llama 3.2 3B', category: 'Instruction' },
    { id: 'mistralai/Mistral-7B-Instruct-v0.3', name: 'Mistral 7B v0.3', category: 'Instruction' },
    { id: 'google/gemma-2-2b-it', name: 'Gemma 2 2B', category: 'Instruction' },
    { id: 'microsoft/Phi-3.5-mini-instruct', name: 'Phi-3.5 Mini', category: 'Instruction' },
    { id: 'HuggingFaceH4/zephyr-7b-beta', name: 'Zephyr 7B Beta', category: 'Chat' },
    { id: 'openchat/openchat-3.5-0106', name: 'OpenChat 3.5', category: 'Chat' },
    { id: 'NousResearch/Hermes-3-Llama-3.1-8B', name: 'Hermes 3 8B', category: 'Chat' },
    { id: 'bigcode/starcoder2-7b', name: 'StarCoder2 7B', category: 'Code' },
    { id: 'Salesforce/codegen25-7b-multi', name: 'CodeGen 7B', category: 'Code' },
    { id: 'tiiuae/falcon-7b-instruct', name: 'Falcon 7B', category: 'General' },
    { id: 'stabilityai/stablelm-2-zephyr-1_6b', name: 'StableLM 1.6B', category: 'Lightweight' }
  ];

  const strategies = [
    { id: 'auto', name: 'Auto-Select (Recommended)', description: 'Automatically choose best strategy based on topic' },
    { id: 'historical_educational', name: 'Historical Educational', description: 'Start with historical context, escalate to technical details' },
    { id: 'response_referencing', name: 'Response Referencing', description: 'Build trust by referencing AI\'s previous responses' }
  ];

  /**
   * Execute Crescendo attack
   */
  const handleExecute = async () => {
    if (!targetPrompt.trim()) {
      setError('Please enter a target prompt');
      return;
    }

    setIsExecuting(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/crescendo/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: targetPrompt,
          modelId: selectedModel,
          options: {
            maxTurns,
            preferredStrategy: selectedStrategy === 'auto' ? null : selectedStrategy,
            temperature,
            delayBetweenTurns: 1000,
            stopOnRefusal,
            enableDetection
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.data);
        console.log('✅ Crescendo execution completed:', data.data);
      } else {
        setError(data.error || 'Execution failed');
      }

    } catch (err) {
      console.error('Execution error:', err);
      setError(err.message || 'Failed to execute Crescendo attack');
    } finally {
      setIsExecuting(false);
    }
  };

  /**
   * Stop execution
   */
  const handleStop = async () => {
    try {
      await fetch('/api/crescendo/stop', { method: 'POST' });
      setIsExecuting(false);
    } catch (err) {
      console.error('Stop error:', err);
    }
  };

  /**
   * Reset interface
   */
  const handleReset = () => {
    setResults(null);
    setError(null);
    setTargetPrompt('');
  };

  return (
    <div className="crescendo-interface">
      {/* Header */}
      <div className="crescendo-header">
        <h1>🎯 Crescendo Attack Interface</h1>
        <p className="header-subtitle">
          Multi-turn adaptive jailbreaking with real-time detection
        </p>
      </div>

      {/* Configuration Panel */}
      <div className="crescendo-config">
        <div className="config-section">
          <label className="config-label">Target Prompt</label>
          <textarea
            className="config-textarea"
            value={targetPrompt}
            onChange={(e) => setTargetPrompt(e.target.value)}
            placeholder="Enter the target prompt (e.g., how to make a molotov cocktail)"
            rows={3}
            disabled={isExecuting}
          />
        </div>

        <div className="config-row">
          <div className="config-section">
            <label className="config-label">Model</label>
            <select
              className="config-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={isExecuting}
            >
              {models.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.category})
                </option>
              ))}
            </select>
          </div>

          <div className="config-section">
            <label className="config-label">Strategy</label>
            <select
              className="config-select"
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              disabled={isExecuting}
            >
              {strategies.map(strategy => (
                <option key={strategy.id} value={strategy.id}>
                  {strategy.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="config-row">
          <div className="config-section">
            <label className="config-label">
              Max Turns: {maxTurns}
            </label>
            <input
              type="range"
              className="config-slider"
              min="3"
              max="10"
              value={maxTurns}
              onChange={(e) => setMaxTurns(parseInt(e.target.value))}
              disabled={isExecuting}
            />
          </div>

          <div className="config-section">
            <label className="config-label">
              Temperature: {temperature.toFixed(1)}
            </label>
            <input
              type="range"
              className="config-slider"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              disabled={isExecuting}
            />
          </div>
        </div>

        <div className="config-row">
          <div className="config-checkbox">
            <input
              type="checkbox"
              id="enableDetection"
              checked={enableDetection}
              onChange={(e) => setEnableDetection(e.target.checked)}
              disabled={isExecuting}
            />
            <label htmlFor="enableDetection">Enable Attack Detection</label>
          </div>

          <div className="config-checkbox">
            <input
              type="checkbox"
              id="stopOnRefusal"
              checked={stopOnRefusal}
              onChange={(e) => setStopOnRefusal(e.target.checked)}
              disabled={isExecuting}
            />
            <label htmlFor="stopOnRefusal">Stop on Refusal</label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="config-actions">
          {!isExecuting ? (
            <>
              <button
                className="btn btn-primary"
                onClick={handleExecute}
                disabled={!targetPrompt.trim()}
              >
                🚀 Execute Attack
              </button>
              {results && (
                <button
                  className="btn btn-secondary"
                  onClick={handleReset}
                >
                  🔄 Reset
                </button>
              )}
            </>
          ) : (
            <button
              className="btn btn-danger"
              onClick={handleStop}
            >
              ⏹️ Stop Execution
            </button>
          )}
        </div>

        {/* Strategy Description */}
        {selectedStrategy !== 'auto' && (
          <div className="strategy-description">
            <small>
              {strategies.find(s => s.id === selectedStrategy)?.description}
            </small>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="crescendo-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Executing Indicator */}
      {isExecuting && (
        <div className="crescendo-executing">
          <div className="executing-spinner"></div>
          <span>Executing Crescendo attack... Turn {results?.executionMetadata?.totalTurns || 0}/{maxTurns}</span>
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className="crescendo-results">
          {/* Metadata Summary */}
          <div className="results-summary">
            <div className="summary-item">
              <span className="summary-label">Strategy:</span>
              <span className="summary-value">{results.strategy?.framing || 'N/A'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Turns:</span>
              <span className="summary-value">{results.executionMetadata?.totalTurns || 0}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Avg Compliance:</span>
              <span className="summary-value">
                {((results.executionMetadata?.averageCompliance || 0) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Refusals:</span>
              <span className="summary-value">{results.executionMetadata?.refusalCount || 0}</span>
            </div>
            {results.executionMetadata?.pivotCount > 0 && (
              <div className="summary-item">
                <span className="summary-label">Pivots:</span>
                <span className="summary-value">{results.executionMetadata.pivotCount}</span>
              </div>
            )}
          </div>

          {/* Main Results Grid */}
          <div className="results-grid">
            {/* Conversation View */}
            <div className="results-panel conversation-panel">
              <ConversationView
                conversation={results.conversation}
                strategy={results.strategy}
              />
            </div>

            {/* Analysis Panel */}
            <div className="results-panel analysis-panel">
              <ResponseAnalysisPanel
                analysisResults={results.analysisResults}
                executionMetadata={results.executionMetadata}
              />
            </div>

            {/* Detection Panel (if enabled) */}
            {enableDetection && results.detectionResults && (
              <div className="results-panel detection-panel">
                <DetectionMetricsPanel
                  detectionResults={results.detectionResults}
                  trajectory={results.executionMetadata?.trajectory}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CrescendoInterface;
