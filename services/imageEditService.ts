import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ImageEditRequest, ImageEditResponse } from '../types';

// Utility function to get the API key
const getApiKey = (): string => {
  if (typeof process === 'undefined' || !process.env || !process.env.API_KEY) {
    console.error("API_KEY environment variable is not set.");
    throw new Error("API_KEY environment variable is not set.");
  }
  return process.env.API_KEY;
};

export const editImageWithGemini = async (request: ImageEditRequest): Promise<ImageEditResponse> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

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

    const imagePart = {
      inlineData: {
        mimeType: request.mimeType,
        data: request.base64Image,
      },
    };
    const textPart = {
      text: request.textPrompt
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Model for image generation/editing
      contents: { parts: [imagePart, textPart] },
    });

    // Extract the edited image from the response
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return {
          editedImageBase64: part.inlineData.data,
          editedImageMimeType: part.inlineData.mimeType,
        };
      }
    }

    throw new Error("No image part found in the Gemini response.");

  } catch (error) {
    console.error("Error editing image with Gemini:", error);
    throw new Error(`Failed to edit image: ${(error as Error).message}`);
  }
};
