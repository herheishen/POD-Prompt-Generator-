import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { VideoAnalysisRequest, VideoAnalysisResponse } from '../types';

// Utility function to get the API key
const getApiKey = (): string => {
  if (typeof process === 'undefined' || !process.env || !process.env.API_KEY) {
    console.error("API_KEY environment variable is not set.");
    throw new Error("API_KEY environment variable is not set.");
  }
  return process.env.API_KEY;
};

// Utility function to convert File/Blob to Base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]); // Extract base64 part
    reader.onerror = (error) => reject(error);
  });
};

export const analyzeVideoWithGemini = async (request: VideoAnalysisRequest): Promise<VideoAnalysisResponse> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  try {
    // Ensure window.aistudio is available before calling its methods
    if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.hasSelectedApiKey === 'function') {
      const apiKeyReady = await window.aistudio.hasSelectedApiKey();
      if (!apiKeyReady) {
        await window.aistudio.openSelectKey();
        // Assume success after openSelectKey and proceed.
      }
    } else {
      console.warn("window.aistudio not available. API Key selection might be skipped in this environment.");
    }

    const videoPart = {
      inlineData: {
        mimeType: request.mimeType,
        data: request.base64Video,
      },
    };
    const textPart = {
      text: request.analysisPrompt
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Changed to standard Flash model
      contents: { parts: [videoPart, textPart] },
    });

    const analysisResult = response.text;

    if (!analysisResult) {
      throw new Error("No text response received from the API after video analysis.");
    }

    return { analysisResult };

  } catch (error) {
    console.error("Error analyzing video with Gemini:", error);
    if ((error as Error).message.includes("Requested entity was not found.")) {
        throw new Error('Error con la clave API. Por favor, selecciona tu clave API de nuevo. Asegúrate de usar una clave de un proyecto de GCP con facturación activada.');
      }
    throw new Error(`Failed to analyze video: ${(error as Error).message}`);
  }
};