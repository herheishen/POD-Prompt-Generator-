import React, { useState, useCallback } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { editImageWithGemini } from '../services/imageEditService';

// Utility function to convert File/Blob to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]); // Extract base64 part
    reader.onerror = (error) => reject(error);
  });
};

const ImageEditor: React.FC = () => {
  const [originalImageBase64, setOriginalImageBase64] = useState<string | null>(null);
  const [originalImageMimeType, setOriginalImageMimeType] = useState<string | null>(null);
  const [imageEditPrompt, setImageEditPrompt] = useState<string>('');
  const [editedImageBase64, setEditedImageBase64] = useState<string | null>(null);
  const [editedImageMimeType, setEditedImageMimeType] = useState<string | null>(null);
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
          setEditedImageBase64(null); // Clear previous edited image
        })
        .catch((err) => setError(`Error al cargar la imagen: ${err.message}`));
    }
  }, []);

  const handleEditImage = useCallback(async () => {
    if (!originalImageBase64 || !originalImageMimeType) {
      setError('Por favor, primero sube una imagen para editar.');
      return;
    }
    if (!imageEditPrompt.trim()) {
      setError('Por favor, introduce un prompt de edición para la imagen.');
      return;
    }

    setError(null);
    setLoading(true);
    setEditedImageBase64(null);

    try {
      const result = await editImageWithGemini({
        base64Image: originalImageBase64,
        mimeType: originalImageMimeType,
        textPrompt: imageEditPrompt,
      });
      setEditedImageBase64(result.editedImageBase64);
      setEditedImageMimeType(result.editedImageMimeType);
    } catch (err: any) {
      console.error("Failed to edit image:", err);
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
        setError(err.message || 'Ocurrió un error al editar la imagen. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }, [originalImageBase64, originalImageMimeType, imageEditPrompt]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-200">
      <p className="text-sm text-yellow-800 bg-yellow-100 p-3 rounded-md mb-4 border border-yellow-200">
        <strong>Nota:</strong> Esta función utiliza el modelo Gemini 2.5 Flash estándar, lo que puede resultar en una calidad de edición de imágenes más básica en comparación con modelos avanzados especializados.
      </p>
      <div className="mb-6">
        <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 mb-1">
          Sube tu imagen para editar:
        </label>
        <input
          type="file"
          id="imageUpload"
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
            alt="Original"
            className="max-w-full h-auto rounded-lg shadow-md border border-gray-200 mx-auto"
            style={{ maxHeight: '300px' }}
          />
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="imageEditPrompt" className="block text-sm font-medium text-gray-700 mb-1">
          Prompt de edición (Ej: "Añade un filtro retro", "Elimina a la persona del fondo"):
        </label>
        <textarea
          id="imageEditPrompt"
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          rows={3}
          placeholder="Describe los cambios que deseas realizar en la imagen."
          value={imageEditPrompt}
          onChange={(e) => setImageEditPrompt(e.target.value)}
        />
      </div>

      <button
        onClick={handleEditImage}
        disabled={loading || !originalImageBase64 || !imageEditPrompt.trim()}
        className="w-full sm:w-auto px-8 py-3 bg-indigo-700 text-white font-bold rounded-lg shadow-md hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition duration-300 ease-in-out text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Editando Imagen...' : 'Editar Imagen'}
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

      {editedImageBase64 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Imagen Editada:</h3>
          <img
            src={`data:${editedImageMimeType};base64,${editedImageBase64}`}
            alt="Edited"
            className="max-w-full h-auto rounded-lg shadow-md border border-gray-200 mx-auto"
            style={{ maxHeight: '300px' }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageEditor;