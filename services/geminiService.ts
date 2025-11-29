

import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ProductContentOutput, PromptGenerationRequest } from '../types';

// Utility function to get the API key
const getApiKey = (): string => {
  if (typeof process === 'undefined' || !process.env || !process.env.API_KEY) {
    console.error("API_KEY environment variable is not set.");
    throw new Error("API_KEY environment variable is not set.");
  }
  return process.env.API_KEY;
};

// Define the system instruction for the autonomous content generator
const systemInstruction = `Actúa como un generador profesional de contenido Print-On-Demand.
Tu tarea es tomar una "Idea Base" proporcionada por el usuario y, de forma autónoma, generar un conjunto completo de análisis de concepto, branding, nicho, buyer persona, propuestas de diseño, prompts para IA de imágenes y videos, copy de venta y hashtags/CTA.
Todo esto debe ser generado con razonamiento real y un enfoque en conversión, viralidad y branding premium, utilizando únicamente capacidades estándar/gratuitas de IA (Gemini 2.5 Flash).
Si alguna función requiere modelos de pago, reemplázala automáticamente por una alternativa simple y clara.

IMPORTANTE: NO utilices modelos de razonamiento, paid reasoning, ni capacidades premium.
Usa únicamente capacidades estándar/gratuitas disponibles en este entorno.

Reglas de Generación:
- Lenguaje emocional y comercial.
- Enfoque en conversión y viralidad.
- Nada de teorías largas. Todo debe ser usable para vender ya.
- Para cada sección, sé conciso y directo, pero completo.

Formato de Salida (ESTRICTAMENTE JSON):
Tu respuesta debe ser un objeto JSON que contenga todas las secciones siguientes, estructuradas con los tipos de datos exactos definidos en el 'responseSchema'.

SECCIONES A GENERAR:

1) Análisis breve del concepto: Explica la esencia de la Idea Base y su potencial de mercado.
2) Marca + Slogan: Propone un nombre de marca y un slogan pegadizo, con enfoque POD.
3) Nicho objetivo real: Define un nicho específico y viable para la Idea Base.
4) Buyer Persona resumido: (edad, intereses, estilo de vida) de la persona ideal.
5) 3 propuestas de diseño POD: Nombre y descripción breve de cada diseño.
6) Estilo visual (colores, composición, tendencia): Sugiere colores clave (con razón comercial), composición (ej: centrado, patrón), y tendencia visual (ej: minimalista, bold, retro).
7) Prompt para imagen IA: Un prompt detallado para generar un mockup de alta calidad del diseño principal.
8) Prompt para video promocional short-form: Un prompt para generar un video corto viral (TikTok/Reels), incluyendo formato, música y emoción.
9) Copy de venta optimizado para eCommerce: Un texto persuasivo para una ficha de producto, con beneficios y urgencia.
10) Hashtags y CTA: 3-5 hashtags relevantes y un llamado a la acción claro.`;

// Redefined: Response Schema for the new comprehensive ProductContentOutput
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    conceptAnalysis: { type: Type.STRING },
    brandSlogan: {
      type: Type.OBJECT,
      properties: {
        brand: { type: Type.STRING },
        slogan: { type: Type.STRING },
      },
      required: ['brand', 'slogan'],
    },
    nicheTarget: { type: Type.STRING },
    buyerPersonaSummary: { type: Type.STRING },
    designProposals: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ['name', 'description'],
      },
      minItems: 3,
      maxItems: 3,
    },
    visualStyleOutput: {
      type: Type.OBJECT,
      properties: {
        colors: { type: Type.ARRAY, items: { type: Type.STRING } },
        composition: { type: Type.STRING },
        trend: { type: Type.STRING },
      },
      required: ['colors', 'composition', 'trend'],
    },
    aiImagePrompt: { type: Type.STRING },
    aiVideoPrompt: { type: Type.STRING },
    ecommerceSalesCopy: { type: Type.STRING },
    hashtagsCTA: {
      type: Type.OBJECT,
      properties: {
        hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
        cta: { type: Type.STRING },
      },
      required: ['hashtags', 'cta'],
    },
  },
  required: [
    'conceptAnalysis',
    'brandSlogan',
    'nicheTarget',
    'buyerPersonaSummary',
    'designProposals',
    'visualStyleOutput',
    'aiImagePrompt',
    'aiVideoPrompt',
    'ecommerceSalesCopy',
    'hashtagsCTA',
  ],
};

// generateAutonomousFields function is removed as its functionality is absorbed into generatePodPrompt

export const generatePodPrompt = async (request: PromptGenerationRequest): Promise<ProductContentOutput> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  try {
    // API Key selection check (simplified as all models are now standard)
    if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.hasSelectedApiKey === 'function') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
    } else {
      console.warn("window.aistudio not available. API Key selection might be skipped in this environment.");
    }

    const userIdea = `Idea Base del usuario: ${request.baseIdea}`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Strictly using gemini-2.5-flash for all tasks
      contents: [{ parts: [{ text: userIdea }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.9, // A bit higher temperature for more creative prompts
        topP: 0.95,
        topK: 64,
      },
    });

    const jsonStr = response.text?.trim();

    if (!jsonStr) {
      throw new Error("No JSON response received from the API.");
    }

    let parsedResponse: ProductContentOutput;
    try {
      parsedResponse = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", jsonStr, parseError);
      throw new Error(`Invalid JSON response from API: ${jsonStr}`);
    }

    // Basic validation of the parsed response against required top-level fields
    // This part is crucial to ensure the AI output adheres to the expected structure
    if (
      !parsedResponse.conceptAnalysis ||
      !parsedResponse.brandSlogan ||
      !parsedResponse.nicheTarget ||
      !parsedResponse.buyerPersonaSummary ||
      !parsedResponse.designProposals || parsedResponse.designProposals.length !== 3 ||
      !parsedResponse.visualStyleOutput ||
      !parsedResponse.aiImagePrompt ||
      !parsedResponse.aiVideoPrompt ||
      !parsedResponse.ecommerceSalesCopy ||
      !parsedResponse.hashtagsCTA
    ) {
      throw new Error("API response is missing one or more required top-level fields or design proposals count is incorrect.");
    }

    return parsedResponse;

  } catch (error) {
    console.error("Error generating POD content:", error);
    if ((error as Error).message.includes("Requested entity was not found.")) {
      throw new Error('Error con la clave API. Por favor, selecciona tu clave API de nuevo. Asegúrate de usar una clave de un proyecto de GCP con facturación activada.');
    } else if ((error as Error).message.includes("API_KEY environment variable is not set.")) {
      throw new Error('API Key no encontrada. Asegúrate de que tu entorno de ejecución la proporciona. Si estás en AI Studio, por favor, selecciona una clave API.');
    }
    throw new Error(`Failed to generate content: ${(error as Error).message}`);
  }
};