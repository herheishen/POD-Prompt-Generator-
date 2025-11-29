import React, { useState, useCallback } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { generateGeminiTaskResponse } from '../services/geminiTaskService';
import { GeminiTaskRequest, GeminiModelType } from '../types';

const GeminiTask: React.FC = () => {
  const [taskPrompt, setTaskPrompt] = useState<string>('');
  const [modelType, setModelType] = useState<GeminiModelType>(GeminiModelType.Fast);
  const [enableDeepThinking, setEnableDeepThinking] = useState<boolean>(false); // New state for deep thinking
  const [responseText, setResponseText] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateResponse = useCallback(async () => {
    if (!taskPrompt.trim()) {
      setError('Por favor, introduce un prompt para la tarea.');
      return;
    }

    setError(null);
    setLoading(true);
    setResponseText(null);

    const request: GeminiTaskRequest = {
      prompt: taskPrompt,
      modelType: modelType,
      enableDeepThinking: enableDeepThinking, // Pass deep thinking flag
    };

    try {
      // API Key Selection check
      if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setError('Por favor, selecciona una clave API para Gemini Tasks.');
          await window.aistudio.openSelectKey();
          // Assume success after openSelectKey and let the next call proceed.
        }
      } else {
        console.warn("window.aistudio not available. API Key selection might be skipped.");
      }

      const result = await generateGeminiTaskResponse(request);
      setResponseText(result.responseText);
    } catch (err: any) {
      console.error("Failed to get Gemini task response:", err);
      if (err.message && err.message.includes("Error con la clave API.")) {
        setError(err.message);
        if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.openSelectKey === 'function') {
          await window.aistudio.openSelectKey();
        }
      } else if (err.message && err.message.includes("API_KEY environment variable is not set.")) {
        setError('API Key no encontrada. Asegúrate de que tu entorno de ejecución la proporciona. Si estás en AI Studio, por favor, selecciona una clave API.');
        if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.openSelectKey === 'function') {
          await window.aistudio.openSelectKey();
        }
      } else {
        setError(err.message || 'Ocurrió un error al obtener la respuesta de Gemini. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }, [taskPrompt, modelType, enableDeepThinking]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-200">
      <div className="mb-6">
        <label htmlFor="taskPrompt" className="block text-sm font-medium text-gray-700 mb-1">
          Describe tu tarea para Gemini:
        </label>
        <textarea
          id="taskPrompt"
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          rows={5}
          placeholder="Ej: 'Analiza el siguiente texto para identificar el sentimiento principal y los temas clave.', 'Edita este párrafo para que sea más conciso y profesional.'"
          value={taskPrompt}
          onChange={(e) => setTaskPrompt(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="modelType" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Modelo Gemini:
          </label>
          <select
            id="modelType"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={modelType}
            onChange={(e) => setModelType(e.target.value as GeminiModelType)}
          >
            <option value={GeminiModelType.Fast}>Tarea Rápida (Flash)</option>
            <option value={GeminiModelType.FastLite}>Tarea Rápida (Flash-Lite)</option> {/* New option */}
            <option value={GeminiModelType.Complex}>Tarea Compleja (Pro)</option>
          </select>
        </div>
        <div className="flex items-center mt-6 md:mt-0">
          <input
            type="checkbox"
            id="enableDeepThinking"
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            checked={enableDeepThinking}
            onChange={(e) => setEnableDeepThinking(e.target.checked)}
            disabled={modelType !== GeminiModelType.Complex} // Only enable for Complex model
          />
          <label htmlFor="enableDeepThinking" className="ml-2 block text-sm font-medium text-gray-700">
            Habilitar Pensamiento Profundo (Solo para Tarea Compleja)
          </label>
        </div>
      </div>

      <button
        onClick={handleGenerateResponse}
        disabled={loading || !taskPrompt.trim()}
        className="w-full sm:w-auto px-8 py-3 bg-indigo-700 text-white font-bold rounded-lg shadow-md hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition duration-300 ease-in-out text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Generando Respuesta...' : 'Obtener Respuesta Gemini'}
      </button>

      {loading && <LoadingSpinner />}

      {error && !loading && (
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

      {responseText && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Respuesta de Gemini:</h3>
          <div className="bg-gray-100 p-4 rounded-lg shadow-inner whitespace-pre-wrap text-gray-800">
            {responseText}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiTask;