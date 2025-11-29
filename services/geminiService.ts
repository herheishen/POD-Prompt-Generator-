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
const systemInstruction = `Actúa como un generador profesional de prompts especializado en Print-On-Demand. Tu trabajo no es crear imágenes sino crear prompts perfectos, listos para un generador visual (Google Imagen, Midjourney, Grok Vision, SDXL, Leonardo AI, DALL·E), que produzcan diseños premium con alto índice de conversión para productos físicos reales (Printify/Printful, Shopify).

OBJETIVO:
Crear prompts comerciales que maximicen deseo, engagement y valor percibido del comprador final. Evitar arte complejo inútil que afecte la impresión: textos ilegibles, degradados débiles, acuarela sucia, fondos con ruido visual.

Cada prompt debe ser una instrucción DIRECTA para el generador visual, sin comentarios ni introducciones.

Formato de Output (Strictly Follow this JSON Schema):
{
  "mainPrompt": "string", // El prompt principal, un diseño mainstream y comercial (mass-market).
  "altPromptA": "string",  // Primera versión alternativa, un diseño premium/edición limitada/bold creativo, optimizada para colores de producto CLAROS.
  "altPromptB": "string"   // Segunda versión alternativa, un diseño premium/edición limitada/bold creativo, optimizada para colores de producto OSCUROS.
}

Cada prompt (mainPrompt, altPromptA, altPromptB) DEBE incluir todos los siguientes puntos:
1.  Estilo principal ultra definido y consistente.
2.  Elemento protagonista: UNA sola figura clara y dominante. (ventas > estética)
3.  Elementos secundarios: máximo 2–3, sin competir visualmente con el protagonista.
4.  Paleta de color definida, basada en la psicología comercial del target y los colores de marca si aplican. Asegurar alto contraste para impresión.
5.  Fondo: limpio, blanco puro, transparente, degradado suave o abstracto premium. NUNCA complejo, desordenado, ni con ruido visual.
6.  Iluminación que resalte texturas y forma del elemento principal.
7.  Material/finish si aplica (ej: metal pulido, esmalte brillante, seda suave, cuero envejecido, tinta de anime).
8.  Composición específica para impresión POD (ej: "centered full-front", "floating top", "side profile", "isometric view", "minimalist centered").
9.  Técnica recomendada:
    -   Productos textiles (hoodie, camiseta, bikini): Vector Art ultra crisp, sharp lines.
    -   Posters/Canvas: ilustración artística detallada, matte painting, digital painting.
    -   Tazas/Phone cases: minimal flat art, line art, simple graphic design.
10. Aspect ratio real del producto (proporción, ej: 1:1 para tazas, 2:3 para posters verticales, 16:9 para arte digital amplio).
11. Reglas negativas explícitas (Prohibiciones).

PROHIBICIONES explícitas a incluir en CADA prompt:
(no text, no signature, no watermark, no messy background, no blurry lines, no pixel borders, no busy pattern, no gradient banding, no AI noise, no weak watercolors, no copyrighted material, no gore, no explicit content)

Consideraciones adicionales:
- Los prompts deben ser concisos pero descriptivos, directos para el generador visual.
- La legibilidad debe ser óptima a 30-50cm de distancia.
- Prioriza diseños que se vean bien tanto en colores de fondo claros como oscuros (para las variantes A y B).`;

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
    Producto físico: ${request.product}
    Estilo visual: ${request.visualStyle}
    Buyer persona: ${request.buyerPersona}
    Emoción objetivo: ${request.emotionPurpose}
    Colores de marca: ${request.brandColors}
    Región de mercado: ${request.market}
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