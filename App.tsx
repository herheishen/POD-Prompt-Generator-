import React from 'react';
import PromptGenerator from './components/PromptGenerator';
import ImageEditor from './components/ImageEditor';
import VideoGenerator from './components/VideoGenerator';
import ImageGenerator from './components/ImageGenerator'; // Existing import, but ensuring it's here
import ImageAnalyzer from './components/ImageAnalyzer'; // New import
import VideoAnalyzer from './components/VideoAnalyzer'; // New import
import GeminiTask from './components/GeminiTask'; // New import

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-4xl text-center py-6 sm:py-8 mb-8">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-indigo-800 leading-tight">
          POD AI Studio
        </h1>
        <p className="mt-3 text-lg sm:text-xl text-indigo-600 font-medium">
          Generate print-ready AI prompts, edit images, and animate photos with intelligent AI.
        </p>
      </header>
      <main className="w-full max-w-4xl space-y-12"> {/* Added space-y for separation */}
        <h2 className="text-3xl font-bold text-indigo-700 text-center mb-6">Prompt Generator</h2>
        <PromptGenerator />

        <h2 className="text-3xl font-bold text-indigo-700 text-center mt-12 mb-6">Image Editor</h2>
        <ImageEditor />

        <h2 className="text-3xl font-bold text-indigo-700 text-center mt-12 mb-6">Image Generator</h2>
        <ImageGenerator />

        <h2 className="text-3xl font-bold text-indigo-700 text-center mt-12 mb-6">Image Analyzer</h2>
        <ImageAnalyzer />

        <h2 className="text-3xl font-bold text-indigo-700 text-center mt-12 mb-6">Video Generator (Veo)</h2>
        <VideoGenerator />

        <h2 className="text-3xl font-bold text-indigo-700 text-center mt-12 mb-6">Video Analyzer</h2>
        <VideoAnalyzer />

        <h2 className="text-3xl font-bold text-indigo-700 text-center mt-12 mb-6">Gemini General Tasks</h2>
        <GeminiTask />
      </main>
      <footer className="w-full max-w-4xl text-center text-gray-500 text-sm mt-12 py-4 border-t border-gray-200">
        &copy; {new Date().getFullYear()} POD AI Studio. All rights reserved.
      </footer>
    </div>
  );
};

export default App;