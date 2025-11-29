export interface GeneratedPromptOutput {
  prompt: string;
  alternativeStyle: string;
  alternativeColorway: string;
  alternativeComposition: string;
  curationExplanation?: string;
}

export interface PromptGenerationRequest {
  idea: string;
}