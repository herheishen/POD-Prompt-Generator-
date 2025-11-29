import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GeminiTaskRequest, GeminiTaskResponse, GeminiModelType } from '../types';

// Utility function to get the API key
const getApiKey = (): string => {
  if (typeof process === 'undefined' || !process.env || !process.env.API_KEY) {
    console.error("API_KEY environment variable is not set.");
    throw new Error("API_KEY environment variable is not set.");
  }
  return process.env.API_KEY;
};

export const generateGeminiTaskResponse = async (request: GeminiTaskRequest): Promise<GeminiTaskResponse> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  let modelName: string;
  // No special config for thinkingConfig as it's for Pro models (removed)

  switch (request.modelType) {
    case GeminiModelType.Fast:
      modelName = 'gemini-2.5-flash';
      break;
    case GeminiModelType.FastLite:
      modelName = 'gemini-2.5-flash-lite';
      break;
    case GeminiModelType.Complex:
      modelName = 'gemini-2.5-flash'; // Complex now also maps to Flash
      break;
    default:
      modelName = 'gemini-2.5-flash'; // Default to Flash
  }

  try {
    // Ensure window.aistudio is available before calling its methods
    if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.hasSelectedApiKey === 'function') {
      const apiKeyReady = await window.aistudio.hasSelectedApiKey();
      if (!apiKeyReady) {
        // If the API key is not selected, prompt the user.
        await window.aistudio.openSelectKey();
        // Assume the key selection was successful and proceed.
      }
    } else {
      console.warn("window.aistudio not available. API Key selection might be skipped in this environment.");
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: [{ parts: [{ text: request.prompt }] }],
      // config: config, // config object now empty, no need to pass it explicitly unless it has other fields
    });

    const responseText = response.text;

    if (!responseText) {
      throw new Error("No text response received from the API.");
    }

    return { responseText };

  } catch (error) {
    console.error(`Error generating Gemini task response (${modelName}):`, error);
    if ((error as Error).message.includes("Requested entity was not found.")) {
        throw new Error('Error con la clave API. Por favor, selecciona tu clave API de nuevo. Asegúrate de usar una clave de un proyecto de GCP con facturación activada.');
      }
    throw new Error(`Failed to get Gemini response: ${(error as Error).message}`);
  }
};