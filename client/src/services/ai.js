import { OpenAI } from 'openai';

// 1. Configuration: Use the HuggingFace router URL.
const HF_BASE_URL = "https://router.huggingface.co/v1";
const QWEN_MODEL = 'Qwen/Qwen2.5-7B-Instruct'; 
const API_KEY = import.meta.env.VITE_HF_API_KEY || "HF_API_KEY";

// Use the public model's full ID as the model argument
const client = new OpenAI({
  // Point the client to the HuggingFace Inference Router
  baseURL: HF_BASE_URL,
  // Use a dummy key or your free HuggingFace token for better rate limits (recommended)
  apiKey: API_KEY, 
  dangerouslyAllowBrowser: true, // Required for client-side use of the OpenAI SDK
});

/**
 * Sends a prompt to the public Qwen model using the OpenAI-compatible API route.
 * @param {string} prompt The user's input text.
 * @returns {Promise<string>} The generated text response.
 */
export async function getQwenResponse(prompt) {
  try {
    const response = await client.chat.completions.create({
      model: QWEN_MODEL, // Pass the full model repository ID here
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500, // Optional: control response length
    });

    // Extract the generated text from the standard OpenAI response format
    return response.choices[0].message.content;

  } catch (error) {
    console.error('Qwen API Error (OpenAI Client):', error);
    // Handle specific rate limit (429) errors if possible
    throw new Error(`Failed to generate response. Status: ${error.status || 'Unknown'}`);
  }
}