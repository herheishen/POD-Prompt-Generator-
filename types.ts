

export interface PromptGenerationRequest {
  product: string; // (hoodie, taza, bikini, canvas, phone case, sticker, tote, bundle completo, colección, productos sugeridos por IA)
  visualStyle: string; // (cubano retro, luxury gold, anime neon, vaporwave premium, kawaii kids, cyber latina, futurista, minimal, maximalist)
  buyerPersona: string; // (edad, intereses, cultura, tribu social, comportamiento de compra, hábitos, engagement histórico, micro-emociones, sensibilidad cultural, tipo de humor, interacción cross-platform, micro-localización)
  emotionPurpose: string; // (humor provocador, sensualidad premium, nostalgia, familia, aventura, motivación, deseo, high shareability, viral hook, triggers psicológicos)
  brandColors: string; // (hex o referencias)
  market: string; // (US, EU, LATAM, JP, ciudades o micro-segmentos específicos)
  historialVentasEngagement?: string; // Optional: detailed sales, clicks, shares, and engagement history, including feedback real
  tipoPublicacion?: string; // Optional: e-commerce product, TikTok hook, FB ad, Instagram story, Pinterest pin, Shorts, Reels, YouTube Shorts, Meta Shops
  materialImpresion?: string; // New: Material de impresión (algodón, poliéster, cerámica, metal, glossy, canvas, cuero, seda, resina, papel fotográfico premium)
  tecnicaImpresionPreferida?: string; // New: Técnica de impresión preferida (sublimación, DTG, UV print, offset, screen print, serigrafía, foil)
  tendenciasMercadoDetectadas?: string; // Optional: detected market trends (micro-trends, viral fashion, trending colors, memes, events culturales, seasonal trends)
  productosComplementarios?: string; // Optional: complementary products for bundle/cross-sell
  plataformasPublicacion?: string; // New: Platforms for publication and necessary adaptations
  objetivoEstrategico?: string; // New: Strategic objective (ventas, viralidad, branding, premium, mass-market, colecciones, ROI, retención, repetición de compra)
  microMomentosTriggers?: string; // New: Micro-moments and temporal triggers (events, festivities, schedules, recent viral trends)
  datosCrossPlatform?: string; // New: Cross-platform data (social behavior, engagement historical per platform)
  datosHiperlocales?: string; // New: Hyperlocal data (trends, memes, local cultural references)
  productosPropuestosIA?: string; // New: AI-proposed products or combinations
  ciudadesMicroSegmentos?: string; // New: Specific cities or micro-segments
  feedbackRealCampanas?: string; // New: Real feedback from campaigns, sales, and shares
  preferenciasStorytelling?: string; // New: Visual storytelling preferences and collection narrative
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
  versionM: string; // New: Hyperlocal Adaptive
  versionN: string; // New: Cross-Platform Optimizer
  versionO: string; // New: Autonomous Product Creator (Propuesta de nuevos productos o combinaciones)
  versionP: string; // New: Performance Simulation (Simulación de desempeño)
  versionQ: string; // New: Omni-channel Adjustment (Ajustes omnicanal en tiempo real)
  versionR: string; // New: Strategic Decision Making (Decisiones estratégicas de diseño, marketing, bundles)
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
  newProductProposals: string; // New: Proposed new products or combinations
  performanceSimulations: string; // New: Performance simulation for products/collections
}