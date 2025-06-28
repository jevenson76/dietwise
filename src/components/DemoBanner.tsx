import React, { useState } from 'react';
import { isDemoMode, DEMO_CONFIG } from '../config/demo';

const DemoBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isDemoMode() || !isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white bg-opacity-20 rounded-full p-1">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium">
              🥗 DietWise Demo Mode
            </p>
            <p className="text-xs opacity-90">
              This is a demonstration with sample data. Experience the full nutrition tracking features!
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <a 
            href="https://github.com/jevenson76/dietwise"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-xs font-medium transition-colors"
          >
            View Source
          </a>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Close demo banner"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoBanner;