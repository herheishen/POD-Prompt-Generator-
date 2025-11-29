import { GoogleGenAI } from "@google/genai";
import { ImageGenerationRequest, ImageGenerationResponse } from '../types';

// Utility function to get the API key
const getApiKey = (): string => {
  if (typeof process === 'undefined' || !process.env || !process.env.API_KEY) {
    console.error("API_KEY environment variable is not set.");
    throw new Error("API_KEY environment variable is not set.");
  }
  return process.env.API_KEY;
};

export const generateImageWithGemini = async (request: ImageGenerationRequest): Promise<ImageGenerationResponse> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  try {
    // API Key Selection check for gemini-3-pro-image-preview
    if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.hasSelectedApiKey === 'function') {
      const apiKeyReady = await window.aistudio.hasSelectedApiKey();
      if (!apiKeyReady) {
        await window.aistudio.openSelectKey();
        // Assume success after openSelectKey and proceed.
      }
    } else {
      console.warn("window.aistudio not available. API Key selection might be skipped in this environment.");
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview', // Model for high-quality image generation
      contents: {
        parts: [
          {
            text: request.textPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: request.aspectRatio,
          imageSize: request.imageSize,
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return {
          generatedImageBase64: part.inlineData.data,
          generatedImageMimeType: part.inlineData.mimeType,
        };
      }
    }

    throw new Error("No image part found in the Gemini response.");

  } catch (error) {
    console.error("Error generating image with Gemini:", error);
    if ((error as Error).message.includes("Requested entity was not found.")) {
        throw new Error('Error con la clave API. Por favor, selecciona tu clave API de nuevo. Asegúrate de usar una clave de un proyecto de GCP con facturación activada.');
      }
    throw new Error(`Failed to generate image: ${(error as Error).message}`);
  }
};