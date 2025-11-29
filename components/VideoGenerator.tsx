import React, { useState, useCallback } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { generateVideoWithVeo } from '../services/videoGenerationService';
import { VideoGenerationRequest } from '../types';

// Utility function to convert File/Blob to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]); // Extract base64 part
    reader.onerror = (error) => reject(error);
  });
};

const VideoGenerator: React.FC = () => {
  const [originalImageBase64, setOriginalImageBase64] = useState<string | null>(null);
  const [originalImageMimeType, setOriginalImageMimeType] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [generatedVideoUri, setGeneratedVideoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor, sube un archivo de imagen válido.');
        return;
      }
      setError(null);
      fileToBase64(file)
        .then((base64) => {
          setOriginalImageBase64(base64);
          setOriginalImageMimeType(file.type);
          setGeneratedVideoUri(null); // Clear previous video
        })
        .catch((err) => setError(`Error al cargar la imagen: ${err.message}`));
    }
  }, []);

  const handleGenerateVideo = useCallback(async () => {
    if (!originalImageBase64 || !originalImageMimeType) {
      setError('Por favor, primero sube una imagen para generar el video.');
      return;
    }

    setError(null);
    setLoading(true);
    setGeneratedVideoUri(null);

    try {
      // Check API key and open selection if not found, as per Veo guidelines
      if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setError('Por favor, selecciona una clave API para Veo.');
          await window.aistudio.openSelectKey();
          // Assume success after openSelectKey and let the next call proceed.
        }
      } else {
        console.warn("window.aistudio not available. API Key selection might be skipped.");
      }

      const request: VideoGenerationRequest = {
        base64Image: originalImageBase64,
        mimeType: originalImageMimeType,
        aspectRatio: aspectRatio,
      };

      const result = await generateVideoWithVeo(request);
      setGeneratedVideoUri(result.videoUri);
    } catch (err: any) {
      console.error("Failed to generate video:", err);
      if (err.message && err.message.includes("Error con la clave API de Veo.")) {
        setError(err.message); // Use the specific error message from the service
        if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.openSelectKey === 'function') {
          await window.aistudio.openSelectKey();
        }
      } else if (err.message && err.message.includes("API_KEY environment variable is not set.")) {
        setError('API Key no encontrada. Asegúrate de que tu entorno de ejecución la proporciona. Si estás en AI Studio, por favor, selecciona una clave API.');
        if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.openSelectKey === 'function') {
          await window.aistudio.openSelectKey();
        }
      } else {
        setError(err.message || 'Ocurrió un error al generar el video. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }, [originalImageBase64, originalImageMimeType, aspectRatio]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-200">
      <div className="mb-6">
        <label htmlFor="videoImageUpload" className="block text-sm font-medium text-gray-700 mb-1">
          Sube tu imagen para animar:
        </label>
        <input
          type="file"
          id="videoImageUpload"
          accept="image/*"
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          onChange={handleImageUpload}
        />
      </div>

      {originalImageBase64 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Imagen Original:</h3>
          <img
            src={`data:${originalImageMimeType};base64,${originalImageBase64}`}
            alt="Original for video"
            className="max-w-full h-auto rounded-lg shadow-md border border-gray-200 mx-auto"
            style={{ maxHeight: '300px' }}
          />
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-700 mb-1">
          Relación de aspecto del video:
        </label>
        <select
          id="aspectRatio"
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value as '16:9' | '9:16')}
        >
          <option value="16:9">16:9 (Horizontal)</option>
          <option value="9:16">9:16 (Vertical)</option>
        </select>
      </div>

      <button
        onClick={handleGenerateVideo}
        disabled={loading || !originalImageBase64}
        className="w-full sm:w-auto px-8 py-3 bg-indigo-700 text-white font-bold rounded-lg shadow-md hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition duration-300 ease-in-out text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Generando Video...' : 'Generar Video'}
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

      {generatedVideoUri && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Video Generado:</h3>
          <video
            src={generatedVideoUri}
            controls
            className="max-w-full h-auto rounded-lg shadow-md border border-gray-200 mx-auto"
            style={{ maxHeight: '400px' }}
          >
            Tu navegador no soporta la reproducción de video.
          </video>
          <a
            href={generatedVideoUri}
            download="generated-veo-video.mp4"
            className="mt-4 inline-block px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Descargar Video
          </a>
        </div>
      )}
    </div>
  );
};

export default VideoGenerator;