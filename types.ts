

export interface PromptGenerationRequest {
  product: string; // (hoodie, taza, bikini, canvas, phone case, sticker, tote, bundle completo, colección)
  visualStyle: string; // (cubano retro, luxury gold, anime neon, vaporwave premium, kawaii kids, cyber latina)
  buyerPersona: string; // (edad, intereses, cultura, tribu social, comportamiento de compra, hábitos, engagement histórico, micro-emociones, sensibilidad cultural, tipo de humor)
  emotionPurpose: string; // (humor provocador, sensualidad premium, nostalgia, familia, aventura, motivación, deseo, high shareability)
  brandColors: string; // (hex o referencias)
  market: string; // (US, EU, LATAM, JP)
  historialVentasEngagement?: string; // Optional: detailed sales, clicks, shares, and engagement history, including feedback real
  tipoPublicacion?: string; // Optional: e-commerce product, TikTok hook, FB ad, Instagram story, Pinterest pin, Shorts
  materialImpresion?: string; // New: Material de impresión (algodón, poliéster, cerámica, metal, glossy, canvas, cuero, seda)
  tecnicaImpresionPreferida?: string; // New: Técnica de impresión preferida (sublimación, DTG, UV print, offset, screen print)
  tendenciasMercadoDetectadas?: string; // Optional: detected market trends (micro-trends, viral fashion, trending colors, memes)
  productosComplementarios?: string; // Optional: complementary products for bundle/cross-sell
  plataformasPublicacion?: string; // New: Platforms for publication and necessary adaptations
  objetivoEstrategico?: string; // New: Strategic objective (ventas, viralidad, branding, premium, mass-market)
  microMomentosTriggers?: string; // New: Micro-moments and temporal triggers (events, festivities, schedules, recent viral trends)
}

export interface PrintifyProduct {
  name: string;
  descriptionShort: string;
  emotionalBenefits: string;
  tactileFeel: string;
  socialScenario: string;
  cta: string;
  keyPoints: {
    fabricMaterials: string;
    styleFit: string;
    printTechnique: string;
    durability: string;
    careInstructions: string;
  };
}

export interface SocialMediaCopy {
  facebookPost: string;
  tiktokTitleHook: string;
  tiktokDescription: string;
  pinterestSEO: string;
}

export interface VisualAIPrompt {
  versionA: string; // Mass Market
  versionB: string; // Premium / Limited
  versionC: string; // Viral Social
  versionD: string; // Adaptive AI
  versionE: string; // New: Bundle / Cross-sell
  versionF: string; // New: Collection Complete
  versionG: string; // New: Auto-Predictive
  versionH: string; // New: Trending Micro-Emotion Hook
  versionI: string; // New: AI Marketing Copy
  versionJ: string; // New: Auto-Time Trigger
  versionK: string; // New: Meta-Bundle
  versionL: string; // New: Full Predictive AI
}

export interface ProductEmbedding {
  branding: string[];
  emotion: string[];
  buyerPersona: string[];
  niche: string[];
  colors: string[];
  sensation: string[];
  triggerWords: string[];
  tendencias: string[]; // New: Detected trends
  bundlesRecomendados: string[]; // New: Recommended bundles
}

export interface ShopifyIntegration {
  metafieldSnippet: string; // Liquid or JSON for metafield
  recommendationIdea: string; // Idea based on embeddings
}

export interface ProductContentOutput {
  inventedBuyerPersona: string; // If AI invents/refines it
  printifyProduct: PrintifyProduct;
  socialMediaCopy: SocialMediaCopy;
  visualAIPrompt: VisualAIPrompt;
  productEmbedding: ProductEmbedding;
  shopifyIntegration: ShopifyIntegration;
  toneVariants: {
    sexy: string;
    cute: string;
    aspirational: string;
    dangerous: string;
    collector: string;
  };
}