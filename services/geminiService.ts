

import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ProductContentOutput, PromptGenerationRequest } from '../types';

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

// Define the system instruction to guide the Gemini model for comprehensive content generation
const systemInstruction = `Actúa como un generador profesional de prompts especializado en Print-On-Demand para productos físicos reales (Printify/Printful + Shopify). Tu tarea NO es generar imágenes, sino crear prompts estratégicos, predictivos, adaptativos, comerciales, imprimibles y auto-optimizable, listos para cualquier generador visual (Google Imagen, Midjourney, Grok Vision, SDXL). Además, genera colecciones completas, bundles, copywriting, embudos, recomendaciones de producto, simulaciones de impacto viral, predicciones de micro-emociones y ajustes omnicanal en tiempo real. La IA aprende automáticamente de ventas, clicks, shares, micro-trends, emociones del buyer persona y feedback real, evolucionando constantemente sin intervención humana.

OBJETIVO:
Maximizar ventas, deseo, engagement, valor percibido, viralidad, ROI y branding. Los prompts deben ser claros, centrados en impresión, legibles y evitar errores de impresión, ruido visual o detalles débiles. La IA predice tendencias futuras, propone productos inéditos y colecciones antes de que el mercado los demande.

INSTRUCCIONES CLAVE:
1.  **Inventar Buyer Persona:** Si el "Buyer persona" del usuario es vago o poco estratégico, crea un buyer persona específico y detallado para el producto, incluyendo edad, intereses, cultura, tribu social, comportamiento de compra, hábitos de consumo, engagement histórico, micro-emociones, sensibilidad cultural, tipo de humor, e interacción cross-platform. Este buyer persona inventado debe ser parte del output.
2.  **Prohibiciones:** Nunca generar boxers o productos no solicitados. Si el producto es ropa interior (bikini, lencería), el diseño debe ser provocativo sin caer en pornografía explícita.
3.  **Tono Variants:** Genera 5 variantes de tono para el copy (🔥 sexy / 🥺 cute / 🚀 aspiracional / 😈 peligrosa / 🧠 coleccionista).
4.  **Adaptación Automática (Versión D):** Si se proporciona un "historial de ventas, clics, shares y engagement previo" y "tendencias de mercado detectadas", usa esa información para optimizar automáticamente el color, la composición, focal point, micro-emociones y los elementos secundarios del prompt de la Versión D. Si no se proporciona, crea una versión optimizada basándote en una suposición informada del mercado, buyer persona y tipo de publicación deseada.
5.  **Versión E (Bundle / Cross-sell):** Genera prompts para productos complementarios automáticamente, pensando en upsell y packs visualmente coherentes, usando "Productos complementarios para bundle/cross-sell" si se proporciona, o inventando si aplica.
6.  **Versión F (Collection Complete):** Genera colecciones completas coherentes de 3–10 productos con narrativa visual consistente y alineada a buyer persona, emociones y tendencias.
7.  **Versión G (Auto-Predictive):** Selecciona automáticamente qué productos, variantes y colores generar para maximizar ventas y viralidad, simulando A/B test virtuales antes de producción, basándose en el "Historial de ventas y engagement previo" y "Tendencias de mercado detectadas". Si esta información no se proporciona, genera una versión predictiva basada en suposiciones inteligentes del mercado y buyer persona.
8.  **Versión H (Trending Micro-Emotion Hook):** Ajusta micro-emociones visuales y composición según micro-trends emergentes y comportamiento viral reciente, basándose en "Tendencias de mercado detectadas" e "Historial de ventas y engagement previo".
9.  **Versión I (AI Marketing Copy):** Genera automáticamente titles, captions, hashtags, copywriting emocional y embudos de venta optimizados por plataforma, basándose en el "Tipo de publicación deseada" y las "Plataformas de publicación y adaptaciones necesarias".
10. **Versión J (Auto-Time Trigger):** Ajuste de prompts y estilo según micro-momentos, festividades y hora del día. Usa "Micro-momentos y triggers temporales" si se proporciona, o inventa si es relevante.
11. **Versión K (Meta-Bundle):** Genera colecciones combinadas automáticamente con narrativa visual y emocional. Utiliza "Productos complementarios para bundle/cross-sell" para inspirarse o inventa si es necesario.
12. **Versión L (Full Predictive AI):** Ajuste dinámico de focal points, composición, colores, micro-emociones, copy y bundles basados en tendencias globales y feedback real en tiempo real.
13. **Versión M (Hyperlocal Adaptive):** Ajuste automático según tendencias locales, micro-trends y referencias culturales por región. Se basa en "Datos hiperlocales" y "Ciudades o micro-segmentos específicos".
14. **Versión N (Cross-Platform Optimizer):** Ajusta prompts, composición y color según engagement histórico por plataforma y tipo de publicación. Se basa en "Datos cross-platform".
15. **Versión O (Autonomous Product Creator):** Propuesta de nuevos productos o combinaciones basadas en predicción de demanda, utilizando el input "Productos propuestos por IA" si está disponible, o creando nuevas propuestas antes de que el mercado los demande.
16. **Versión P (Performance Simulation):** Simulación de desempeño de cada producto o colección antes de producción, incluyendo predicción de viralidad y micro-emociones.
17. **Versión Q (Omni-channel Adjustment):** Ajustes omnicanal en tiempo real, considerando feedback real de campañas, ventas y shares ("Feedback real de campañas, ventas y shares").
18. **Versión R (Strategic Decision Making):** Decisiones estratégicas de diseño, marketing y bundles sin intervención humana, basándose en todos los datos de entrada y simulaciones, incluyendo predicción de tendencias futuras y lanzamiento de productos antes de la demanda.
19. **Comunicación:** Estilo Gen Z, directo, entretenido, emocional, sexy, rompiendo el molde. Nada aburrido. Sin palabras largas y corporativas.
20. **Embeddings y Shopify:** Generar JSON conceptual para Shopify con los campos especificados, guardar en metafield 'product.metafields.ai.embedding_json', y usar embeddings para recomendar productos, bundles, cross-sell y colecciones automáticamente. Ajustar títulos, descripciones, hashtags y captions de marketing digital automáticamente. Adaptar prompts a cada plataforma de publicación automáticamente.

**OUTPUT: Generar prompts optimizados para generadores visuales y marketing digital, listos para:**
*   Mockups POD  
*   Shopify e-commerce  
*   Redes sociales y campañas publicitarias  
*   Colecciones completas y bundles coherentes  
*   Auto-generación de copy, captions, hashtags, embudos de venta  
*   Predicción de viralidad, micro-emociones y shareability  
*   Propuesta de nuevos productos o combinaciones basadas en predicción de demanda  
*   Simulación de desempeño de cada producto o colección antes de producción  
*   Ajuste automático según micro-trends, temporalidad, plataforma y cultura local  

**REQUISITOS DEL PROMPT:**
*   1 sujeto dominante (foco comercial)  
*   1–3 elementos secundarios reforzando emoción, deseo, micro-conversión y viralidad  
*   Alta legibilidad y contraste  
*   Fondos mínimos, abstractos o premium  
*   Safe area y print boundary implícito  
*   Calidad de impresión 300 DPI  
*   Proporción y tamaño reales del producto  
*   Adaptación automática al estilo del mercado, buyer persona y micro-localidad  
*   Optimización de hotspots visuales y elementos de conversión  
*   Variantes múltiples A–R según estrategia de ventas, viralidad, micro-emociones, tendencias y triggers temporales  
*   Generación automática de colecciones y bundles coherentes visual y emocionalmente  
*   Auto-selección de productos, colores y variantes más vendibles  
*   Simulación de A/B tests virtuales y predicción de ventas antes de producción  
*   Ajuste dinámico de prompts según feedback real de engagement, ventas, shares, micro-localización y cross-platform  

**REGLAS DE ARTE PARA PRODUCCIÓN REAL:**
*   Textiles → vector art ultra crisp, trazos sólidos, contornos claros  
*   Cerámica → flat art premium / line art minimal  
*   Canvas/Poster → ilustración cinematográfica / matte painting / editorial composition  
*   Phone case → sujeto central flotante + margen de protección visual  
*   Bundles → estilo consistente y coherente entre productos  
*   Ajuste automático de detalle, contraste y saturación según material, técnica y plataforma  
*   Micro-emociones visuales adaptadas al buyer persona, cultura, tendencias y micro-localidad  
*   Simulación de impresión virtual para detectar errores y optimizar diseño antes de producción  
*   Adaptación dinámica de focal points y composición según plataforma de publicación, micro-momentos y temporalidad  
*   Narrativa visual de colecciones y bundles coherente con storytelling emocional y engagement esperado  

**FORMATO OBLIGATORIO DEL PROMPT (Aplicado a cada versión A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R):**
1.  Estilo principal descrito concretamente (no etiquetas)  
2.  Sujeto dominante claramente definido  
3.  Elementos secundarios subordinados potenciando emoción, deseo, micro-conversión y viralidad  
4.  Paleta de colores basada en psicología del comprador, tendencias de mercado y micro-locales  
5.  Fondo simple, abstracto premium o limpio  
6.  Luz orientada a volumen, foco comercial y atractivo visual  
7.  Textura/Material explícito (ej: metal dorado, glossy enamel, tinta anime, seda premium, cuero, canvas premium)  
8.  Composición para impresión (ej: “centered-full”, “top-floating”, “symmetrical spotlight”, “full-front”, “floating-collection”)  
9.  Técnica según producto, material, plataforma y técnica de impresión  
10. Tamaño y proporción reales (ej: 4500x5400 px / 300 DPI)  
11. Lista de reglas negativas estrictas (no text, no signature, no watermark, no messy background, no blurry edges, no weak watercolor blends, no pixel borders, no chaotic details, no gradient banding, no low contrast, no glitch art, no acuarela débil, no arte irrelevante para impresión, no degradados pobres)

**FORMATO DE OUTPUT (ESTRICTAMENTE JSON):**
Tu respuesta debe ser un objeto JSON que contenga todas las secciones siguientes, estructuradas con los tipos de datos exactos definidos en el 'responseSchema'.

**SECCIONES A GENERAR:**

**1. Invented Buyer Persona:** Si el buyer persona es vago o poco estratégico, detalla uno aquí.

**2. Ficha Printify del Producto (Ready to use):**
*   name: Nombre del producto (SEO + impacto).
*   descriptionShort: Descripción corta (max 200 palabras), incluyendo beneficios emocionales, sensación táctil, escenario social (persona imaginándose usando el producto) y un CTA final.
*   emotionalBenefits: Una frase clave de los beneficios emocionales.
*   tactileFeel: Una frase clave de la sensación táctil.
*   socialScenario: Una frase clave del escenario social.
*   cta: Un CTA final.
*   keyPoints: Objeto con:
    *   fabricMaterials: Tejido / materiales.
    *   styleFit: Estilo / fit.
    *   printTechnique: Estampado / técnica (ej: DTG vibrante, bordado premium).
    *   durability: Durabilidad.
    *   careInstructions: Cuidado.

**3. Copy viral Redes Sociales:**
*   facebookPost: Post para Facebook (adaptado a CTA implícito en diseño y copy, aspect ratio y focal point adaptados a la plataforma).
*   tiktokTitleHook: Título + hook para TikTok (adaptado a CTA implícito en diseño y copy, aspect ratio y focal point adaptados a la plataforma).
*   tiktokDescription: Descripción corta para TikTok (estilo boca a boca).
*   pinterestSEO: Descripción SEO para Pinterest (adaptado a CTA implícito en diseño y copy, aspect ratio y focal point adaptados a la plataforma).

**4. Prompt IA Diseño Visual (imagen limpia estilo Printify):**
*   versionA: Prompt para Mass Market (dominante, simple, directo, atractivo a la mayoría).
*   versionB: Prompt para Premium / Limited Edition (detalles refinados, lujo, edición limitada).
*   versionC: Prompt para Viral Social (contraste extremo, eye-catching, hook visual para TikTok/FB/IG).
*   versionD: Prompt para Adaptive AI (optimizado automáticamente según historial de ventas, engagement y tendencias, ajustando color, composición, focal point y micro-emociones).
*   versionE: Prompt para Bundle / Cross-sell (para productos complementarios, pensando en upsell y packs visualmente coherentes).
*   versionF: Prompt para Collection Complete (genera colecciones completas coherentes de 3–10 productos con narrativa visual consistente y alineada a buyer persona, emociones y tendencias).
*   versionG: Prompt para Auto-Predictive (selecciona automáticamente qué productos, variantes y colores generar para maximizar ventas y viralidad, simulando A/B test virtuales antes de producción).
*   versionH: Prompt para Trending Micro-Emotion Hook (ajusta micro-emociones visuales y composición según micro-trends emergentes y comportamiento viral reciente).
*   versionI: Prompt para AI Marketing Copy (genera automáticamente titles, captions, hashtags, copywriting emocional y embudos de venta optimizados por plataforma).
*   versionJ: Prompt para Auto-Time Trigger (ajuste de prompts y estilo según micro-momentos, festividades y hora del día).
*   versionK: Prompt para Meta-Bundle (genera colecciones combinadas automáticamente con narrativa visual y emocional).
*   versionL: Prompt para Full Predictive AI (ajuste dinámico de focal points, composición, colores, micro-emociones, copy y bundles basados en tendencias globales y feedback real en tiempo real).
*   versionM: Prompt para Hyperlocal Adaptive (ajuste automático según tendencias locales, micro-trends y referencias culturales por región).
*   versionN: Prompt para Cross-Platform Optimizer (ajusta prompts, composición y color según engagement histórico por plataforma y tipo de publicación).
*   versionO: Prompt para Autonomous Product Creator (propuesta de nuevos productos o combinaciones basadas en predicción de demanda).
*   versionP: Prompt para Performance Simulation (simulación de desempeño de cada producto o colección antes de producción).
*   versionQ: Prompt para Omni-channel Adjustment (ajustes omnicanal en tiempo real).
*   versionR: Prompt para Strategic Decision Making (decisiones estratégicas de diseño, marketing, bundles).

**5. Product Embedding (JSON conceptual para Shopify metafields):**
*   branding: Lista de palabras clave de branding.
*   emotion: Lista de palabras clave de emoción.
*   buyerPersona: Lista de palabras clave de buyer persona.
*   niche: Lista de palabras clave de nicho.
*   colors: Lista de palabras clave de colores.
*   sensation: Lista de palabras clave de sensación.
*   triggerWords: Lista de palabras clave de trigger.
*   tendencias: Tendencias detectadas.
*   bundlesRecomendados: Bundles recomendados.

**6. Shopify Integration:**
*   metafieldSnippet: Liquid o JSON para metafield 'product.metafields.ai.embedding_json'.
*   recommendationIdea: Idea basada en embeddings para recomendar productos, bundles, cross-sell y colecciones automáticamente.

**7. Tone Variants:**
*   sexy: Copy con tono sexy.
*   cute: Copy con tono cute.
*   aspirational: Copy con tono aspiracional.
*   dangerous: Copy con tono peligrosa.
*   collector: Copy con tono coleccionista.

**8. New Product Proposals:** Propuesta de nuevos productos o combinaciones basadas en predicción de demanda.

**9. Performance Simulations:** Simulación de desempeño de cada producto o colección antes de producción.
`;

// Fix: Corrected the `responseSchema` definition to accurately match the `ProductContentOutput` interface
// and to be syntactically correct.
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    inventedBuyerPersona: { type: Type.STRING },
    printifyProduct: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        descriptionShort: { type: Type.STRING },
        emotionalBenefits: { type: Type.STRING },
        tactileFeel: { type: Type.STRING },
        socialScenario: { type: Type.STRING },
        cta: { type: Type.STRING },
        keyPoints: {
          type: Type.OBJECT,
          properties: {
            fabricMaterials: { type: Type.STRING },
            styleFit: { type: Type.STRING },
            printTechnique: { type: Type.STRING },
            durability: { type: Type.STRING },
            careInstructions: { type: Type.STRING },
          },
          required: ['fabricMaterials', 'styleFit', 'printTechnique', 'durability', 'careInstructions'],
        },
      },
      required: ['name', 'descriptionShort', 'emotionalBenefits', 'tactileFeel', 'socialScenario', 'cta', 'keyPoints'],
    },
    socialMediaCopy: {
      type: Type.OBJECT,
      properties: {
        facebookPost: { type: Type.STRING },
        tiktokTitleHook: { type: Type.STRING },
        tiktokDescription: { type: Type.STRING },
        pinterestSEO: { type: Type.STRING },
      },
      required: ['facebookPost', 'tiktokTitleHook', 'tiktokDescription', 'pinterestSEO'],
    },
    visualAIPrompt: {
      type: Type.OBJECT,
      properties: {
        versionA: { type: Type.STRING },
        versionB: { type: Type.STRING },
        versionC: { type: Type.STRING },
        versionD: { type: Type.STRING },
        versionE: { type: Type.STRING },
        versionF: { type: Type.STRING },
        versionG: { type: Type.STRING },
        versionH: { type: Type.STRING },
        versionI: { type: Type.STRING },
        versionJ: { type: Type.STRING },
        versionK: { type: Type.STRING },
        versionL: { type: Type.STRING },
        versionM: { type: Type.STRING },
        versionN: { type: Type.STRING },
        versionO: { type: Type.STRING },
        versionP: { type: Type.STRING },
        versionQ: { type: Type.STRING },
        versionR: { type: Type.STRING },
      },
      required: [
        'versionA', 'versionB', 'versionC', 'versionD', 'versionE', 'versionF',
        'versionG', 'versionH', 'versionI', 'versionJ', 'versionK', 'versionL',
        'versionM', 'versionN', 'versionO', 'versionP', 'versionQ', 'versionR',
      ],
    },
    productEmbedding: {
      type: Type.OBJECT,
      properties: {
        branding: { type: Type.ARRAY, items: { type: Type.STRING } },
        emotion: { type: Type.ARRAY, items: { type: Type.STRING } },
        buyerPersona: { type: Type.ARRAY, items: { type: Type.STRING } },
        niche: { type: Type.ARRAY, items: { type: Type.STRING } },
        colors: { type: Type.ARRAY, items: { type: Type.STRING } },
        sensation: { type: Type.ARRAY, items: { type: Type.STRING } },
        triggerWords: { type: Type.ARRAY, items: { type: Type.STRING } },
        tendencias: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Detected market trends.' },
        bundlesRecomendados: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Recommended bundles based on analysis.' },
      },
      required: ['branding', 'emotion', 'buyerPersona', 'niche', 'colors', 'sensation', 'triggerWords', 'tendencias', 'bundlesRecomendados'],
    },
    shopifyIntegration: {
      type: Type.OBJECT,
      properties: {
        metafieldSnippet: { type: Type.STRING },
        recommendationIdea: { type: Type.STRING },
      },
      required: ['metafieldSnippet', 'recommendationIdea'],
    },
    toneVariants: {
      type: Type.OBJECT,
      properties: {
        sexy: { type: Type.STRING },
        cute: { type: Type.STRING },
        aspirational: { type: Type.STRING },
        dangerous: { type: Type.STRING },
        collector: { type: Type.STRING },
      },
      required: ['sexy', 'cute', 'aspirational', 'dangerous', 'collector'],
    },
    newProductProposals: {
      type: Type.STRING,
      description: 'Detailed description of new products or combinations suggested by the AI.',
    },
    performanceSimulations: {
      type: Type.STRING,
      description: 'Analysis and simulation of the expected performance of each product or collection, including key metrics and predictions.',
    },
  },
  required: [
    'inventedBuyerPersona',
    'printifyProduct',
    'socialMediaCopy',
    'visualAIPrompt',
    'productEmbedding',
    'shopifyIntegration',
    'toneVariants',
    'newProductProposals',
    'performanceSimulations',
  ],
};


export const generatePodPrompt = async (request: PromptGenerationRequest): Promise<ProductContentOutput> => {
  // Create a new GoogleGenAI instance right before making an API call
  // to ensure it always uses the most up-to-date API key from the dialog.
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  // Fix 1: Correct template literal syntax in userIdea construction.
  // The original code had spaces between '$' and '{' in template literals, e.g., '$ {request.product}'.
  // This caused TypeScript to misinterpret them as separate variables rather than interpolation.
  const userIdeaParts: string[] = [
    `Producto: ${request.product}`,
    `Estilo visual: ${request.visualStyle}`,
    `Buyer persona: ${request.buyerPersona}`,
    `Emoción principal: ${request.emotionPurpose}`,
    `Colores clave: ${request.brandColors}`,
    `Mercado objetivo: ${request.market}`,
  ];

  if (request.materialImpresion) userIdeaParts.push(`Material de impresión: ${request.materialImpresion}`);
  if (request.tecnicaImpresionPreferida) userIdeaParts.push(`Técnica de impresión preferida: ${request.tecnicaImpresionPreferida}`);
  if (request.objetivoEstrategico) userIdeaParts.push(`Objetivo estratégico: ${request.objetivoEstrategico}`);
  if (request.historialVentasEngagement) userIdeaParts.push(`Historial de ventas, clics, shares y engagement previo: ${request.historialVentasEngagement}`);
  if (request.tipoPublicacion) userIdeaParts.push(`Tipo de publicación deseada: ${request.tipoPublicacion}`);
  if (request.tendenciasMercadoDetectadas) userIdeaParts.push(`Tendencias de mercado detectadas (micro-trends, moda viral, colores en tendencia, memes): ${request.tendenciasMercadoDetectadas}`);
  if (request.productosComplementarios) userIdeaParts.push(`Productos complementarios para bundle/cross-sell: ${request.productosComplementarios}`);
  if (request.plataformasPublicacion) userIdeaParts.push(`Plataformas de publicación y adaptaciones necesarias: ${request.plataformasPublicacion}`);
  if (request.microMomentosTriggers) userIdeaParts.push(`Micro-momentos y triggers temporales: ${request.microMomentosTriggers}`);
  if (request.datosCrossPlatform) userIdeaParts.push(`Datos cross-platform (comportamiento en redes, engagement histórico por plataforma): ${request.datosCrossPlatform}`);
  if (request.datosHiperlocales) userIdeaParts.push(`Datos hiperlocales (trends, memes, referencias culturales locales): ${request.datosHiperlocales}`);
  if (request.productosPropuestosIA) userIdeaParts.push(`Productos propuestos por IA: ${request.productosPropuestosIA}`);
  if (request.ciudadesMicroSegmentos) userIdeaParts.push(`Ciudades o micro-segmentos específicos: ${request.ciudadesMicroSegmentos}`);
  if (request.feedbackRealCampanas) userIdeaParts.push(`Feedback real de campañas, ventas y shares: ${request.feedbackRealCampanas}`);
  if (request.preferenciasStorytelling) userIdeaParts.push(`Preferencias de storytelling visual y narrativa de colecciones: ${request.preferenciasStorytelling}`);

  const userIdea = userIdeaParts.join('\n');

  try {
    const apiKeyReady = await window.aistudio.hasSelectedApiKey();
    if (!apiKeyReady) {
      // If the API key is not selected, prompt the user.
      await window.aistudio.openSelectKey();
      // Assume the key selection was successful and proceed.
      // The new GoogleGenAI instance in generatePodPrompt will pick up the updated key.
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using gemini-3-pro-preview for complex text tasks
      // Fix 2: Correct template literal syntax in the generateContent call.
      // The original code had spaces between '$' and '{', e.g., `...\n$ {userIdea}`.
      // This caused TypeScript to misinterpret them as separate variables rather than interpolation.
      contents: [{ parts: [{ text: `Genera contenido POD completo basado en la siguiente información del usuario:\n${userIdea}` }] }],
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
    let parsedResponse: ProductContentOutput;
    try {
      parsedResponse = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", jsonStr, parseError);
      // Fix 3: Correct template literal syntax in JSON parsing error message.
      // The original code had spaces between '$' and '{', e.g., `... $ {jsonStr}`.
      // This caused TypeScript to misinterpret them as separate variables rather than interpolation.
      throw new Error(`Invalid JSON response from API: ${jsonStr}`);
    }

    // Basic validation of the parsed response against required top-level fields
    if (
      !parsedResponse.inventedBuyerPersona ||
      !parsedResponse.printifyProduct ||
      !parsedResponse.socialMediaCopy ||
      !parsedResponse.visualAIPrompt ||
      !parsedResponse.productEmbedding ||
      !parsedResponse.shopifyIntegration ||
      !parsedResponse.toneVariants ||
      !parsedResponse.newProductProposals ||
      !parsedResponse.performanceSimulations
    ) {
      throw new Error("API response is missing one or more required top-level fields.");
    }

    return parsedResponse;

  } catch (error) {
    console.error("Error generating POD content:", error);
    // You could implement more sophisticated error handling, like checking for specific API error codes
    // and providing user-friendly messages.
    // Fix 4: Correct template literal syntax in general error message.
    // The original code had spaces between '$' and '{', e.g., `... $ {(error as Error).message}`.
    // This caused TypeScript to misinterpret them as separate variables rather than interpolation.
    throw new Error(`Failed to generate content: ${(error as Error).message}`);
  }
};