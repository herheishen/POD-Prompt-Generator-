
import React, { useState, useCallback } from 'react';
import { generatePodPrompt, generateAutonomousFields } from '../services/geminiService';
import { ProductContentOutput, PromptGenerationRequest } from '../types';
import LoadingSpinner from './LoadingSpinner';
import CopyButton from './CopyButton';

// The environment is assumed to provide the types for `window.aistudio`.
// Removing the explicit `declare global` block to avoid "duplicate declaration" errors.

const productOptions = [
  { value: 'hoodie', label: 'Hoodie' },
  { value: 'taza', label: 'Taza' },
  { value: 'bikini', label: 'Bikini' },
  { value: 'canvas', label: 'Canvas' },
  { value: 'phone case', label: 'Funda de Teléfono' },
  { value: 'sticker', label: 'Sticker' },
  { value: 'tote', label: 'Tote Bag' },
  { value: 'bundle completo', label: 'Bundle Completo' },
  { value: 'colección', label: 'Colección' },
  { value: 'productos sugeridos por IA', label: 'Productos Sugeridos por IA' },
];

const visualStyleOptions = [
  { value: 'cubano retro', label: 'Cubano Retro' },
  { value: 'luxury gold', label: 'Luxury Gold' },
  { value: 'anime neon', label: 'Anime Neon' },
  { value: 'vaporwave premium', label: 'Vaporwave Premium' },
  { value: 'kawaii kids', label: 'Kawaii Kids' },
  { value: 'cyber latina', label: 'Cyber Latina' },
  { value: 'futurista', label: 'Futurista' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'maximalist', label: 'Maximalist' },
  { value: 'line art premium', label: 'Line Art Premium' },
  { value: 'flat art moderno', label: 'Flat Art Moderno' },
  { value: 'vector pop art', label: 'Vector Pop Art' },
  { value: 'acuarela digital vibrante', label: 'Acuarela Digital Vibrante' },
  { value: 'comic book ilustracion', label: 'Comic Book Ilustración' },
  { value: 'glitch art abstracto', label: 'Glitch Art Abstracto' },
  { value: 'graffiti urbano', label: 'Graffiti Urbano' },
  { value: 'boho chic minimalista', label: 'Boho Chic Minimalista' },
  { value: 'cyberpunk futurista', label: 'Cyberpunk Futurista' },
  { value: 'retro cartoon 90s', label: 'Retro Cartoon 90s' },
];

// Chip options
const edadEtapaOptions = ['Gen Z', 'Millennial', 'Adulto joven', 'Padre/madre joven', 'Estudiante', 'Freelancer'];
const humorOptions = ['ironía/memes', 'sarcasmo suave', 'humor limpio', 'humor oscuro', 'nostalgia'];
const interaccionDigitalOptions = ['TikTok-first', 'Instagram visual', 'YouTube reviews', 'WhatsApp cierre', 'Facebook comunidad'];
const sensibilidadCulturalOptions = ['religión', 'familia', 'patriotismo', 'inclusión', 'identidad espiritual'];
const momentoCompraOptions = ['impulso', 'auto-regalo', 'evento', 'regalo', 'descuento', 'recomendación influencer'];


const PromptGenerator: React.FC = () => {
  const [baseIdea, setBaseIdea] = useState<string>(''); // New mandatory input

  const [product, setProduct] = useState<string>(''); // Changed to empty string for initial select state, now optional
  const [visualStyle, setVisualStyle] = useState<string>(''); // Now optional
  // Buyer Persona new states
  const [selectedEdadEtapa, setSelectedEdadEtapa] = useState<string[]>([]);
  const [selectedHumor, setSelectedHumor] = useState<string[]>([]);
  const [selectedInteraccionDigital, setSelectedInteraccionDigital] = useState<string[]>([]);
  const [selectedSensibilidadCultural, setSelectedSensibilidadCultural] = useState<string[]>([]);
  const [selectedMomentoCompra, setSelectedMomentoCompra] = useState<string[]>([]);
  const [buyerPersonaDescription, setBuyerPersonaDescription] = useState<string>(''); // Now optional

  const [emotionPurpose, setEmotionPurpose] = useState<string>(''); // Now optional
  const [brandColors, setBrandColors] = useState<string>(''); // Now optional
  const [market, setMarket] = useState<string>(''); // Now optional
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
  // Removed: const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | undefined>(undefined);


  const [generatedContent, setGeneratedContent] = useState<ProductContentOutput | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [loadingAutonomous, setLoadingAutonomous] = useState<boolean>(false); // New state for autonomous fill loading
  const [errorAutonomous, setErrorAutonomous] = useState<string | null>(null); // New state for autonomous fill error


  // Removed: Function to get user's geolocation (no Maps grounding)
  // Removed: Call getUserLocation on component mount


  const handleChipToggle = (currentSelection: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, chipValue: string) => {
    if (currentSelection.includes(chipValue)) {
      setter(currentSelection.filter(item => item !== chipValue));
    } else {
      setter([...currentSelection, chipValue]);
    }
  };

  const handleAutonomousFill = useCallback(async () => {
    if (!baseIdea.trim()) {
      setErrorAutonomous('Por favor, introduce tu "Idea Base" para autocompletar los campos.');
      return;
    }

    setErrorAutonomous(null);
    setLoadingAutonomous(true);

    try {
      // Check API key like in other services
      if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setErrorAutonomous('Por favor, selecciona una clave API para autocompletar los campos.');
          await window.aistudio.openSelectKey();
          // Assume success after openSelectKey
        }
      } else {
        console.warn("window.aistudio not available for autonomous fill. API Key selection might be skipped.");
      }

      const result = await generateAutonomousFields({ baseIdea });

      // Populate the fields with AI-generated values
      setProduct(result.product.value);
      setVisualStyle(result.visualStyle.value);
      // For buyer persona, only set the description textarea. Chips remain for manual selection.
      setBuyerPersonaDescription(result.buyerPersona.value);
      setEmotionPurpose(result.emotionPurpose.value);
      setBrandColors(result.brandColors.value);
      setMarket(result.market.value);

      // Optionally, show a success message or clear the error if any
    } catch (err: any) {
      console.error("Failed to autonomously fill fields:", err);
      if (err.message && err.message.includes("Requested entity was not found.")) {
        setErrorAutonomous('Error con la clave API. Por favor, selecciona tu clave API de nuevo. Asegúrate de usar una clave de un proyecto de GCP con facturación activada.');
        if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.openSelectKey === 'function') {
          await window.aistudio.openSelectKey();
        }
      } else if (err.message && err.message.includes("API_KEY environment variable is not set.")) {
        setErrorAutonomous('API Key no encontrada. Asegúrate de que tu entorno de ejecución la proporciona. Si estás en AI Studio, por favor, selecciona una clave API.');
        if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.openSelectKey === 'function') {
          await window.aistudio.openSelectKey();
        }
      } else {
        setErrorAutonomous(err.message || 'Ocurrió un error al autocompletar los campos. Inténtalo de nuevo.');
      }
    } finally {
      setLoadingAutonomous(false);
    }
  }, [baseIdea]);


  const handleGenerateContent = useCallback(async () => {
    if (!baseIdea.trim()) { // Only baseIdea is mandatory now
      setError('Por favor, introduce tu "Idea Base" para generar el contenido.');
      return;
    }

    setError(null);
    setLoading(true);
    setGeneratedContent(null);

    // Combine buyer persona chips and description into a single string if provided by user
    const combinedBuyerPersona = (selectedEdadEtapa.length > 0 || selectedHumor.length > 0 ||
      selectedInteraccionDigital.length > 0 || selectedSensibilidadCultural.length > 0 ||
      selectedMomentoCompra.length > 0 || buyerPersonaDescription.trim() !== '') ?
      `Chips seleccionados:
      Edad/Etapa: ${selectedEdadEtapa.length > 0 ? selectedEdadEtapa.join(', ') : 'No especificado'}
      Humor: ${selectedHumor.length > 0 ? selectedHumor.join(', ') : 'No especificado'}
      Interacción digital: ${selectedInteraccionDigital.length > 0 ? selectedInteraccionDigital.join(', ') : 'No especificado'}
      Sensibilidad cultural: ${selectedSensibilidadCultural.length > 0 ? selectedSensibilidadCultural.join(', ') : 'No especificado'}
      Momento de compra: ${selectedMomentoCompra.length > 0 ? selectedMomentoCompra.join(', ') : 'No especificado'}

      Descripción detallada del Buyer Persona:
      ${buyerPersonaDescription.trim() || 'No se proporcionó una descripción detallada.'}`.trim()
      : undefined; // Send undefined if no buyer persona input is provided by user


    const request: PromptGenerationRequest = {
      baseIdea: baseIdea, // New mandatory field
      product: product.trim() !== '' ? product : undefined,
      visualStyle: visualStyle.trim() !== '' ? visualStyle : undefined,
      buyerPersona: combinedBuyerPersona, // Use the combined string here or undefined
      emotionPurpose: emotionPurpose.trim() !== '' ? emotionPurpose : undefined,
      brandColors: brandColors.trim() !== '' ? brandColors : undefined,
      market: market.trim() !== '' ? market : undefined,
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
      // Removed: userLocation: userLocation, // Pass user's current location
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
    baseIdea,
    product,
    visualStyle,
    // Buyer Persona dependencies
    selectedEdadEtapa,
    selectedHumor,
    selectedInteraccionDigital,
    selectedSensibilidadCultural,
    selectedMomentoCompra,
    buyerPersonaDescription,

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
    // Removed: userLocation,
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

  const renderChipCategory = (title: string, options: string[], selected: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => (
    <div className="mb-4">
      <label className="block text-xs font-medium text-gray-600 mb-1">{title}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`px-3 py-1 text-sm rounded-full border transition-colors duration-200
                        ${selected.includes(option)
                          ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                          : 'bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200'
                        }`}
            onClick={() => handleChipToggle(selected, setter, option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );


  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* New Base Idea input with button */}
        <div className="md:col-span-2 mb-6">
          <label htmlFor="baseIdea" className="block text-sm font-bold text-gray-800 mb-1">
            Idea Base (¡MANDATORIO!):
          </label>
          <div className="flex gap-2"> {/* Use flex to align textarea and button */}
            <textarea
              id="baseIdea"
              className="flex-grow p-2 border border-indigo-400 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-lg"
              rows={2}
              placeholder="Ej: 'Diseño de camiseta con loro cubano sexy', 'Taza con frase motivadora para freelancers'"
              value={baseIdea}
              onChange={(e) => setBaseIdea(e.target.value)}
            />
            <button
              onClick={handleAutonomousFill}
              disabled={loadingAutonomous || !baseIdea.trim()}
              className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loadingAutonomous ? 'Generando...' : 'Autocompletar'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Al hacer clic en "Autocompletar", la IA rellenará los campos vacíos basándose en esta idea.
          </p>
          {errorAutonomous && !loadingAutonomous && ( // Display error specific to autonomous fill
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
              <strong className="font-bold">Error al autocompletar:</strong>
              <span className="block sm:inline ml-2">{errorAutonomous}</span>
            </div>
          )}
        </div>


        <div>
          <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">Producto (opcional):</label>
          <select
            id="product"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          >
            <option value="">Selecciona un producto POD o deja que la IA sugiera</option>
            {productOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="visualStyle" className="block text-sm font-medium text-gray-700 mb-1">Estilo visual (opcional):</label>
          <select
            id="visualStyle"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={visualStyle}
            onChange={(e) => setVisualStyle(e.target.value)}
          >
            <option value="">Selecciona un estilo visual o deja que la IA sugiera</option>
            {visualStyleOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        
        {/* Buyer Persona Section */}
        <div className="md:col-span-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <label className="block text-sm font-bold text-gray-800 mb-3">
              Define a tu Buyer Persona (opcional, la IA puede inventarlo si está vacío):
          </label>
          {renderChipCategory('Edad/Etapa de vida', edadEtapaOptions, selectedEdadEtapa, setSelectedEdadEtapa)}
          {renderChipCategory('Tipo de Humor', humorOptions, selectedHumor, setSelectedHumor)}
          {renderChipCategory('Interacción Digital', interaccionDigitalOptions, selectedInteraccionDigital, setSelectedInteraccionDigital)}
          {renderChipCategory('Sensibilidad Cultural', sensibilidadCulturalOptions, selectedSensibilidadCultural, setSelectedSensibilidadCultural)}
          {renderChipCategory('Momento de Compra', momentoCompraOptions, selectedMomentoCompra, setSelectedMomentoCompra)}

          <div>
              <label htmlFor="buyerPersonaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción profunda (la clave para la conversión):
              </label>
              <textarea
                  id="buyerPersonaDescription"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={6}
                  placeholder="Describe a UNA persona real (no un grupo). Incluye edad, intereses, entorno cultural, valores, tipo de humor, emociones gatillo, plataformas donde compra y razón de compra. Ej: 'Sofía, 28, diseñadora gráfica en Madrid. Nostálgica de la Cuba de sus abuelos, valora la autenticidad. Humor irónico, se ríe de los memes. Usa Instagram para inspirarse, pero compra impulsivamente en TikTok si un influencer le recomienda algo que la hace sentir única. Busca regalos con historia para sus amigas.'"
                  value={buyerPersonaDescription}
                  onChange={(e) => setBuyerPersonaDescription(e.target.value)}
              ></textarea>
          </div>
        </div>
        {/* End Buyer Persona Section */}

        <div>
          <label htmlFor="emotionPurpose" className="block text-sm font-medium text-gray-700 mb-1">Emoción principal (opcional):</label>
          <input
            type="text"
            id="emotionPurpose"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: deseo, humor, nostalgia, motivación, high shareability, viral hook, triggers psicológicos"
            value={emotionPurpose}
            onChange={(e) => setEmotionPurpose(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="brandColors" className="block text-sm font-medium text-gray-700 mb-1">Colores clave (hex o referencias) (opcional):</label>
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
          <label htmlFor="market" className="block text-sm font-medium text-gray-700 mb-1">Mercado objetivo (opcional):</label>
          <input
            type="text"
            id="market"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: EEUU, EU, LATAM, JP, ciudades o micro-segmentos específicos"
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
            placeholder="Ej: algodón, poliéster, cerámica, metal, glossy, canvas, cuero, seda, resina, papel fotográfico premium"
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
            placeholder="Ej: sublimación, DTG, UV print, offset, screen print, serigrafía, foil"
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
            placeholder="Ej: e-commerce product, TikTok hook, FB ad, Instagram story, Pinterest pin, Shorts, Reels, YouTube Shorts, Meta Shops"
            value={tipoPublicacion}
            onChange={(e) => setTipoPublicacion(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="tendenciasMercadoDetectadas" className="block text-sm font-medium text-gray-700 mb-1">Tendencias de mercado detectadas (micro-trends, moda viral, colores en tendencia, memes, eventos culturales, seasonal trends) (opcional):</label>
          <textarea
            id="tendenciasMercadoDetectadas"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: 'Los diseños minimalistas con colores pastel están ganando tracción en el mercado de la UE para productos de moda. El 'coastal grandmother' es una micro-tendencia viral, 'dark academia' en alza. El Mundial de Fútbol en Julio es un evento cultural, los colores de otoño están en tendencia.'"
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
          <label htmlFor="objetivoEstrategico" className="block text-sm font-medium text-gray-700 mb-1">Objetivo estratégico (ventas, viralidad, branding, premium, mass-market, colecciones, ROI, retención, repetición de compra) (opcional):</label>
          <input
            type="text"
            id="objetivoEstrategico"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: 'maximizar ventas de la colección 'Cuban Dreams' con un ROI del 30%', 'aumentar la viralidad en TikTok con un hook emocional', 'fomentar la retención de clientes con diseños de alta calidad'"
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
        disabled={loading || loadingAutonomous || !baseIdea.trim()}
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

          {/* Display AI-generated input justifications */}
          {generatedContent.aiGeneratedProduct && (
            <div className="mb-4 bg-purple-50 p-3 rounded-md border border-purple-200">
              <p className="font-bold text-purple-800">Producto Sugerido por IA:</p>
              <p className="text-gray-700">{generatedContent.aiGeneratedProduct}</p>
            </div>
          )}
          {generatedContent.aiGeneratedVisualStyle && (
            <div className="mb-4 bg-purple-50 p-3 rounded-md border border-purple-200">
              <p className="font-bold text-purple-800">Estilo Visual Sugerido por IA:</p>
              <p className="text-gray-700">{generatedContent.aiGeneratedVisualStyle}</p>
            </div>
          )}
          {generatedContent.aiGeneratedBuyerPersona && (
            <div className="mb-4 bg-purple-50 p-3 rounded-md border border-purple-200">
              <p className="font-bold text-purple-800">Buyer Persona Generado por IA:</p>
              <p className="text-gray-700">{generatedContent.aiGeneratedBuyerPersona}</p>
            </div>
          )}
          {generatedContent.aiGeneratedEmotionPurpose && (
            <div className="mb-4 bg-purple-50 p-3 rounded-md border border-purple-200">
              <p className="font-bold text-purple-800">Emoción Principal Sugerida por IA:</p>
              <p className="text-gray-700">{generatedContent.aiGeneratedEmotionPurpose}</p>
            </div>
          )}
          {generatedContent.aiGeneratedBrandColors && (
            <div className="mb-4 bg-purple-50 p-3 rounded-md border border-purple-200">
              <p className="font-bold text-purple-800">Colores Clave Sugeridos por IA:</p>
              <p className="text-gray-700">{generatedContent.aiGeneratedBrandColors}</p>
            </div>
          )}
          {generatedContent.aiGeneratedMarket && (
            <div className="mb-4 bg-purple-50 p-3 rounded-md border border-purple-200">
              <p className="font-bold text-purple-800">Mercado Objetivo Sugerido por IA:</p>
              <p className="text-gray-700">{generatedContent.aiGeneratedMarket}</p>
            </div>
          )}


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

          {/* Removed: Search Grounding URLs display */}
          {/* Removed: Maps Grounding URLs display */}

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