import React, { useState, useEffect } from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import OfflineIndicator from './OfflineIndicator';

interface OfflineBannerProps {
  isOnline: boolean;
  pendingCount?: number;
  lastSyncTime?: string;
  onSync?: () => void;
  onDismiss?: () => void;
  onRetryConnection?: () => void;
  position?: 'top' | 'bottom';
  persistent?: boolean;
  showFeatureList?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  className?: string;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOnline,
  pendingCount = 0,
  lastSyncTime,
  onSync,
  onDismiss,
  onRetryConnection,
  position = 'top',
  persistent = false,
  showFeatureList = false,
  autoHide = false,
  autoHideDelay = 10000,
  className = ''
}) => {
  const { isMobile } = useResponsive();
  const [isVisible, setIsVisible] = useState(!isOnline);
  const [isExpanded, setIsExpanded] = useState(false);
  const [justWentOnline, setJustWentOnline] = useState(false);
  const [dismissedOnline, setDismissedOnline] = useState(false);

  useEffect(() => {
    if (isOnline && !isVisible && !dismissedOnline) {
      // Just came back online
      setJustWentOnline(true);
      setIsVisible(true);
      
      if (autoHide) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setJustWentOnline(false);
        }, autoHideDelay);
        return () => clearTimeout(timer);
      }
    } else if (!isOnline) {
      setIsVisible(true);
      setJustWentOnline(false);
      setDismissedOnline(false);
    }
  }, [isOnline, autoHide, autoHideDelay, isVisible, dismissedOnline]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (isOnline) {
      setDismissedOnline(true);
    }
    onDismiss?.();
  };

  const formatLastSync = (timestamp: string) => {
    if (!timestamp) return null;
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return 'over a day ago';
  };

  const offlineFeatures = [
    'Food logging',
    'Weight tracking', 
    'View analytics',
    'Manage food library',
    'Access meal plans'
  ];

  const limitedFeatures = [
    'Barcode scanning',
    'AI suggestions',
    'Data synchronization',
    'Premium features'
  ];

  if (!isVisible && !persistent) return null;

  const bannerContent = (
    <div
      className={`
        w-full transition-all duration-500 ease-in-out transform
        ${isVisible ? 'translate-y-0 opacity-100' : position === 'top' ? '-translate-y-full opacity-0' : 'translate-y-full opacity-0'}
        ${position === 'top' ? 'top-0' : 'bottom-0'}
        ${isMobile ? 'px-4' : 'px-6'}
        z-40
        ${className}
      `}
    >
      <div
        className={`
          mx-auto max-w-7xl rounded-lg shadow-lg border-l-4 backdrop-blur-sm
          ${isOnline 
            ? justWentOnline
              ? 'bg-green-50/95 dark:bg-green-900/95 border-green-400 dark:border-green-600'
              : 'bg-blue-50/95 dark:bg-blue-900/95 border-blue-400 dark:border-blue-600'
            : 'bg-orange-50/95 dark:bg-orange-900/95 border-orange-400 dark:border-orange-600'
          }
        `}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              {/* Icon */}
              <div className="flex-shrink-0">
                <i 
                  className={`
                    fas text-lg
                    ${isOnline 
                      ? justWentOnline 
                        ? 'fa-check-circle text-green-500 animate-bounce'
                        : 'fa-wifi text-blue-500'
                      : 'fa-wifi-slash text-orange-500 animate-pulse'
                    }
                  `}
                />
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className={`font-semibold ${isOnline ? 'text-green-800 dark:text-green-200' : 'text-orange-800 dark:text-orange-200'}`}>
                    {isOnline 
                      ? justWentOnline 
                        ? 'Connection Restored!' 
                        : 'You\'re Online'
                      : 'You\'re Offline'
                    }
                  </p>
                  
                  {pendingCount > 0 && (
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      {pendingCount} pending
                    </span>
                  )}
                </div>

                <p className={`text-sm mt-1 ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                  {isOnline 
                    ? justWentOnline
                      ? pendingCount > 0 
                        ? `${pendingCount} items are ready to sync to the cloud`
                        : 'All features are now available and data is synced'
                      : lastSyncTime 
                        ? `Last synced ${formatLastSync(lastSyncTime)}`
                        : 'All features available'
                    : 'Limited features available. Your data is being saved locally.'
                  }
                </p>

                {/* Expandable Features List */}
                {showFeatureList && !isOnline && (
                  <div className="mt-2">
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-xs text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200 flex items-center"
                    >
                      <span className="mr-1">What works offline?</span>
                      <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-xs`}></i>
                    </button>
                    
                    {isExpanded && (
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="font-medium text-green-700 dark:text-green-400 mb-1">✓ Available:</p>
                          <ul className="text-green-600 dark:text-green-400 space-y-0.5">
                            {offlineFeatures.map((feature, index) => (
                              <li key={index}>• {feature}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-400 mb-1">⚠ Limited:</p>
                          <ul className="text-gray-600 dark:text-gray-400 space-y-0.5">
                            {limitedFeatures.map((feature, index) => (
                              <li key={index}>• {feature}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 ml-4">
              {!isOnline && onRetryConnection && (
                <button
                  onClick={onRetryConnection}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1 rounded-md transition-colors whitespace-nowrap"
                >
                  <i className="fas fa-redo mr-1"></i>
                  Retry
                </button>
              )}
              
              {isOnline && pendingCount > 0 && onSync && (
                <button
                  onClick={onSync}
                  className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded-md transition-colors whitespace-nowrap"
                >
                  <i className="fas fa-sync mr-1"></i>
                  Sync Now
                </button>
              )}

              {!persistent && (
                <button
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                  aria-label="Dismiss"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (position === 'top' || position === 'bottom') {
    return (
      <div className={`fixed left-0 right-0 ${position === 'top' ? 'top-0' : 'bottom-0'} z-40 p-4`}>
        {bannerContent}
      </div>
    );
  }

  return bannerContent;
};

export default OfflineBanner;