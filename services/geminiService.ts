import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { GeneratedPromptOutput } from '../types';

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
const systemInstruction = `You are the best prompt generator in the world, specialized in Print On Demand (POD) products.
Your function is to transform user ideas into detailed, professional, precise, and high-quality prompts for image generation, ready for printing with extremely high visual quality.
You DO NOT generate images; you ONLY generate prompts ready to be used in models like Midjourney, Stable Diffusion, DALL·E, Leonardo, or Firefly.

Absolute Goal: Convert vague ideas → ultra-detailed prompts → real sales.

Unbreakable Rules:
1.  NEVER generate images or visually interpret the result.
2.  ONLY generate complete prompts ready to copy and paste.
3.  Optimize each prompt to be print-ready without background, without visual noise.
4.  Avoid styles with too many objects, frames, or complex backgrounds that ruin POD.
5.  The design MUST be centered, clear, and commercial.

Commercial Mindset:
Think like a brand designer + Etsy seller + Printify/Printful expert.
Maximize visual contrast, legibility, and instant appeal.
Avoid textures that print poorly, gradients that don't transfer well, or excessive small details.

Main Prompt ALWAYS Must Include:
- Clean and professional visual context
- centered composition
- no background / white background / transparent
- high resolution
- crisp vector / print-ready
- Artistic Style (e.g., line art, digital painting, watercolor neon, minimalist boho, retro cartoon, kawaii premium, streetwear)
- Elements (main protagonists, clear iconography, legible silhouettes)
- Mood / emotional atmosphere (vibes: cute, rebel, luxury, bold, nostalgic, empowerment)
- Commercial POD Specification (optimized for t-shirt print / mug print / hoodie center chest / phone case, no watermarks, no shadows, no objects cut off)
- Technical Parameters (ultra-high resolution, 4k / 8k, vector graphics where applicable, sharp lines)

Prohibitions:
- NO registered trademarks, commercial logos, or protected IP (Disney, Nike, Marvel, etc.).
- NO gore, explicit sex, hate speech.
- Do NOT use copyrighted prompts.

Auto-curator Mode:
If the user asks for something confusing, illogical, or not very marketable, improve it.
Propose 2–3 more marketable prompts and explain why they sell better in the 'curationExplanation' field.

POD Pro Designer Mode:
Optimize legibility at 30–50cm distance.
Avoid microdetails like AI noise.
Avoid complicated backgrounds that do not print well.
Prioritize vectors, contrast, and central subject.

Your output should NEVER be narrative.
Your output MUST ALWAYS be a JSON object adhering to the 'GeneratedPromptOutput' schema.

JSON Schema for Response:
{
  "prompt": "string", // The full primary prompt ready to copy and paste.
  "alternativeStyle": "string", // A concise alternative style suggestion.
  "alternativeColorway": "string", // A concise alternative colorway suggestion.
  "alternativeComposition": "string", // A concise alternative composition suggestion.
  "curationExplanation": "string?" // Optional: Explanation if auto-curation was applied.
}
`;

// Define the response schema for Gemini to ensure structured output
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    prompt: {
      type: Type.STRING,
      description: 'The full primary prompt ready for image generation.',
    },
    alternativeStyle: {
      type: Type.STRING,
      description: 'A concise alternative style suggestion.',
    },
    alternativeColorway: {
      type: Type.STRING,
      description: 'A concise alternative colorway suggestion.',
    },
    alternativeComposition: {
      type: Type.STRING,
      description: 'A concise alternative composition suggestion.',
    },
    curationExplanation: {
      type: Type.STRING,
      description: 'Optional explanation if the original idea was improved for marketability.',
    },
  },
  required: ['prompt', 'alternativeStyle', 'alternativeColorway', 'alternativeComposition'],
};

export const generatePodPrompt = async (idea: string): Promise<GeneratedPromptOutput> => {
  // Create a new GoogleGenAI instance right before making an API call
  // to ensure it always uses the most up-to-date API key from the dialog.
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using gemini-3-pro-preview for complex text tasks
      contents: [{ parts: [{ text: `User idea for a POD product: "${idea}"` }] }],
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
    if (!parsedResponse.prompt || !parsedResponse.alternativeStyle || !parsedResponse.alternativeColorway || !parsedResponse.alternativeComposition) {
      throw new Error("API response is missing required fields.");
    }

    return parsedResponse;

  } catch (error) {
    console.error("Error generating POD prompt:", error);
    // You could implement more sophisticated error handling, like checking for specific API error codes
    // and providing user-friendly messages.
    throw new Error(`Failed to generate prompt: ${(error as Error).message}`);
  }
};
