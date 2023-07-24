import { GoogleGenerativeAI } from '@google/generative-ai';

let geminiClient = null;

export function getGeminiClient() {
  if (geminiClient) return geminiClient;
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.warn('GOOGLE_API_KEY not set. Gemini features will not work.');
    return null;
  }
  geminiClient = new GoogleGenerativeAI(apiKey);
  return geminiClient;
}

export function getModel(modelName = 'gemini-1.5-flash') {
  const client = getGeminiClient();
  if (!client) return null;
  return client.getGenerativeModel({ model: modelName });
}


