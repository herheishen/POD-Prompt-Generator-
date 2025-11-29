

import React, { useState, useCallback } from 'react';
import { generatePodPrompt } from '../services/geminiService';
import { ProductContentOutput, PromptGenerationRequest } from '../types';
import LoadingSpinner from './LoadingSpinner';
import CopyButton from './CopyButton';

// Fix: Add missing window.aistudio type definition for AI Studio specific functions.
declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const PromptGenerator: React.FC = () => {
  const [product, setProduct] = useState<string>('');
  const [visualStyle, setVisualStyle] = useState<string>('');
  const [buyerPersona, setBuyerPersona] = useState<string>('');
  const [emotionPurpose, setEmotionPurpose] = useState<string>('');
  const [brandColors, setBrandColors] = useState<string>('');
  const [market, setMarket] = useState<string>('');
  const [historialVentasEngagement, setHistorialVentasEngagement] = useState<string>('');
  const [tipoPublicacion, setTipoPublicacion] = useState<string>('');
  const [materialImpresion, setMaterialImpresion] = useState<string>('');
  const [tecnicaImpresionPreferida, setTecnicaImpresionPreferida] = useState<string>('');
  const [tendenciasMercadoDetectadas, setTendenciasMercadoDetectadas] = useState<string>('');
  const [productosComplementarios, setProductosComplementarios] = useState<string>('');
  const [plataformasPublicacion, setPlataformasPublicacion] = useState<string>('');
  const [objetivoEstrategico, setObjetivoEstrategico] = useState<string>('');
  const [microMomentosTriggers, setMicroMomentosTriggers] = useState<string>('');
  const [datosCrossPlatform, setDatosCrossPlatform] = useState<string>('');
  const [datosHiperlocales, setDatosHiperlocales] = useState<string>('');
  const [productosPropuestosIA, setProductosPropuestosIA] = useState<string>('');
  const [ciudadesMicroSegmentos, setCiudadesMicroSegmentos] = useState<string>('');
  const [feedbackRealCampanas, setFeedbackRealCampanas] = useState<string>('');
  const [preferenciasStorytelling, setPreferenciasStorytelling] = useState<string>('');


  const [generatedContent, setGeneratedContent] = useState<ProductContentOutput | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateContent = useCallback(async () => {
    if (!product.trim() || !visualStyle.trim() || !buyerPersona.trim() || !emotionPurpose.trim() || !brandColors.trim() || !market.trim()) {
      setError('Por favor, completa todos los campos obligatorios para generar el contenido.');
      return;
    }

    setError(null);
    setLoading(true);
    setGeneratedContent(null);

    const request: PromptGenerationRequest = {
      product,
      visualStyle,
      buyerPersona,
      emotionPurpose,
      brandColors,
      market,
      historialVentasEngagement: historialVentasEngagement.trim() !== '' ? historialVentasEngagement : undefined,
      tipoPublicacion: tipoPublicacion.trim() !== '' ? tipoPublicacion : undefined,
      materialImpresion: materialImpresion.trim() !== '' ? materialImpresion : undefined,
      tecnicaImpresionPreferida: tecnicaImpresionPreferida.trim() !== '' ? tecnicaImpresionPreferida : undefined,
      tendenciasMercadoDetectadas: tendenciasMercadoDetectadas.trim() !== '' ? tendenciasMercadoDetectadas : undefined,
      productosComplementarios: productosComplementarios.trim() !== '' ? productosComplementarios : undefined,
      plataformasPublicacion: plataformasPublicacion.trim() !== '' ? plataformasPublicacion : undefined,
      objetivoEstrategico: objetivoEstrategico.trim() !== '' ? objetivoEstrategico : undefined,
      microMomentosTriggers: microMomentosTriggers.trim() !== '' ? microMomentosTriggers : undefined,
      datosCrossPlatform: datosCrossPlatform.trim() !== '' ? datosCrossPlatform : undefined,
      datosHiperlocales: datosHiperlocales.trim() !== '' ? datosHiperlocales : undefined,
      productosPropuestosIA: productosPropuestosIA.trim() !== '' ? productosPropuestosIA : undefined,
      ciudadesMicroSegmentos: ciudadesMicroSegmentos.trim() !== '' ? ciudadesMicroSegmentos : undefined,
      feedbackRealCampanas: feedbackRealCampanas.trim() !== '' ? feedbackRealCampanas : undefined,
      preferenciasStorytelling: preferenciasStorytelling.trim() !== '' ? preferenciasStorytelling : undefined,
    };

    try {
      // Check API key and open selection if not found, as per Veo guidelines
      if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setError('Por favor, selecciona una clave API para continuar.');
          await window.aistudio.openSelectKey();
          // Assume success after openSelectKey and let the next call proceed.
          // The new GoogleGenAI instance in generatePodPrompt will pick up the updated key.
        }
      } else {
        // Fallback or development scenario where aistudio might not be present.
        // Assume API_KEY is handled by env or other means, or throw if mandatory.
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
      }
      else {
        setError(err.message || 'Ocurrió un error al generar el contenido. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }, [
    product,
    visualStyle,
    buyerPersona,
    emotionPurpose,
    brandColors,
    market,
    historialVentasEngagement,
    tipoPublicacion,
    materialImpresion,
    tecnicaImpresionPreferida,
    tendenciasMercadoDetectadas,
    productosComplementarios,
    plataformasPublicacion,
    objetivoEstrategico,
    microMomentosTriggers,
    datosCrossPlatform,
    datosHiperlocales,
    productosPropuestosIA,
    ciudadesMicroSegmentos,
    feedbackRealCampanas,
    preferenciasStorytelling,
  ]);

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">Producto:</label>
          <input
            type="text"
            id="product"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: hoodie, taza, bikini, poster, bundle completo, colección, productos sugeridos por IA"
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
          <label htmlFor="buyerPersona" className="block text-sm font-medium text-gray-700 mb-1">Buyer persona (edad, intereses, cultura, micro-emociones, sensibilidad cultural, tipo de humor, interacción cross-platform, etc.):</label>
          <input
            type="text"
            id="buyerPersona"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: hombres 25+, gamers, madres, o 'fans de la cultura cubana con micro-emoción de nostalgia vibrante, valoran humor sarcástico, activos en TikTok'"
            value={buyerPersona}
            onChange={(e) => setBuyerPersona(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="emotionPurpose" className="block text-sm font-medium text-gray-700 mb-1">Emoción principal:</label>
          <input
            type="text"
            id="emotionPurpose"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: deseo, humor, nostalgia, motivación, high shareability"
            value={emotionPurpose}
            onChange={(e) => setEmotionPurpose(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="brandColors" className="block text-sm font-medium text-gray-700 mb-1">Colores clave (hex o referencias):</label>
          <input
            type="text"
            id="brandColors"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: azul cielo, rojo vibrante, dorado (#FFD700)"
            value={brandColors}
            onChange={(e) => setBrandColors(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="market" className="block text-sm font-medium text-gray-700 mb-1">Mercado objetivo:</label>
          <input
            type="text"
            id="market"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: EEUU, EU, LATAM, JP"
            value={market}
            onChange={(e) => setMarket(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="materialImpresion" className="block text-sm font-medium text-gray-700 mb-1">Material de impresión (opcional):</label>
          <input
            type="text"
            id="materialImpresion"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: algodón, poliéster, cerámica, metal, glossy, canvas, cuero, seda"
            value={materialImpresion}
            onChange={(e) => setMaterialImpresion(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="tecnicaImpresionPreferida" className="block text-sm font-medium text-gray-700 mb-1">Técnica de impresión preferida (opcional):</label>
          <input
            type="text"
            id="tecnicaImpresionPreferida"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: sublimación, DTG, UV print, offset, screen print"
            value={tecnicaImpresionPreferida}
            onChange={(e) => setTecnicaImpresionPreferida(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="historialVentasEngagement" className="block text-sm font-medium text-gray-700 mb-1">Historial de ventas, clics, shares y engagement previo (incluye feedback real) (opcional):</label>
          <textarea
            id="historialVentasEngagement"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: 'Los diseños con toques dorados se vendieron un 20% más en Instagram (CTR 5%). Los prompts con fondos claros tuvieron mejor CTR en TikTok (7%). Clicks: 10k, Shares: 2k. El feedback de clientes en FB fue positivo sobre diseños 'bold'."
            rows={2}
            value={historialVentasEngagement}
            onChange={(e) => setHistorialVentasEngagement(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="tipoPublicacion" className="block text-sm font-medium text-gray-700 mb-1">Tipo de publicación deseada (opcional):</label>
          <input
            type="text"
            id="tipoPublicacion"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: e-commerce product, TikTok hook, FB ad, Instagram story, Pinterest pin, Shorts"
            value={tipoPublicacion}
            onChange={(e) => setTipoPublicacion(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="tendenciasMercadoDetectadas" className="block text-sm font-medium text-gray-700 mb-1">Tendencias de mercado detectadas (micro-trends, moda viral, colores en tendencia, memes) (opcional):</label>
          <textarea
            id="tendenciasMercadoDetectadas"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: 'Los diseños minimalistas con colores pastel están ganando tracción en el mercado de la UE para productos de moda. El 'coastal grandmother' es una micro-tendencia viral, 'dark academia' en alza.'"
            rows={2}
            value={tendenciasMercadoDetectadas}
            onChange={(e) => setTendenciasMercadoDetectadas(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="productosComplementarios" className="block text-sm font-medium text-gray-700 mb-1">Productos complementarios para bundle/cross-sell (opcional):</label>
          <input
            type="text"
            id="productosComplementarios"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: taza a juego, gorra con el mismo estilo"
            value={productosComplementarios}
            onChange={(e) => setProductosComplementarios(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="plataformasPublicacion" className="block text-sm font-medium text-gray-700 mb-1">Plataformas de publicación y adaptaciones necesarias (opcional):</label>
          <input
            type="text"
            id="plataformasPublicacion"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: Shopify (imágenes de producto), TikTok (videos cortos), Instagram (stories/posts), Pinterest (pins)"
            value={plataformasPublicacion}
            onChange={(e) => setPlataformasPublicacion(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="objetivoEstrategico" className="block text-sm font-medium text-gray-700 mb-1">Objetivo estratégico (opcional):</label>
          <input
            type="text"
            id="objetivoEstrategico"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: ventas, viralidad, branding, premium, mass-market"
            value={objetivoEstrategico}
            onChange={(e) => setObjetivoEstrategico(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="microMomentosTriggers" className="block text-sm font-medium text-gray-700 mb-1">Micro-momentos y triggers temporales (eventos, festividades, horarios, tendencias virales recientes) (opcional):</label>
          <input
            type="text"
            id="microMomentosTriggers"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: 'Black Friday', 'Navidad', 'inicio de verano', 'tendencia viral de memes de gatos'"
            value={microMomentosTriggers}
            onChange={(e) => setMicroMomentosTriggers(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="datosCrossPlatform" className="block text-sm font-medium text-gray-700 mb-1">Datos cross-platform (comportamiento en redes, engagement histórico por plataforma) (opcional):</label>
          <textarea
            id="datosCrossPlatform"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: 'Los posts con video en TikTok tienen un 15% más de CTR que en Instagram. Las stories de Instagram con encuestas aumentan el engagement un 10%.'"
            rows={2}
            value={datosCrossPlatform}
            onChange={(e) => setDatosCrossPlatform(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="datosHiperlocales" className="block text-sm font-medium text-gray-700 mb-1">Datos hiperlocales (trends, memes, referencias culturales locales) (opcional):</label>
          <textarea
            id="datosHiperlocales"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: 'El meme del 'perrito cheems' es muy popular en LATAM, usar referencias a 'cafecito' en Miami aumenta la conversión.' "
            rows={2}
            value={datosHiperlocales}
            onChange={(e) => setDatosHiperlocales(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="productosPropuestosIA" className="block text-sm font-medium text-gray-700 mb-1">Productos propuestos por IA (opcional):</label>
          <textarea
            id="productosPropuestosIA"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: 'La IA sugirió una funda para móvil con el mismo diseño que el hoodie y una taza con un patrón similar. '"
            rows={2}
            value={productosPropuestosIA}
            onChange={(e) => setProductosPropuestosIA(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="ciudadesMicroSegmentos" className="block text-sm font-medium text-gray-700 mb-1">Ciudades o micro-segmentos específicos (opcional):</label>
          <input
            type="text"
            id="ciudadesMicroSegmentos"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: 'Miami (Little Havana), CDMX (Roma Norte)' "
            value={ciudadesMicroSegmentos}
            onChange={(e) => setCiudadesMicroSegmentos(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="feedbackRealCampanas" className="block text-sm font-medium text-gray-700 mb-1">Feedback real de campañas, ventas y shares (opcional):</label>
          <textarea
            id="feedbackRealCampanas"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: 'La campaña de TikTok #CubanVibes generó 1.5M views, pero el CTR fue bajo (0.8%). Los clientes pidieron más opciones de color en los hoodies.'"
            rows={2}
            value={feedbackRealCampanas}
            onChange={(e) => setFeedbackRealCampanas(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="preferenciasStorytelling" className="block text-sm font-medium text-gray-700 mb-1">Preferencias de storytelling visual y narrativa de colecciones (opcional):</label>
          <textarea
            id="preferenciasStorytelling"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: 'Las colecciones deben contar la historia de un viaje por Cuba, desde sus playas vibrantes hasta sus noches de jazz. La narrativa debe ser nostálgica pero moderna.'"
            rows={2}
            value={preferenciasStorytelling}
            onChange={(e) => setPreferenciasStorytelling(e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={handleGenerateContent}
        disabled={loading}
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
          {renderSection("Buyer Persona Inventado", generatedContent.inventedBuyerPersona, generatedContent.inventedBuyerPersona)}

          {renderSection(
            "🛍️ 1. Ficha Printify del Producto (Ready to use)",
            <>
              <p><strong>Nombre del producto:</strong> {generatedContent.printifyProduct.name}</p>
              <p><strong>Descripción corta:</strong> {generatedContent.printifyProduct.descriptionShort}</p>
              <p><strong>Beneficios emocionales:</strong> {generatedContent.printifyProduct.emotionalBenefits}</p>
              <p><strong>Sensación táctil:</strong> {generatedContent.printifyProduct.tactileFeel}</p>
              <p><strong>Escenario social:</strong> {generatedContent.printifyProduct.socialScenario}</p>
              <p><strong>CTA final:</strong> {generatedContent.printifyProduct.cta}</p>
              <p><strong>Puntos clave:</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>Tejido / materiales: {generatedContent.printifyProduct.keyPoints.fabricMaterials}</li>
                <li>Estilo / fit: {generatedContent.printifyProduct.keyPoints.styleFit}</li>
                <li>Estampado / técnica: {generatedContent.printifyProduct.keyPoints.printTechnique}</li>
                <li>Durabilidad: {generatedContent.printifyProduct.keyPoints.durability}</li>
                <li>Cuidado: {generatedContent.printifyProduct.keyPoints.careInstructions}</li>
              </ul>
            </>,
            JSON.stringify(generatedContent.printifyProduct, null, 2) // Copy full JSON for Printify section
          )}

          {renderSection(
            "📱 2. Copy viral Redes Sociales",
            <>
              <p><strong>Versión Facebook post:</strong> {generatedContent.socialMediaCopy.facebookPost}</p>
              <p><strong>Versión TikTok título + hook:</strong> {generatedContent.socialMediaCopy.tiktokTitleHook}</p>
              <p><strong>Versión descripción TikTok:</strong> {generatedContent.socialMediaCopy.tiktokDescription}</p>
              <p><strong>Versión Pinterest SEO:</strong> {generatedContent.socialMediaCopy.pinterestSEO}</p>
            </>,
            JSON.stringify(generatedContent.socialMediaCopy, null, 2) // Copy full JSON for Social Media section
          )}

          {renderSection("🎨 3. Prompt IA Diseño Visual (Mass Market)", generatedContent.visualAIPrompt.versionA, generatedContent.visualAIPrompt.versionA)}
          {renderSection("🎨 3. Prompt IA Diseño Visual (Premium / Limited Edition)", generatedContent.visualAIPrompt.versionB, generatedContent.visualAIPrompt.versionB)}
          {renderSection("🎨 3. Prompt IA Diseño Visual (Viral Social)", generatedContent.visualAIPrompt.versionC, generatedContent.visualAIPrompt.versionC)}
          {renderSection("🎨 3. Prompt IA Diseño Visual (Adaptive AI)", generatedContent.visualAIPrompt.versionD, generatedContent.visualAIPrompt.versionD)}
          {renderSection("🎨 3. Prompt IA Diseño Visual (Bundle / Cross-sell)", generatedContent.visualAIPrompt.versionE, generatedContent.visualAIPrompt.versionE)}
          {renderSection("🎨 3. Prompt IA Diseño Visual (Collection Complete)", generatedContent.visualAIPrompt.versionF, generatedContent.visualAIPrompt.versionF)}
          {renderSection("🎨 3. Prompt IA Diseño Visual (Auto-Predictive)", generatedContent.visualAIPrompt.versionG, generatedContent.visualAIPrompt.versionG)}
          {renderSection("🎨 3. Prompt IA Diseño Visual (Trending Micro-Emotion Hook)", generatedContent.visualAIPrompt.versionH, generatedContent.visualAIPrompt.versionH)}
          {renderSection("🎨 3. Prompt IA Diseño Visual (AI Marketing Copy)", generatedContent.visualAIPrompt.versionI, generatedContent.visualAIPrompt.versionI)}
          {renderSection("🎨 3. Prompt IA Diseño Visual (Auto-Time Trigger)", generatedContent.visualAIPrompt.versionJ, generatedContent.visualAIPrompt.versionJ)}
          {renderSection("🎨 3. Prompt IA Diseño Visual (Meta-Bundle)", generatedContent.visualAIPrompt.versionK, generatedContent.visualAIPrompt.versionK)}
          {renderSection("🎨 3. Prompt IA Diseño Visual (Full Predictive AI)", generatedContent.visualAIPrompt.versionL, generatedContent.visualAIPrompt.versionL)}
          {renderSection("🎨 3. Prompt IA Diseño Visual (Hyperlocal Adaptive)", generatedContent.visualAIPrompt.versionM, generatedContent.visualAIPrompt.versionM)}
          {renderSection("🎨 3. Prompt IA Diseño Visual (Cross-Platform Optimizer)", generatedContent.visualAIPrompt.versionN, generatedContent.visualAIPrompt.versionN)}
          {renderSection("🎨 3. Prompt IA Diseño Visual (Autonomous Product Creator)", generatedContent.visualAIPrompt.versionO, generatedContent.visualAIPrompt.versionO)}
          {renderSection("🎨 3. Prompt IA Diseño Visual (Performance Simulation)", generatedContent.visualAIPrompt.versionP, generatedContent.visualAIPrompt.versionP)}
          {renderSection("🎨 3. Prompt IA Diseño Visual (Omni-channel Adjustment)", generatedContent.visualAIPrompt.versionQ, generatedContent.visualAIPrompt.versionQ)}
          {renderSection("🎨 3. Prompt IA Diseño Visual (Strategic Decision Making)", generatedContent.visualAIPrompt.versionR, generatedContent.visualAIPrompt.versionR)}


          {renderSection(
            "🤖 4. Embeddings (JSON)",
            <pre className="whitespace-pre-wrap">{JSON.stringify(generatedContent.productEmbedding, null, 2)}</pre>,
            JSON.stringify(generatedContent.productEmbedding, null, 2)
          )}

          {renderSection(
            "🛒 5. Uso en Shopify",
            <>
              <p className="mb-2"><strong>Snippet Liquid/JSON para metafield:</strong></p>
              <pre className="whitespace-pre-wrap bg-gray-100 p-3 rounded-md border border-gray-200">{generatedContent.shopifyIntegration.metafieldSnippet}</pre>
              <p className="mt-4 mb-2"><strong>Idea de recomendación basada en embeddings:</strong></p>
              <p>{generatedContent.shopifyIntegration.recommendationIdea}</p>
            </>,
            JSON.stringify(generatedContent.shopifyIntegration, null, 2) // Copy full JSON for Shopify section
          )}

          {renderSection(
            "Extra: Variantes de Tono (Copy)",
            <>
              <p><strong>🔥 Sexy:</strong> {generatedContent.toneVariants.sexy}</p>
              <p><strong>🥺 Cute:</strong> {generatedContent.toneVariants.cute}</p>
              <p><strong>🚀 Aspiracional:</strong> {generatedContent.toneVariants.aspirational}</p>
              <p><strong>😈 Peligrosa:</strong> {generatedContent.toneVariants.dangerous}</p>
              <p><strong>🧠 Coleccionista:</strong> {generatedContent.toneVariants.collector}</p>
            </>,
            JSON.stringify(generatedContent.toneVariants, null, 2) // Copy full JSON for Tone Variants section
          )}

          {renderSection("8. Propuesta de Nuevos Productos", generatedContent.newProductProposals || 'No hay propuestas de nuevos productos.', generatedContent.newProductProposals || '')}
          {renderSection("9. Simulación de Desempeño", generatedContent.performanceSimulations || 'No hay simulaciones de desempeño disponibles.', generatedContent.performanceSimulations || '')}
        </div>
      )}
    </div>
  );
};

export default PromptGenerator;