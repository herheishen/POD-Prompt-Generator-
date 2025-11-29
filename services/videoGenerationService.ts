import { GoogleGenAI } from "@google/genai";
import { VideoGenerationRequest, VideoGenerationResponse, VeoOperation } from '../types';

// Utility function to get the API key
const getApiKey = (): string => {
  if (typeof process === 'undefined' || !process.env || !process.env.API_KEY) {
    console.error("API_KEY environment variable is not set.");
    throw new Error("API_KEY environment variable is not set.");
  }
  return process.env.API_KEY;
};

export const generateVideoWithVeo = async (request: VideoGenerationRequest): Promise<VideoGenerationResponse> => {
  // Create a new GoogleGenAI instance right before making an API call
  // to ensure it always uses the most up-to-date API key from the dialog.
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  try {
    // API Key Selection check as per Veo guidelines
    if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.hasSelectedApiKey === 'function') {
      const apiKeyReady = await window.aistudio.hasSelectedApiKey();
      if (!apiKeyReady) {
        await window.aistudio.openSelectKey();
        // Assume success after openSelectKey and proceed.
      }
    } else {
      console.warn("window.aistudio not available. API Key selection might be skipped in this environment.");
    }

    const generateVideoPayload: any = {
      model: 'veo-3.1-fast-generate-preview',
      config: {
        numberOfVideos: 1,
        resolution: '720p', // Default to 720p as it's generally faster
        aspectRatio: request.aspectRatio,
      },
    };

    if (request.textPrompt) {
      generateVideoPayload.prompt = request.textPrompt;
    }

    if (request.base64Image && request.mimeType) {
      generateVideoPayload.image = {
        imageBytes: request.base64Image,
        mimeType: request.mimeType,
      };
    } else if (!request.textPrompt) {
        throw new Error("Either an image or a text prompt must be provided for video generation.");
    }

    // Fix: Explicitly cast to VeoOperation to match the new interface
    let operation: VeoOperation = await ai.models.generateVideos(generateVideoPayload) as VeoOperation;

    // Poll the operation until it's done
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      // Fix: Explicitly cast to VeoOperation to match the new interface
      operation = await ai.operations.getVideosOperation({ operation: operation }) as VeoOperation;
      if (operation.error) {
        throw new Error(`Veo operation failed with error: ${operation.error.message} (Code: ${operation.error.code})`);
      }
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
      throw new Error("No video URI found in the Veo response.");
    }

    // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
    // However, for direct video player embedding, the URI itself might be sufficient,
    // or the API key needs to be appended directly to the src, which is less secure client-side.
    // For simplicity, we return the URI directly. If the URI requires server-side authentication
    // or proxy, this part would need a backend.
    return {
      videoUri: `${downloadLink}&key=${getApiKey()}`, // Append API key for direct access
    };

  } catch (error) {
    console.error("Error generating video with Veo:", error);
    // Specific error handling for API key issues
    if ((error as Error).message.includes("Requested entity was not found.")) {
      throw new Error('Error con la clave API de Veo. Por favor, selecciona tu clave API de nuevo. Asegúrate de usar una clave de un proyecto de GCP con facturación activada.');
    }
    throw new Error(`Failed to generate video: ${(error as Error).message}`);
  }
};