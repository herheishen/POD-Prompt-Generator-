import React, { useState, useCallback } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { analyzeVideoWithGemini, fileToBase64 as videoFileToBase64 } from '../services/videoAnalysisService'; // Renamed to avoid conflict
import { VideoAnalysisRequest } from '../types';

const VideoAnalyzer: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [analysisPrompt, setAnalysisPrompt] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleVideoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('Por favor, sube un archivo de video válido.');
        return;
      }
      setError(null);
      setVideoFile(file);
      setAnalysisResult(null); // Clear previous results
    }
  }, []);

  const handleAnalyzeVideo = useCallback(async () => {
    if (!videoFile) {
      setError('Por favor, sube un video para analizar.');
      return;
    }
    if (!analysisPrompt.trim()) {
      setError('Por favor, introduce un prompt de análisis para el video.');
      return;
    }

    setError(null);
    setLoading(true);
    setAnalysisResult(null);

    try {
      const base64Video = await videoFileToBase64(videoFile); // Use renamed utility
      const request: VideoAnalysisRequest = {
        base64Video,
        mimeType: videoFile.type,
        analysisPrompt,
      };
      const result = await analyzeVideoWithGemini(request);
      setAnalysisResult(result.analysisResult);
    } catch (err: any) {
      console.error("Failed to analyze video:", err);
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
        setError(err.message || 'Ocurrió un error al analizar el video. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }, [videoFile, analysisPrompt]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-200">
      <div className="mb-6">
        <label htmlFor="videoAnalysisUpload" className="block text-sm font-medium text-gray-700 mb-1">
          Sube tu video para analizar:
        </label>
        <input
          type="file"
          id="videoAnalysisUpload"
          accept="video/*"
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          onChange={handleVideoUpload}
        />
      </div>

      {videoFile && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Video a analizar:</h3>
          <video
            src={URL.createObjectURL(videoFile)}
            controls
            className="max-w-full h-auto rounded-lg shadow-md border border-gray-200 mx-auto"
            style={{ maxHeight: '300px' }}
          >
            Tu navegador no soporta la reproducción de video.
          </video>
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="videoAnalysisPrompt" className="block text-sm font-medium text-gray-700 mb-1">
          Prompt de análisis (Ej: "Resume este video", "Identifica los momentos clave y los personajes"):
        </label>
        <textarea
          id="videoAnalysisPrompt"
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          rows={3}
          placeholder="¿Qué quieres saber sobre este video?"
          value={analysisPrompt}
          onChange={(e) => setAnalysisPrompt(e.target.value)}
        />
      </div>

      <button
        onClick={handleAnalyzeVideo}
        disabled={loading || !videoFile || !analysisPrompt.trim()}
        className="w-full sm:w-auto px-8 py-3 bg-indigo-700 text-white font-bold rounded-lg shadow-md hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition duration-300 ease-in-out text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Analizando Video...' : 'Analizar Video'}
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

      {analysisResult && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Resultado del Análisis:</h3>
          <div className="bg-gray-100 p-4 rounded-lg shadow-inner whitespace-pre-wrap text-gray-800">
            {analysisResult}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoAnalyzer;