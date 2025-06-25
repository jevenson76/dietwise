import React, { useState, useEffect } from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface OfflineIndicatorProps {
  isOnline: boolean;
  variant?: 'badge' | 'banner' | 'toast' | 'dot' | 'status';
  size?: 'sm' | 'md' | 'lg';
  showOfflineFeatures?: boolean;
  onSyncClick?: () => void;
  pendingCount?: number;
  className?: string;
  autoHide?: boolean;
  autoHideDelay?: number;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isOnline,
  variant = 'badge',
  size = 'md',
  showOfflineFeatures = false,
  onSyncClick,
  pendingCount = 0,
  className = '',
  autoHide = false,
  autoHideDelay = 5000
}) => {
  const { isMobile } = useResponsive();
  const [showIndicator, setShowIndicator] = useState(!isOnline);
  const [justWentOnline, setJustWentOnline] = useState(false);

  useEffect(() => {
    if (isOnline && !showIndicator) {
      // Just came back online
      setJustWentOnline(true);
      setShowIndicator(true);
      
      if (autoHide) {
        const timer = setTimeout(() => {
          setShowIndicator(false);
          setJustWentOnline(false);
        }, autoHideDelay);
        return () => clearTimeout(timer);
      }
    } else if (!isOnline) {
      setShowIndicator(true);
      setJustWentOnline(false);
    }
  }, [isOnline, autoHide, autoHideDelay, showIndicator]);

  if (!showIndicator) return null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const dotSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  if (variant === 'dot') {
    return (
      <div className={`relative inline-flex ${className}`}>
        <div
          className={`
            ${dotSizeClasses[size]}
            rounded-full
            ${isOnline 
              ? justWentOnline 
                ? 'bg-green-500 animate-pulse' 
                : 'bg-green-500'
              : 'bg-red-500 animate-pulse'
            }
          `}
          title={isOnline 
            ? justWentOnline 
              ? 'Back online!' 
              : 'Online'
            : 'Offline - Some features limited'
          }
        />
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
            {pendingCount > 99 ? '99+' : pendingCount}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'status') {
    return (
      <div className={`flex items-center space-x-2 ${sizeClasses[size]} ${className}`}>
        <div
          className={`
            ${dotSizeClasses[size]}
            rounded-full
            ${isOnline 
              ? justWentOnline 
                ? 'bg-green-500 animate-pulse' 
                : 'bg-green-500'
              : 'bg-red-500 animate-pulse'
            }
          `}
        />
        <span className={`font-medium ${isOnline ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
          {isOnline 
            ? justWentOnline 
              ? 'Back Online' 
              : 'Online'
            : 'Offline Mode'
          }
        </span>
        {pendingCount > 0 && (
          <span className="text-xs text-orange-600 dark:text-orange-400">
            ({pendingCount} pending)
          </span>
        )}
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        className={`
          w-full p-3 border-l-4 rounded-md transition-all duration-300 animate-slide-down
          ${isOnline 
            ? justWentOnline
              ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600'
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600'
            : 'bg-orange-50 dark:bg-orange-900/20 border-orange-400 dark:border-orange-600'
          }
          ${className}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <i 
                className={`
                  fas 
                  ${isOnline 
                    ? justWentOnline 
                      ? 'fa-wifi text-green-500 animate-pulse'
                      : 'fa-wifi text-blue-500'
                    : 'fa-wifi-slash text-orange-500 animate-pulse'
                  }
                `}
              />
              <div>
                <p className={`font-medium ${isOnline ? 'text-green-800 dark:text-green-200' : 'text-orange-800 dark:text-orange-200'}`}>
                  {isOnline 
                    ? justWentOnline 
                      ? 'Connection Restored!' 
                      : 'You\'re Online'
                    : 'You\'re Offline'
                  }
                </p>
                <p className={`text-sm ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                  {isOnline 
                    ? justWentOnline
                      ? pendingCount > 0 
                        ? `${pendingCount} items ready to sync`
                        : 'All features are now available'
                      : 'All features available'
                    : 'Some features are limited. Your data is saved locally.'
                  }
                </p>
                {showOfflineFeatures && !isOnline && (
                  <p className="text-xs text-orange-500 dark:text-orange-400 mt-1">
                    ✓ Food logging ✓ View data ✓ Analytics ✓ Settings
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {isOnline && pendingCount > 0 && onSyncClick && (
            <button
              onClick={onSyncClick}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-3 py-1 rounded-md text-sm transition-colors"
            >
              <i className="fas fa-sync mr-1"></i>
              Sync Now
            </button>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'toast') {
    return (
      <div
        className={`
          fixed z-50 mx-4 p-4 rounded-lg shadow-lg border transition-all duration-300 animate-slide-up
          ${isMobile ? 'bottom-20 left-0 right-0' : 'top-4 right-4 max-w-sm'}
          ${isOnline 
            ? justWentOnline
              ? 'bg-green-50 dark:bg-green-900/90 border-green-200 dark:border-green-700'
              : 'bg-blue-50 dark:bg-blue-900/90 border-blue-200 dark:border-blue-700'
            : 'bg-orange-50 dark:bg-orange-900/90 border-orange-200 dark:border-orange-700'
          }
          ${className}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <i 
              className={`
                fas 
                ${isOnline 
                  ? justWentOnline 
                    ? 'fa-check-circle text-green-500 animate-bounce'
                    : 'fa-wifi text-blue-500'
                  : 'fa-exclamation-triangle text-orange-500 animate-pulse'
                }
              `}
            />
            <div>
              <p className={`font-medium ${isOnline ? 'text-green-800 dark:text-green-200' : 'text-orange-800 dark:text-orange-200'}`}>
                {isOnline 
                  ? justWentOnline 
                    ? 'Back Online!' 
                    : 'Connected'
                  : 'Offline Mode'
                }
              </p>
              <p className={`text-sm ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                {isOnline 
                  ? pendingCount > 0 
                    ? `${pendingCount} items ready to sync`
                    : 'All features available'
                  : 'Limited features, data saved locally'
                }
              </p>
            </div>
          </div>
          
          {autoHide && (
            <button
              onClick={() => setShowIndicator(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
        
        {isOnline && pendingCount > 0 && onSyncClick && (
          <button
            onClick={onSyncClick}
            className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors"
          >
            <i className="fas fa-sync mr-2"></i>
            Sync {pendingCount} Items
          </button>
        )}
      </div>
    );
  }

  // Default badge variant
  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium transition-all duration-200
        ${sizeClasses[size]}
        ${isOnline 
          ? justWentOnline
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 animate-pulse'
            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
          : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 animate-pulse'
        }
        ${className}
      `}
    >
      <i 
        className={`
          fas mr-1.5
          ${isOnline 
            ? justWentOnline 
              ? 'fa-check-circle' 
              : 'fa-wifi'
            : 'fa-wifi-slash'
          }
        `}
      />
      {isOnline 
        ? justWentOnline 
          ? 'Back Online' 
          : 'Online'
        : 'Offline'
      }
      {pendingCount > 0 && (
        <span className="ml-1 bg-orange-500 text-white text-xs rounded-full px-1 min-w-[16px] h-4 flex items-center justify-center">
          {pendingCount > 99 ? '99+' : pendingCount}
        </span>
      )}
    </span>
  );
};

export default OfflineIndicator;