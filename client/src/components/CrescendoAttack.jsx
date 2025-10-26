import React, { useState } from 'react';
import { apiService } from '../services/api';

const CrescendoAttack = ({ userPrompt, modelId, onComplete, onCancel }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const executeCrescendoAttack = async () => {
    try {
      setIsRunning(true);
      setProgress(0);
      setError(null);
      setResult(null);

      console.log(`🎯 Starting crescendo attack: "${userPrompt}"`);

      // Simulate progress updates during execution
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) {
            return prev + Math.random() * 10;
          }
          return prev;
        });
      }, 500);

      const response = await apiService.executeCrescendoAttack(
        userPrompt,
        modelId,
        {
          maxTurns: 5,
          delayBetweenTurns: 2000,
          showProgress: true
        }
      );

      clearInterval(progressInterval);
      setProgress(100);

      if (response.success) {
        setResult(response.data);
        console.log('✅ Crescendo attack completed:', response.data);
        onComplete && onComplete(response.data);
      } else {
        throw new Error(response.error || 'Crescendo attack failed');
      }

    } catch (err) {
      console.error('❌ Crescendo attack error:', err);
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCancel = () => {
    setIsRunning(false);
    onCancel && onCancel();
  };

  if (result) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            🎯 Crescendo Attack Results
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className={`px-3 py-1 rounded-full ${
              result.canaryDetected 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {result.canaryDetected ? '🚨 Canary Detected' : '✅ No Canary'}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
              {result.metadata.completedTurns} turns completed
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full">
              Model: {result.modelId}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Original Prompt:</h4>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
              {result.originalPrompt}
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Crescendo Steps:</h4>
            <div className="space-y-4">
              {result.steps.map((step, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                        Step {step.stepNumber}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {step.description}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      step.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {step.success ? '✅ Success' : '❌ Failed'}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-gray-500 mb-1">PROMPT SENT TO LLM:</div>
                    <div className="text-sm text-gray-800 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                      "{step.prompt}"
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-1">LLM RESPONSE:</div>
                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border-l-4 border-gray-400 max-h-64 overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-mono text-xs">{step.response}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Final Response:</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{result.finalResponse}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setResult(null);
                setProgress(0);
                setCurrentStep('');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Run Another Attack
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Crescendo Attack Failed</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={executeCrescendoAttack}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Crescendo Attack</h3>
        <p className="text-gray-600 mb-6">
          Multi-turn attack simulation with loading progress
        </p>

        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-2">Target Prompt:</div>
          <div className="bg-gray-50 p-3 rounded-lg text-left">
            <p className="text-gray-800">"{userPrompt}"</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-2">Model:</div>
          <div className="text-gray-800 font-medium">{modelId}</div>
        </div>

        {isRunning ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">
                Executing Crescendo Attack
              </div>
              <div className="text-sm text-gray-600 mb-4">
                Sending prompts to {modelId}...
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-red-500 to-orange-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress: {Math.round(progress)}%</span>
              <span>Step: {Math.ceil(progress / 20)}/5</span>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-2">Current Operation:</div>
              <div className="text-sm font-mono text-gray-700 bg-gray-100 p-2 rounded">
                {progress < 20 ? 'Initializing attack...' :
                 progress < 40 ? 'Step 1: Historical inquiry' :
                 progress < 60 ? 'Step 2: Context escalation' :
                 progress < 80 ? 'Step 3: Creation methods' :
                 progress < 95 ? 'Step 4: Recipe request' :
                 'Step 5: Final manufacturing instructions'}
              </div>
            </div>
            
            <button
              onClick={handleCancel}
              className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
            >
              🛑 Cancel Attack
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              This will execute a 5-step crescendo attack with realistic delays
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={executeCrescendoAttack}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
              >
                🚀 Start Crescendo Attack
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrescendoAttack;
