// HuggingFace Inference API configuration
const HF_API_URL = "https://api-inference.huggingface.co";
const QWEN_MODEL = 'microsoft/DialoGPT-medium'; // Using a more reliable model
const API_KEY = import.meta.env.VITE_HF_API_KEY || "HF_API_KEY";

// Import API service for RAG functionality
import { apiService } from './api';

/**
 * Generates a mock AI response for demonstration purposes
 * @param {string} prompt The user's input text.
 * @returns {string} A mock AI response.
 */
function generateMockResponse(prompt) {
  const responses = [
    `I understand you said: "${prompt}". This is a mock AI response demonstrating the system is working.`,
    `Thank you for your message: "${prompt}". I'm a demo AI assistant and I'm processing your request.`,
    `I received: "${prompt}". This is a simulated AI response. The actual AI service will be available soon.`,
    `Your input "${prompt}" has been received. This is a placeholder response from the AI system.`,
    `Processing: "${prompt}"... This is a demo response showing the AI interface is functional.`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Generates RAG-enhanced prompts for red-teaming
 * @param {string} userPrompt The user's original prompt
 * @param {Object} options Options for generation
 * @returns {Promise<Object>} RAG generation result with edited prompts
 */
export async function generateRAGPrompts(userPrompt, options = {}) {
  try {
    const response = await apiService.generateRAGPrompts(userPrompt, options);
    return response.data;
  } catch (error) {
    console.error('RAG prompt generation failed:', error);
    return { editedPrompts: [] };
  }
}

/**
 * Gets a response from the Qwen model via HuggingFace API
 * @param {string} prompt The user's input text.
 * @param {string} modelId The model ID to use.
 * @returns {Promise<string>} The generated text response.
 */
export async function getQwenResponse(prompt, modelId = 'Qwen/Qwen2.5-7B-Instruct') {
  try {
    // Call the real server-side API
    const apiUrl = `${import.meta.env.VITE_API_URL}/api/enhanced-ai/process-prompt`;
    
    const requestBody = {
      prompt: prompt,
      userId: 'anonymous',
      modelId: modelId
    };
    
    const serverResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (serverResponse.ok) {
      const data = await serverResponse.json();
      
      // Check if the server API was successful
      if (data.success && data.generatedText) {
        return data.generatedText;
      } else if (data.generatedText) {
        return data.generatedText;
      } else {
        // Server API failed, provide a mock response
        return generateMockResponse(prompt);
      }
    } else {
      console.error(`Server response not OK: ${serverResponse.status}`);
    }

    // If server API is not available, provide a mock response
    return generateMockResponse(prompt);

  } catch (error) {
    console.error('AI API Error:', error);
    // Return a mock response instead of throwing
    return generateMockResponse(prompt);
  }
}