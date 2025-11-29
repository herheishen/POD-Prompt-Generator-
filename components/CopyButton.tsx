
import React, { useState } from 'react';

interface CopyButtonProps {
  textToCopy: string;
  className?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy, className }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text:', err);
      // Optionally provide user feedback for failed copy
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`ml-2 px-3 py-1 bg-indigo-500 text-white rounded-md text-sm hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-200 ease-in-out ${className}`}
    >
      {copied ? '¡Copiado!' : 'Copiar'}
    </button>
  );
};

export default CopyButton;