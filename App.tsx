import React from 'react';
import PromptGenerator from './components/PromptGenerator';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-4xl text-center py-6 sm:py-8 mb-8">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-indigo-800 leading-tight">
          POD Prompt Generator
        </h1>
        <p className="mt-3 text-lg sm:text-xl text-indigo-600 font-medium">
          Transform your ideas into print-ready AI prompts for merchandise.
        </p>
      </header>
      <main className="w-full max-w-4xl">
        <PromptGenerator />
      </main>
      <footer className="w-full max-w-4xl text-center text-gray-500 text-sm mt-12 py-4 border-t border-gray-200">
        &copy; {new Date().getFullYear()} POD Prompt Generator. All rights reserved.
      </footer>
    </div>
  );
};

export default App;