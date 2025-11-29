export interface PromptGenerationRequest {
  product: string;
  visualStyle: string;
  buyerPersona: string;
  emotionPurpose: string;
  brandColors: string;
  market: string;
}

export interface GeneratedPromptOutput {
  mainPrompt: string;
  altPromptA: string;
  altPromptB: string;
}