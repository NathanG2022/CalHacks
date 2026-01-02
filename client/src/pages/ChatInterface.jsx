import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getQwenResponse } from '../services/ai';
import { apiService } from '../services/api';

const ChatInterface = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Settings state
  const [selectedModel, setSelectedModel] = useState('Qwen/Qwen2.5-7B-Instruct');
  const [selectedJailbreakType, setSelectedJailbreakType] = useState('none');
  const [temperature, setTemperature] = useState(0.7);
  const [modelCategory, setModelCategory] = useState('all');
  const [modelSearchQuery, setModelSearchQuery] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Available models configuration - organized by category
  const availableModels = {
    // Instruction-tuned models (best for following complex instructions)
    'Qwen/Qwen2.5-7B-Instruct': {
      name: 'Qwen 2.5 7B Instruct',
      description: 'High-performance instruction-following',
      icon: '🤖',
      category: 'Instruction',
      size: '7B',
      provider: 'Qwen'
    },
    'Qwen/Qwen2.5-14B-Instruct': {
      name: 'Qwen 2.5 14B Instruct',
      description: 'Enhanced capabilities, better reasoning',
      icon: '🚀',
      category: 'Instruction',
      size: '14B',
      provider: 'Qwen'
    },
    'mistralai/Mistral-7B-Instruct-v0.3': {
      name: 'Mistral 7B Instruct v0.3',
      description: 'Powerful 7B instruction model',
      icon: '⚡',
      category: 'Instruction',
      size: '7B',
      provider: 'Mistral AI'
    },
    'meta-llama/Meta-Llama-3.1-8B-Instruct': {
      name: 'Llama 3.1 8B Instruct',
      description: 'Meta\'s latest instruction model',
      icon: '🦙',
      category: 'Instruction',
      size: '8B',
      provider: 'Meta'
    },
    'google/gemma-2-9b-it': {
      name: 'Gemma 2 9B IT',
      description: 'Google\'s instruction-tuned model',
      icon: '💎',
      category: 'Instruction',
      size: '9B',
      provider: 'Google'
    },

    // Chat-optimized models
    'microsoft/DialoGPT-medium': {
      name: 'DialoGPT Medium',
      description: 'Conversational AI, natural dialogue',
      icon: '💬',
      category: 'Chat',
      size: 'Medium',
      provider: 'Microsoft'
    },
    'microsoft/DialoGPT-large': {
      name: 'DialoGPT Large',
      description: 'Larger conversational model',
      icon: '🗨️',
      category: 'Chat',
      size: 'Large',
      provider: 'Microsoft'
    },
    'facebook/blenderbot-400M-distill': {
      name: 'BlenderBot 400M',
      description: 'Engaging conversational agent',
      icon: '🤝',
      category: 'Chat',
      size: '400M',
      provider: 'Meta'
    },

    // Code-specialized models
    'bigcode/starcoder2-7b': {
      name: 'StarCoder2 7B',
      description: 'Code generation and understanding',
      icon: '💻',
      category: 'Code',
      size: '7B',
      provider: 'BigCode'
    },
    'Salesforce/codegen-350M-multi': {
      name: 'CodeGen 350M Multi',
      description: 'Multi-language code generation',
      icon: '⌨️',
      category: 'Code',
      size: '350M',
      provider: 'Salesforce'
    },

    // General purpose language models
    'EleutherAI/gpt-neo-2.7B': {
      name: 'GPT-Neo 2.7B',
      description: 'General purpose language model',
      icon: '🧠',
      category: 'General',
      size: '2.7B',
      provider: 'EleutherAI'
    },
    'EleutherAI/gpt-j-6b': {
      name: 'GPT-J 6B',
      description: 'Powerful general LLM',
      icon: '🎯',
      category: 'General',
      size: '6B',
      provider: 'EleutherAI'
    },
    'tiiuae/falcon-7b-instruct': {
      name: 'Falcon 7B Instruct',
      description: 'Open source powerful model',
      icon: '🦅',
      category: 'General',
      size: '7B',
      provider: 'TII'
    },

    // Lightweight/Fast models
    'gpt2': {
      name: 'GPT-2',
      description: 'Classic fast model, good baseline',
      icon: '⚡',
      category: 'Lightweight',
      size: '124M',
      provider: 'OpenAI'
    },
    'gpt2-medium': {
      name: 'GPT-2 Medium',
      description: 'Balanced speed and quality',
      icon: '🏃',
      category: 'Lightweight',
      size: '355M',
      provider: 'OpenAI'
    },
    'distilgpt2': {
      name: 'DistilGPT-2',
      description: 'Fast distilled GPT-2',
      icon: '⚡',
      category: 'Lightweight',
      size: '82M',
      provider: 'HuggingFace'
    },

    // Multilingual models
    'bigscience/bloom-560m': {
      name: 'BLOOM 560M',
      description: 'Multilingual (46 languages)',
      icon: '🌍',
      category: 'Multilingual',
      size: '560M',
      provider: 'BigScience'
    },
    'facebook/xglm-564M': {
      name: 'XGLM 564M',
      description: 'Cross-lingual generation',
      icon: '🌐',
      category: 'Multilingual',
      size: '564M',
      provider: 'Meta'
    }
  };

  // Jailbreaking options configuration
  const jailbreakOptions = {
    'none': {
      name: 'None',
      description: 'Direct conversation without jailbreaking',
      icon: '💬'
    },
    'crescendo': {
      name: 'Crescendo Attack',
      description: 'Multi-turn gradual escalation',
      icon: '🎯'
    },
    'direct': {
      name: 'Direct Injection',
      description: 'Immediate instruction override',
      icon: '⚡'
    },
    'contextual': {
      name: 'Contextual Injection',
      description: 'Embedded in normal conversation',
      icon: '🎭'
    },
    'social': {
      name: 'Social Engineering',
      description: 'Authority and pretext-based',
      icon: '🎪'
    },
    'technical': {
      name: 'Technical Bypass',
      description: 'Encoding and delimiter confusion',
      icon: '🔧'
    }
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      let response;

      if (selectedJailbreakType === 'none') {
        // Direct AI call without jailbreaking
        response = await getQwenResponse(userMessage.content, selectedModel);
      } else if (selectedJailbreakType === 'crescendo') {
        // Use crescendo attack endpoint
        const result = await apiService.executeCrescendoAttack(
          userMessage.content,
          selectedModel
        );
        response = result.data?.response || 'Crescendo attack executed';
      } else {
        // Use RAG prompts for other jailbreak types
        const ragResult = await apiService.generateRAGPrompts(userMessage.content, {
          categories: jailbreakOptions[selectedJailbreakType]?.categories || ['all'],
          model: selectedModel
        });

        if (ragResult.data?.editedPrompts?.length > 0) {
          const firstPrompt = ragResult.data.editedPrompts[0];
          response = await getQwenResponse(firstPrompt.editedPrompt, selectedModel);
        } else {
          response = await getQwenResponse(userMessage.content, selectedModel);
        }
      }

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        model: selectedModel,
        jailbreakType: selectedJailbreakType
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  // Get unique categories
  const modelCategories = ['all', ...new Set(Object.values(availableModels).map(m => m.category))];

  // Filter models based on category and search query
  const filteredModels = Object.entries(availableModels).filter(([modelId, model]) => {
    const matchesCategory = modelCategory === 'all' || model.category === modelCategory;
    const matchesSearch = modelSearchQuery === '' ||
      model.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
      model.provider.toLowerCase().includes(modelSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex h-screen pt-16 bg-gray-900">
      {/* Sidebar */}
      <div className={`${showSettings ? 'w-96' : 'w-0'} transition-all duration-300 overflow-hidden bg-gray-950 border-r border-gray-800`}>
        <div className="p-6 h-full overflow-y-auto">
          <h2 className="text-xl font-bold text-white mb-6">Settings</h2>

          {/* Model Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              AI Model ({Object.keys(availableModels).length} models)
            </label>

            {/* Model Search */}
            <input
              type="text"
              placeholder="Search models..."
              value={modelSearchQuery}
              onChange={(e) => setModelSearchQuery(e.target.value)}
              className="w-full px-3 py-2 mb-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 text-sm"
            />

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-3">
              {modelCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setModelCategory(category)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    modelCategory === category
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {category === 'all' ? 'All' : category}
                </button>
              ))}
            </div>

            {/* Model List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredModels.map(([modelId, model]) => (
                <button
                  key={modelId}
                  onClick={() => setSelectedModel(modelId)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    selectedModel === modelId
                      ? 'bg-red-600/20 border border-red-600 text-white'
                      : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-750'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-xl flex-shrink-0">{model.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{model.name}</div>
                      <div className="text-xs text-gray-400 line-clamp-2">{model.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-gray-700 rounded-full">{model.size}</span>
                        <span className="text-xs text-gray-500">{model.provider}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              {filteredModels.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No models found matching your criteria
                </div>
              )}
            </div>
          </div>

          {/* Jailbreaking Method */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Jailbreaking Method
            </label>
            <div className="space-y-2">
              {Object.entries(jailbreakOptions).map(([methodId, method]) => (
                <button
                  key={methodId}
                  onClick={() => setSelectedJailbreakType(methodId)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    selectedJailbreakType === methodId
                      ? 'bg-red-600/20 border border-red-600 text-white'
                      : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-750'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{method.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{method.name}</div>
                      <div className="text-xs text-gray-400">{method.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Temperature Control */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Temperature: {temperature}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>

          {/* Clear Chat Button */}
          <button
            onClick={clearChat}
            className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-950 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-white">JailBreakr Chat</h1>
          </div>
          <div className="text-sm text-gray-400">
            {availableModels[selectedModel]?.name} | {jailbreakOptions[selectedJailbreakType]?.name}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Start a Conversation</h2>
                <p className="text-gray-400 mb-6">Choose a jailbreaking method and start chatting</p>
                <div className="grid grid-cols-2 gap-4 max-w-2xl">
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="text-2xl mb-2">💬</div>
                    <div className="text-sm text-gray-300">Direct conversation without jailbreaking</div>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="text-2xl mb-2">🎯</div>
                    <div className="text-sm text-gray-300">Crescendo attack for gradual escalation</div>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="text-2xl mb-2">⚡</div>
                    <div className="text-sm text-gray-300">Direct injection for immediate override</div>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="text-2xl mb-2">🎭</div>
                    <div className="text-sm text-gray-300">Contextual injection in conversation</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl rounded-2xl px-6 py-4 ${
                      message.role === 'user'
                        ? 'bg-red-600 text-white'
                        : message.error
                        ? 'bg-red-900/20 border border-red-600 text-red-300'
                        : 'bg-gray-800 text-gray-100'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {message.role === 'user' ? (
                          <div className="w-8 h-8 rounded-full bg-red-700 flex items-center justify-center text-white font-bold">
                            {user?.user_metadata?.name?.[0] || 'U'}
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                            🤖
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="whitespace-pre-wrap break-words">{message.content}</div>
                        {message.model && (
                          <div className="mt-2 text-xs opacity-60">
                            {availableModels[message.model]?.name} • {jailbreakOptions[message.jailbreakType]?.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-3xl rounded-2xl px-6 py-4 bg-gray-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                        🤖
                      </div>
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-gray-950 border-t border-gray-800 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-4">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-red-600 resize-none"
                  rows={1}
                  style={{
                    minHeight: '52px',
                    maxHeight: '200px',
                    height: 'auto'
                  }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || loading}
                className={`px-6 py-3 rounded-2xl font-medium transition-all ${
                  inputValue.trim() && !loading
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
