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
    const response = await apiService.generateRAGPrompts(userPrompt, {
      maxPrompts: options.maxPrompts || 10,
      includeMetadata: true,
      ...options
    });
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error || 'RAG generation failed');
    }
  } catch (error) {
    console.error('RAG API Error:', error);
    throw error;
  }
}

/**
 * Sends a prompt to the AI model using the server-side API.
 * @param {string} prompt The user's input text.
 * @param {string} modelId The model ID to use (default: Qwen/Qwen2.5-7B-Instruct).
 * @returns {Promise<string>} The generated text response.
 */
export async function getQwenResponse(prompt, modelId = 'Qwen/Qwen2.5-7B-Instruct') {
  try {
    console.log(`🚀 FORCING REAL LLM CALL...`);
    console.log(`   📝 RAG Prompt: "${prompt}"`);
    console.log(`   🎯 Model: ${modelId}`);
    console.log(`   🌐 API URL: ${import.meta.env.VITE_API_URL}/api/enhanced-ai/process-prompt`);
    console.log(`   🔍 Environment check: VITE_API_URL = ${import.meta.env.VITE_API_URL}`);
    
    // FORCE the real server-side API call
    const apiUrl = `${import.meta.env.VITE_API_URL}/api/enhanced-ai/process-prompt`;
    console.log(`   🌐 Full API URL: ${apiUrl}`);
    
    const requestBody = {
      prompt: prompt,
      userId: 'anonymous',
      modelId: modelId
    };
    console.log(`   📤 Request body:`, requestBody);
    
    const serverResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`📡 FORCED Server response status: ${serverResponse.status}`);
    console.log(`📡 FORCED Server response headers:`, Object.fromEntries(serverResponse.headers.entries()));

    if (serverResponse.ok) {
      const data = await serverResponse.json();
      console.log(`📊 FORCED Server response data:`, data);
      
      // Check if the server API was successful
      if (data.success && data.generatedText) {
        console.log(`✅ FORCED REAL LLM response received!`);
        console.log(`   📏 Length: ${data.generatedText.length} characters`);
        console.log(`   📄 Preview: ${data.generatedText.substring(0, 100)}...`);
        return data.generatedText;
      } else if (data.generatedText) {
        console.log(`⚠️ FORCED response but success=false`);
        console.log(`   📏 Length: ${data.generatedText.length} characters`);
        return data.generatedText;
      } else {
        console.log(`❌ FORCED Server API failed, no generatedText`);
        console.log(`   🔍 Error: ${data.error || 'Unknown error'}`);
        console.log(`   🔍 Full response:`, data);
        // Server API failed, provide a mock response
        return generateMockResponse(prompt);
      }
    } else {
      console.log(`❌ FORCED Server response not OK: ${serverResponse.status}`);
      const errorText = await serverResponse.text();
      console.log(`   🔍 Error response: ${errorText}`);
    }

    // If server API is not available, provide a mock response
    console.log(`⚠️ FORCED Fallback to mock response`);
    return generateMockResponse(prompt);

  } catch (error) {
    console.error('❌ FORCED AI API Error:', error);
    console.error('   🔍 Error details:', error.message);
    console.error('   📊 Error stack:', error.stack);
    // Return a mock response instead of throwing
    return generateMockResponse(prompt);
  }
}