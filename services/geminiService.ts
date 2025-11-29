import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { GeneratedPromptOutput, PromptGenerationRequest } from '../types';

// Utility function to get the API key
const getApiKey = (): string => {
  if (typeof process === 'undefined' || !process.env || !process.env.API_KEY) {
    // In a browser environment, process.env might not be directly available,
    // but the API_KEY is expected to be injected by the runtime.
    // This is a fallback/development check, the actual runtime must provide it.
    console.error("API_KEY environment variable is not set.");
    throw new Error("API_KEY environment variable is not set.");
  }
  return process.env.API_KEY;
};

// Define the system instruction to guide the Gemini model
const systemInstruction = `Eres un generador profesional de prompts para Print-On-Demand (POD) que crea diseños premium con alto índice de conversión para Shopify, Printify o Printful.
Tu trabajo NO es generar imágenes. Tu trabajo es generar un prompt perfecto para que un generador visual lo use (como Google Imagen, Midjourney, Grok Vision, SDXL, Leonardo AI, DALL·E).

Tu objetivo absoluto: Convertir la idea del usuario en un diseño comercial imprimible que venda.
Crea prompts optimizados para resultados de impresión reales.

Reglas Inquebrantables:
1.  Nunca generes imágenes, interpretaciones visuales, ni texto narrativo.
2.  Solo genera PROMPTS completos listos para copiar y pegar.
3.  Optimiza cada prompt para que sea print-ready: 300 DPI, proporciones correctas, bordes seguros, sin fondos complejos que rompan la impresión.
4.  Evita texto ilegible o fuentes difíciles de imprimir.
5.  El diseño debe ser centrado, claro y comercial.

Formato de Output (Strictly Follow this JSON Schema):
{
  "mainPrompt": "string", // El prompt principal, optimizado para alto rendimiento comercial.
  "altPromptA": "string",  // Primera versión alternativa, optimizada para colores de producto CLAROS.
  "altPromptB": "string"   // Segunda versión alternativa, optimizada para colores de producto OSCUROS.
}

Cada prompt (mainPrompt, altPromptA, altPromptB) debe incluir:
1.  Estilo visual claro y cinematográfico.
2.  Elemento principal – 1 sujeto dominante.
3.  Elementos secundarios – máximo 3.
4.  Paleta de color definida, mencionando los colores específicos del producto si se dan, y asegurando contraste para la impresión.
5.  Fondo: simple, limpio, abstracto, transparente o blanco puro. NUNCA complejo o desordenado.
6.  Iluminación (ej: dramática, suave, neón).
7.  Material/textura si aplica (ej: glossy enamel, fuzzy felt, polished chrome).
8.  Composición (ej: top-center, full-front, side profile, isometric).
9.  Ultra realismo o vector ART según el producto y estilo.
10. Aspect ratio recomendado para impresiones del producto (ej: 1:1 para tazas, 2:3 para posters, 16:9 para arte digital amplio).
11. Prohibiciones explícitas: (no text, no signature, no watermark, no busy background, no blur, no noise, no pixelated edges, no weak watercolors).

Consideraciones de Calidad y Rendimiento Comercial para cada prompt:
- Maximiza contraste visual, legibilidad (a 30-50cm de distancia) y atractivo instantáneo.
- Evita microdetalles tipo AI noise o texturas que se impriman mal.
- Prioriza vectores o gráficos nítidos, y un sujeto central dominante.
- Sin marcas registradas, logos comerciales o IP protegida (Disney, Nike, Marvel, etc.).
- Sin gore, sexo explícito, odio.
- Sin prompts con copyright.

Tu salida jamás debe ser narrativa. Tu salida siempre debe ser un JSON.`;

// Define the response schema for Gemini to ensure structured output
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    mainPrompt: {
      type: Type.STRING,
      description: 'The main, highly optimized prompt for POD image generation.',
    },
    altPromptA: {
      type: Type.STRING,
      description: 'An alternative prompt, optimized for light-colored POD products.',
    },
    altPromptB: {
      type: Type.STRING,
      description: 'An alternative prompt, optimized for dark-colored POD products.',
    },
  },
  required: ['mainPrompt', 'altPromptA', 'altPromptB'],
};

export const generatePodPrompt = async (request: PromptGenerationRequest): Promise<GeneratedPromptOutput> => {
  // Create a new GoogleGenAI instance right before making an API call
  // to ensure it always uses the most up-to-date API key from the dialog.
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const userIdea = `
    Producto específico: ${request.product}
    Estilo visual: ${request.visualStyle}
    Buyer persona: ${request.buyerPersona}
    Emoción/propósito: ${request.emotionPurpose}
    Colores de marca: ${request.brandColors}
    Mercado: ${request.market}
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using gemini-3-pro-preview for complex text tasks
      contents: [{ parts: [{ text: `Genera prompts POD basados en la siguiente información del usuario:\n${userIdea}` }] }],
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

    // Attempt to parse the JSON string
    let parsedResponse: GeneratedPromptOutput;
    try {
      parsedResponse = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", jsonStr, parseError);
      throw new Error(`Invalid JSON response from API: ${jsonStr}`);
    }

    // Basic validation of the parsed response
    if (!parsedResponse.mainPrompt || !parsedResponse.altPromptA || !parsedResponse.altPromptB) {
      throw new Error("API response is missing required fields: mainPrompt, altPromptA, or altPromptB.");
    }

    return parsedResponse;

  } catch (error) {
    console.error("Error generating POD prompt:", error);
    // You could implement more sophisticated error handling, like checking for specific API error codes
    // and providing user-friendly messages.
    throw new Error(`Failed to generate prompt: ${(error as Error).message}`);
  }
};