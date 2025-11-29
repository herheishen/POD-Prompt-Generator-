import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      <p className="ml-3 text-indigo-700">Generando prompt...</p>
    </div>
  );
};

export default LoadingSpinner;