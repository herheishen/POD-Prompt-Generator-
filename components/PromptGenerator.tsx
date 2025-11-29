


import React, { useState, useCallback } from 'react';
import { generatePodPrompt } from '../services/geminiService';
import { ProductContentOutput, PromptGenerationRequest } from '../types';
import LoadingSpinner from './LoadingSpinner';
import CopyButton from './CopyButton';

const PromptGenerator: React.FC = () => {
  const [baseIdea, setBaseIdea] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<ProductContentOutput | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateContent = useCallback(async () => {
    if (!baseIdea.trim()) {
      setError('Por favor, introduce tu "Idea Base" para generar el contenido.');
      return;
    }

    setError(null);
    setLoading(true);
    setGeneratedContent(null);

    const request: PromptGenerationRequest = {
      baseIdea: baseIdea,
    };

    try {
      // API Key Selection check (simplified as all models are now standard)
      if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setError('Por favor, selecciona una clave API para continuar.');
          await window.aistudio.openSelectKey();
          // Assume success after openSelectKey and let the next call proceed.
          // The new GoogleGenAI instance in generatePodPrompt will pick up the updated key.
        }
      } else {
        console.warn("window.aistudio not available. API Key selection might be skipped.");
      }

      const result = await generatePodPrompt(request);
      setGeneratedContent(result);
    } catch (err: any) {
      console.error("Failed to generate content:", err);
      if (err.message && err.message.includes("Requested entity was not found.")) {
        setError('Error con la clave API. Por favor, selecciona tu clave API de nuevo. Asegúrate de usar una clave de un proyecto de GCP con facturación activada.');
        if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.openSelectKey === 'function') {
          await window.aistudio.openSelectKey();
        }
      } else if (err.message && err.message.includes("API_KEY environment variable is not set.")) {
        setError('API Key no encontrada. Asegúrate de que tu entorno de ejecución la proporciona. Si estás en AI Studio, por favor, selecciona una clave API.');
        if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.openSelectKey === 'function') {
          await window.aistudio.openSelectKey();
        }
      } else {
        setError(err.message || 'Ocurrió un error al generar el contenido. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }, [baseIdea]);

  const renderSection = (title: string, content: string | React.JSX.Element, copyText?: string): React.JSX.Element => (
    <div className="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 flex items-center mb-2">
        <span className="text-indigo-600 mr-2">📌</span> {title}
        {copyText && <CopyButton textToCopy={copyText} />}
      </h3>
      <div className="whitespace-pre-wrap font-mono text-gray-700">
        {content}
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-200">
      <div className="mb-6">
        <label htmlFor="baseIdea" className="block text-sm font-bold text-gray-800 mb-1">
          Idea Base (¡MANDATORIO!):
        </label>
        <textarea
          id="baseIdea"
          className="w-full p-2 border border-indigo-400 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-lg"
          rows={3}
          placeholder="Ej: 'Diseño de camiseta con loro cubano sexy', 'Taza con frase motivadora para freelancers'"
          value={baseIdea}
          onChange={(e) => setBaseIdea(e.target.value)}
        />
      </div>

      <button
        onClick={handleGenerateContent}
        disabled={loading || !baseIdea.trim()}
        className="w-full sm:w-auto px-8 py-3 bg-indigo-700 text-white font-bold rounded-lg shadow-md hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition duration-300 ease-in-out text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Generando Contenido POD...' : 'Generar Contenido POD'}
      </button>

      {loading && <LoadingSpinner />}

      {error && !loading && !generatedContent && (
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

      {generatedContent && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-8 space-y-6">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">Output Generado por IA:</h2>

          {renderSection("1) Análisis breve del concepto", generatedContent.conceptAnalysis, generatedContent.conceptAnalysis)}
          {renderSection(
            "2) Marca + Slogan",
            <>
              <p><strong>Marca:</strong> {generatedContent.brandSlogan.brand}</p>
              <p><strong>Slogan:</strong> {generatedContent.brandSlogan.slogan}</p>
            </>,
            `Marca: ${generatedContent.brandSlogan.brand}\nSlogan: ${generatedContent.brandSlogan.slogan}`
          )}
          {renderSection("3) Nicho objetivo real", generatedContent.nicheTarget, generatedContent.nicheTarget)}
          {renderSection("4) Buyer Persona resumido", generatedContent.buyerPersonaSummary, generatedContent.buyerPersonaSummary)}
          {renderSection(
            "5) 3 propuestas de diseño POD",
            <>
              {generatedContent.designProposals.map((proposal, index) => (
                <div key={index} className="mb-3 p-3 bg-gray-100 rounded-md border border-gray-200">
                  <p className="font-semibold text-gray-800">Propuesta {index + 1}: {proposal.name}</p>
                  <p className="text-gray-700">{proposal.description}</p>
                </div>
              ))}
            </>,
            JSON.stringify(generatedContent.designProposals, null, 2)
          )}
          {renderSection(
            "6) Estilo visual (colores, composición, tendencia)",
            <>
              <p><strong>Colores:</strong> {generatedContent.visualStyleOutput.colors.join(', ')}</p>
              <p><strong>Composición:</strong> {generatedContent.visualStyleOutput.composition}</p>
              <p><strong>Tendencia:</strong> {generatedContent.visualStyleOutput.trend}</p>
            </>,
            JSON.stringify(generatedContent.visualStyleOutput, null, 2)
          )}
          {renderSection("7) Prompt para imagen IA (para generar mockups)", generatedContent.aiImagePrompt, generatedContent.aiImagePrompt)}
          {renderSection("8) Prompt para video promocional short-form (TikTok/Reels)", generatedContent.aiVideoPrompt, generatedContent.aiVideoPrompt)}
          {renderSection("9) Copy de venta optimizado para eCommerce", generatedContent.ecommerceSalesCopy, generatedContent.ecommerceSalesCopy)}
          {renderSection(
            "10) Hashtags y CTA",
            <>
              <p><strong>Hashtags:</strong> {generatedContent.hashtagsCTA.hashtags.join(', ')}</p>
              <p><strong>CTA:</strong> {generatedContent.hashtagsCTA.cta}</p>
            </>,
            `Hashtags: ${generatedContent.hashtagsCTA.hashtags.join(', ')}\nCTA: ${generatedContent.hashtagsCTA.cta}`
          )}
        </div>
      )}
    </div>
  );
};

export default PromptGenerator;