import React, { useState, useCallback, useEffect } from 'react';
import { generatePodPrompt } from '../services/geminiService';
import { GeneratedPromptOutput, PromptGenerationRequest } from '../types';
import LoadingSpinner from './LoadingSpinner';
import CopyButton from './CopyButton';

const PromptGenerator: React.FC = () => {
  const [product, setProduct] = useState<string>('');
  const [visualStyle, setVisualStyle] = useState<string>('');
  const [buyerPersona, setBuyerPersona] = useState<string>('');
  const [emotionPurpose, setEmotionPurpose] = useState<string>('');
  const [brandColors, setBrandColors] = useState<string>('');
  const [market, setMarket] = useState<string>('');

  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedPromptOutput | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkApiKey = useCallback(async (): Promise<boolean> => {
    if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.hasSelectedApiKey === 'function') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
        return true; // Assume success and proceed.
      }
      return true; // Key already selected.
    }
    return true;
  }, []);

  const handleGeneratePrompt = useCallback(async () => {
    if (!product.trim() || !visualStyle.trim() || !buyerPersona.trim() || !emotionPurpose.trim() || !brandColors.trim() || !market.trim()) {
      setError('Por favor, completa todos los campos para generar el prompt.');
      return;
    }

    setError(null);
    setLoading(true);
    setGeneratedPrompt(null);

    const request: PromptGenerationRequest = {
      product,
      visualStyle,
      buyerPersona,
      emotionPurpose,
      brandColors,
      market,
    };

    try {
      const apiKeyReady = await checkApiKey();
      if (!apiKeyReady) {
        setError('Por favor, selecciona una clave API para continuar.');
        setLoading(false);
        return;
      }

      const result = await generatePodPrompt(request);
      setGeneratedPrompt(result);
    } catch (err: any) {
      console.error("Failed to generate prompt:", err);
      if (err.message && err.message.includes("Requested entity was not found.")) {
        setError('Error con la clave API. Por favor, selecciona tu clave API de nuevo. Asegúrate de usar una clave de un proyecto de GCP con facturación activada.');
        if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.openSelectKey === 'function') {
          await window.aistudio.openSelectKey();
        }
      } else {
        setError(err.message || 'Ocurrió un error al generar el prompt. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }, [product, visualStyle, buyerPersona, emotionPurpose, brandColors, market, checkApiKey]);

  useEffect(() => {
    // Initial check for API key if user interaction is expected early
    // For this specific use case, it's handled on button click for robustness.
  }, []);

  const renderPromptSection = (title: string, promptText: string): React.JSX.Element => (
    <div className="mb-6">
      <h3 className="text-xl font-bold text-gray-800 flex items-center mb-2">
        <span className="text-indigo-600 mr-2">▶️</span> {title}:
        <CopyButton textToCopy={promptText} />
      </h3>
      <pre className="whitespace-pre-wrap font-mono text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200">
        {promptText}
      </pre>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">Producto específico:</label>
          <input
            type="text"
            id="product"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: hoodie, taza, bikini, poster"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="visualStyle" className="block text-sm font-medium text-gray-700 mb-1">Estilo visual:</label>
          <input
            type="text"
            id="visualStyle"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: cubano retro, cyberpunk minimal, luxury gold"
            value={visualStyle}
            onChange={(e) => setVisualStyle(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="buyerPersona" className="block text-sm font-medium text-gray-700 mb-1">Buyer persona:</label>
          <input
            type="text"
            id="buyerPersona"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: hombres 25+, gamers, madres"
            value={buyerPersona}
            onChange={(e) => setBuyerPersona(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="emotionPurpose" className="block text-sm font-medium text-gray-700 mb-1">Emoción/Propósito:</label>
          <input
            type="text"
            id="emotionPurpose"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: deseo, humor, nostalgia, motivación"
            value={emotionPurpose}
            onChange={(e) => setEmotionPurpose(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="brandColors" className="block text-sm font-medium text-gray-700 mb-1">Colores de marca:</label>
          <input
            type="text"
            id="brandColors"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: azul cielo, rojo vibrante, dorado"
            value={brandColors}
            onChange={(e) => setBrandColors(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="market" className="block text-sm font-medium text-gray-700 mb-1">Mercado:</label>
          <input
            type="text"
            id="market"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: EEUU, EU, LATAM"
            value={market}
            onChange={(e) => setMarket(e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={handleGeneratePrompt}
        disabled={loading}
        className="w-full sm:w-auto px-8 py-3 bg-indigo-700 text-white font-bold rounded-lg shadow-md hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition duration-300 ease-in-out text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Generando...' : 'Generar Prompts POD'}
      </button>

      {loading && <LoadingSpinner />}

      {error && !loading && !generatedPrompt && (
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

      {generatedPrompt && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-8 space-y-6">
          {renderPromptSection("PROMPT Principal", generatedPrompt.mainPrompt)}
          {renderPromptSection("PROMPT Alternativo A (para productos claros)", generatedPrompt.altPromptA)}
          {renderPromptSection("PROMPT Alternativo B (para productos oscuros)", generatedPrompt.altPromptB)}
        </div>
      )}
    </div>
  );
};

export default PromptGenerator;