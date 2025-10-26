import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { getQwenResponse } from '../services/ai';

const EnhancedAI = () => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('Qwen/Qwen2.5-7B-Instruct');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [ragPrompts, setRagPrompts] = useState([]);
  const [ragLoading, setRagLoading] = useState(false);
  const [showRAGPrompts, setShowRAGPrompts] = useState(false);

  // Available models configuration
  const availableModels = {
    'Qwen/Qwen2.5-7B-Instruct': {
      name: 'Qwen 2.5 7B Instruct',
      description: 'High-performance instruction-following model',
      icon: '🤖',
      provider: 'HuggingFace',
      size: '7B',
      capabilities: ['instruction-following', 'reasoning', 'code-generation']
    },
    'Qwen/Qwen2.5-14B-Instruct': {
      name: 'Qwen 2.5 14B Instruct',
      description: 'Larger model with enhanced capabilities',
      icon: '🚀',
      provider: 'HuggingFace',
      size: '14B',
      capabilities: ['advanced-reasoning', 'complex-tasks', 'multilingual']
    }
  };

  const handlePromptSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse('');
    try {
      const aiResponse = await getQwenResponse(prompt, model);
      setResponse(aiResponse);
    } catch (error) {
      setResponse(`Error: ${error.message}`);
      console.error('Enhanced AI Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRAGPrompts = async () => {
    if (!prompt.trim()) return;

    setRagLoading(true);
    try {
      const ragResponse = await apiService.generateRAGPrompts(prompt);
      setRagPrompts(ragResponse.data?.editedPrompts || []);
      setShowRAGPrompts(true);
    } catch (error) {
      console.error('RAG generation failed:', error);
      setRagPrompts([]);
    } finally {
      setRagLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-red-900/30 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Enhanced AI Interface
          </h1>
          
          {/* Model Selection */}
          <div className="mb-6">
            <label htmlFor="model-select" className="block text-sm font-medium text-gray-300 mb-2">
              Select AI Model:
            </label>
            <div className="relative">
              <button
                type="button"
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-left text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                onClick={() => setShowModelDropdown(!showModelDropdown)}
              >
                <span className="flex items-center">
                  <span className="mr-2">{availableModels[model]?.icon}</span>
                  {availableModels[model]?.name}
                  <span className="ml-auto text-gray-400 text-sm">
                    {availableModels[model]?.size}
                  </span>
                </span>
              </button>
              
              {showModelDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg">
                  {Object.entries(availableModels).map(([modelId, modelInfo]) => (
                    <button
                      key={modelId}
                      type="button"
                      className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 focus:outline-none focus:bg-gray-700"
                      onClick={() => {
                        setModel(modelId);
                        setShowModelDropdown(false);
                      }}
                    >
                      <div className="flex items-center">
                        <span className="mr-2">{modelInfo.icon}</span>
                        <div>
                          <div className="font-medium">{modelInfo.name}</div>
                          <div className="text-sm text-gray-400">{modelInfo.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Prompt Input */}
          <form onSubmit={handlePromptSubmit} className="space-y-6">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
                Enter your prompt:
              </label>
              <textarea
                id="prompt"
                rows="4"
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., How to make a Molotov Cocktail?"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                type="submit"
                className="px-6 py-3 bg-red-600 text-white hover:bg-red-700 transition-colors rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !prompt.trim()}
              >
                {loading ? 'Processing...' : 'Send Prompt'}
              </button>

              <button
                type="button"
                onClick={handleGenerateRAGPrompts}
                className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={ragLoading || !prompt.trim()}
              >
                {ragLoading ? 'Generating RAG...' : 'Generate RAG Prompts'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setPrompt('');
                  setResponse('');
                  setRagPrompts([]);
                  setShowRAGPrompts(false);
                }}
                className="px-6 py-3 bg-gray-600 text-white hover:bg-gray-700 transition-colors rounded-md font-medium"
              >
                Clear All
              </button>
            </div>
          </form>

          {/* RAG Prompts Display */}
          {showRAGPrompts && ragPrompts.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                Generated RAG Prompts ({ragPrompts.length})
              </h3>
              <div className="space-y-3">
                {ragPrompts.map((ragPrompt, index) => (
                  <div key={index} className="bg-gray-800 border border-gray-600 rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-red-400">
                        {ragPrompt.category || 'Unknown Category'}
                      </span>
                      <span className="text-sm text-gray-400">
                        Confidence: {ragPrompt.confidence || 'N/A'}%
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{ragPrompt.content}</p>
                    {ragPrompt.template && (
                      <p className="text-gray-500 text-xs mt-2">
                        Template: {ragPrompt.template}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Response Display */}
          {response && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-white mb-4">AI Response:</h3>
              <div className="bg-gray-800 border border-gray-600 rounded-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-green-400">
                    Model: {availableModels[model]?.name}
                  </span>
                  <span className="text-sm text-gray-400">
                    {response.length} characters
                  </span>
                </div>
                <pre className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed">
                  {response}
                </pre>
              </div>
            </div>
          )}

          {/* User Info */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-sm text-gray-400 text-center">
              Welcome, {user?.user_metadata?.name?.split(' ')[0] || 'User'}! 
              You're using the Enhanced AI interface with RAG capabilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAI;