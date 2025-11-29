import React, { useState, useCallback } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { generateImageWithGemini } from '../services/imageGenerationService';
import { ImageGenerationRequest, ImageSize, ImageAspectRatio } from '../types';

const ImageGenerator: React.FC = () => {
  const [textPrompt, setTextPrompt] = useState<string>('');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>('1:1');
  const [generatedImageBase64, setGeneratedImageBase64] = useState<string | null>(null);
  const [generatedImageMimeType, setGeneratedImageMimeType] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateImage = useCallback(async () => {
    if (!textPrompt.trim()) {
      setError('Por favor, introduce un prompt de texto para generar la imagen.');
      return;
    }

    setError(null);
    setLoading(true);
    setGeneratedImageBase64(null);

    try {
      // API Key Selection check for gemini-3-pro-image-preview
      if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setError('Por favor, selecciona una clave API para la generación de imágenes.');
          await window.aistudio.openSelectKey();
          // Assume success after openSelectKey and let the next call proceed.
        }
      } else {
        console.warn("window.aistudio not available. API Key selection might be skipped.");
      }

      const request: ImageGenerationRequest = {
        textPrompt,
        imageSize,
        aspectRatio,
      };

      const result = await generateImageWithGemini(request);
      setGeneratedImageBase64(result.generatedImageBase64);
      setGeneratedImageMimeType(result.generatedImageMimeType);
    } catch (err: any) {
      console.error("Failed to generate image:", err);
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
        setError(err.message || 'Ocurrió un error al generar la imagen. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }, [textPrompt, imageSize, aspectRatio]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-200">
      <div className="mb-6">
        <label htmlFor="imagePrompt" className="block text-sm font-medium text-gray-700 mb-1">
          Prompt para generar imagen:
        </label>
        <textarea
          id="imagePrompt"
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          rows={3}
          placeholder="Describe la imagen que deseas generar (Ej: 'Un robot sosteniendo un monopatín rojo en un estilo futurista neon')."
          value={textPrompt}
          onChange={(e) => setTextPrompt(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="imageSize" className="block text-sm font-medium text-gray-700 mb-1">
            Tamaño de imagen:
          </label>
          <select
            id="imageSize"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={imageSize}
            onChange={(e) => setImageSize(e.target.value as ImageSize)}
          >
            <option value="1K">1K</option>
            <option value="2K">2K</option>
            <option value="4K">4K</option>
          </select>
        </div>
        <div>
          <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-700 mb-1">
            Relación de aspecto:
          </label>
          <select
            id="aspectRatio"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as ImageAspectRatio)}
          >
            <option value="1:1">1:1 (Cuadrado)</option>
            <option value="2:3">2:3 (Retrato alto)</option>
            <option value="3:2">3:2 (Paisaje ancho)</option>
            <option value="3:4">3:4 (Retrato)</option>
            <option value="4:3">4:3 (Paisaje)</option>
            <option value="9:16">9:16 (Vertical)</option>
            <option value="16:9">16:9 (Horizontal)</option>
            <option value="21:9">21:9 (Ultra-ancho)</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleGenerateImage}
        disabled={loading || !textPrompt.trim()}
        className="w-full sm:w-auto px-8 py-3 bg-indigo-700 text-white font-bold rounded-lg shadow-md hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition duration-300 ease-in-out text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Generando Imagen...' : 'Generar Imagen'}
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

      {generatedImageBase64 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Imagen Generada:</h3>
          <img
            src={`data:${generatedImageMimeType};base64,${generatedImageBase64}`}
            alt="Generated"
            className="max-w-full h-auto rounded-lg shadow-md border border-gray-200 mx-auto"
            style={{ maxHeight: '400px' }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;