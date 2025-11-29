import React, { useState, useCallback, useEffect } from 'react';
import { generatePodPrompt } from '../services/geminiService';
import { GeneratedPromptOutput } from '../types';
import LoadingSpinner from './LoadingSpinner';
import CopyButton from './CopyButton';

const PromptGenerator: React.FC = () => {
  const [idea, setIdea] = useState<string>('');
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedPromptOutput | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to check API key selection for Veo models, reused for general Gemini API usage if needed.
  // Although not strictly necessary for gemini-3-pro-preview in all environments,
  // it's good practice for general API integration in AISTudio.
  const checkApiKey = useCallback(async (): Promise<boolean> => {
    if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.hasSelectedApiKey === 'function') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        // If no key is selected, prompt the user.
        // Assume selection is successful after triggering the dialog.
        await window.aistudio.openSelectKey();
        return true; // Assume success and proceed.
      }
      return true; // Key already selected.
    }
    // If aistudio is not available, assume API_KEY is set via environment variable.
    // This part depends on the deployment environment.
    return true;
  }, []);

  const handleGeneratePrompt = useCallback(async () => {
    if (!idea.trim()) {
      setError('Por favor, ingresa una idea para generar el prompt.');
      return;
    }

    setError(null);
    setLoading(true);
    setGeneratedPrompt(null);

    try {
      // Ensure API key is selected before making the call
      const apiKeyReady = await checkApiKey();
      if (!apiKeyReady) {
        setError('Por favor, selecciona una clave API para continuar.');
        setLoading(false);
        return;
      }

      const result = await generatePodPrompt(idea);
      setGeneratedPrompt(result);
    } catch (err: any) {
      console.error("Failed to generate prompt:", err);
      // Check for specific error message related to API key for AISTudio environment
      if (err.message && err.message.includes("Requested entity was not found.")) {
        setError('Error con la clave API. Por favor, selecciona tu clave API de nuevo. Asegúrate de usar una clave de un proyecto de GCP con facturación activada.');
        if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.openSelectKey === 'function') {
          // Re-open key selection on API key related error
          await window.aistudio.openSelectKey();
        }
      } else {
        setError(err.message || 'Ocurrió un error al generar el prompt. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }, [idea, checkApiKey]); // Ensure checkApiKey is in dependency array

  useEffect(() => {
    // Optionally check API key on mount, but better to do it before the actual API call
    // as per Veo guidance to avoid race conditions and ensure latest key usage.
    // We do the check in handleGeneratePrompt for robustness.
  }, []);

  // Fix: Explicitly qualify JSX.Element with React.JSX.Element
  const formatPromptOutput = (output: GeneratedPromptOutput): React.JSX.Element => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-8 space-y-4">
      {output.curationExplanation && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 text-yellow-800">
          <p className="font-semibold">💡 Mejora sugerida:</p>
          <p>{output.curationExplanation}</p>
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold text-gray-800 flex items-center mb-2">
          <span className="text-indigo-600 mr-2">▶️</span> PROMPT (para IA):
          <CopyButton textToCopy={output.prompt} />
        </h3>
        <pre className="whitespace-pre-wrap font-mono text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200">
          {output.prompt}
        </pre>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-2">
          <span className="text-indigo-600 mr-2">🛠️</span> OPCIONES:
        </h3>
        <ul className="list-none space-y-2">
          <li className="flex items-center">
            <span className="font-medium text-gray-700">- estilo alternativo:</span>
            <span className="ml-2 text-gray-600">{output.alternativeStyle}</span>
            <CopyButton textToCopy={output.alternativeStyle} />
          </li>
          <li className="flex items-center">
            <span className="font-medium text-gray-700">- colorway alternativo:</span>
            <span className="ml-2 text-gray-600">{output.alternativeColorway}</span>
            <CopyButton textToCopy={output.alternativeColorway} />
          </li>
          <li className="flex items-center">
            <span className="font-medium text-gray-700">- composición alternativa:</span>
            <span className="ml-2 text-gray-600">{output.alternativeComposition}</span>
            <CopyButton textToCopy={output.alternativeComposition} />
          </li>
        </ul>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}
      {error && error.includes('clave API') && (
        <p className="text-sm text-gray-600 mt-2">
          Para más información sobre la facturación, visita:{" "}
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
            ai.google.dev/gemini-api/docs/billing
          </a>
        </p>
      )}
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-200">
      <div className="mb-6">
        <label htmlFor="podIdea" className="block text-xl font-semibold text-gray-700 mb-3">
          Tu idea para el producto Print On Demand:
        </label>
        <textarea
          id="podIdea"
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ease-in-out resize-y min-h-[100px] text-lg"
          placeholder="Ej: Un gato espacial kawaii comiendo pizza, diseño para camiseta."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          rows={4}
        />
      </div>

      <button
        onClick={handleGeneratePrompt}
        disabled={loading}
        className="w-full sm:w-auto px-8 py-3 bg-indigo-700 text-white font-bold rounded-lg shadow-md hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition duration-300 ease-in-out text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Generando...' : 'Generar Prompt POD'}
      </button>

      {loading && <LoadingSpinner />}

      {error && !loading && !generatedPrompt && ( // Show error only if not loading and no prompt was generated yet
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-8" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
          {error.includes('clave API') && (
            <p className="text-sm text-gray-600 mt-2">
              Para más información sobre la facturación, visita:{" "}
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                ai.google.dev/gemini-api/docs/billing
              </a>
            </p>
          )}
        </div>
      )}

      {generatedPrompt && formatPromptOutput(generatedPrompt)}
    </div>
  );
};

export default PromptGenerator;