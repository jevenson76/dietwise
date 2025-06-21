import React from 'react';
import { trackEvent } from '@services/analyticsService';

interface UpgradePromptProps {
  feature: string;
  message: string;
  icon?: string;
  onUpgradeClick: () => void;
  variant?: 'inline' | 'overlay' | 'banner';
  className?: string;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  feature,
  message,
  icon = 'fas fa-crown',
  onUpgradeClick,
  variant = 'inline',
  className = ''
}) => {
  const handleClick = () => {
    trackEvent('upgrade_prompt_clicked', { feature, variant });
    onUpgradeClick();
  };

  if (variant === 'overlay') {
    return (
      <div className={`absolute inset-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg flex items-center justify-center z-10 ${className}`}>
        <div className="text-center p-6 max-w-sm">
          <i className={`${icon} text-5xl text-yellow-500 mb-4`}></i>
          <h3 className="text-xl font-bold text-text-default mb-2">
            Upgrade to Premium
          </h3>
          <p className="text-text-alt mb-4">{message}</p>
          <button
            onClick={handleClick}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <i className="fas fa-rocket mr-2"></i>
            Unlock Now
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <i className={`${icon} text-2xl text-yellow-600 dark:text-yellow-400 mr-3`}></i>
            <div>
              <p className="font-medium text-text-default">{feature}</p>
              <p className="text-sm text-text-alt">{message}</p>
            </div>
          </div>
          <button
            onClick={handleClick}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium py-2 px-4 rounded-lg shadow hover:shadow-md transition-all whitespace-nowrap ml-4"
          >
            Upgrade
          </button>
        </div>
      </div>
    );
  }

  // Default inline variant
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg ${className}`}>
      <i className={`${icon} text-yellow-600 dark:text-yellow-400`}></i>
      <span className="text-sm font-medium text-text-default">{message}</span>
      <button
        onClick={handleClick}
        className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-200 underline"
      >
        Upgrade
      </button>
    </div>
  );
};

export default UpgradePrompt;