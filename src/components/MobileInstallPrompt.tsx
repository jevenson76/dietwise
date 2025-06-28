import React from 'react';
import { trackEvent } from '@services/analyticsService';

interface MobileInstallPromptProps {
  isVisible: boolean;
  isIOS: boolean;
  onDismiss: () => void;
  onInstall?: () => void;
}

const MobileInstallPrompt: React.FC<MobileInstallPromptProps> = ({
  isVisible,
  isIOS,
  onDismiss,
  onInstall
}) => {
  if (!isVisible) return null;

  const handleInstall = () => {
    trackEvent('pwa_install_clicked', { platform: isIOS ? 'ios' : 'android' });
    if (onInstall) {
      onInstall();
    }
  };

  const handleDismiss = () => {
    trackEvent('pwa_install_dismissed', { platform: isIOS ? 'ios' : 'android' });
    localStorage.setItem('ios-install-dismissed', 'true');
    onDismiss();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-4 shadow-2xl animate-slide-up">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <i className="fas fa-leaf text-teal-600 text-xl"></i>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm">Install DietWise</h3>
            <p className="text-xs text-teal-100">
              {isIOS 
                ? 'Tap Share → Add to Home Screen'
                : 'Add to home screen for easy access'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-3">
          {!isIOS && onInstall && (
            <button
              onClick={handleInstall}
              className="bg-white text-teal-600 px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-gray-100 transition-colors"
            >
              Install
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="text-teal-200 hover:text-white p-1"
            aria-label="Dismiss install prompt"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      {isIOS && (
        <div className="mt-3 pt-3 border-t border-teal-500 max-w-md mx-auto">
          <div className="flex items-center justify-center space-x-4 text-xs text-teal-100">
            <div className="flex items-center space-x-1">
              <i className="fas fa-share"></i>
              <span>Tap Share</span>
            </div>
            <div className="w-2 h-0.5 bg-teal-400 rounded"></div>
            <div className="flex items-center space-x-1">
              <i className="fas fa-plus-square"></i>
              <span>Add to Home Screen</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileInstallPrompt;