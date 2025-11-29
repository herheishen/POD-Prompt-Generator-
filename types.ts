

export interface PromptGenerationRequest {
  baseIdea: string; // Mandatory base idea for autonomous generation
}

export interface DesignProposal {
  name: string;
  description: string;
}

export interface VisualStyleOutput {
  colors: string[];
  composition: string;
  trend: string;
}

export interface HashtagsCTA {
  hashtags: string[];
  cta: string;
}

// Redefined: Comprehensive output for the autonomous POD content generator
export interface ProductContentOutput {
  conceptAnalysis: string;
  brandSlogan: {
    brand: string;
    slogan: string;
  };
  nicheTarget: string;
  buyerPersonaSummary: string;
  designProposals: DesignProposal[]; // 3 proposals
  visualStyleOutput: VisualStyleOutput;
  aiImagePrompt: string;
  aiVideoPrompt: string;
  ecommerceSalesCopy: string;
  hashtagsCTA: HashtagsCTA;
}