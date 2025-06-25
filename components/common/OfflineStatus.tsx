import React, { useState, useEffect } from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import AnimatedCard from './AnimatedCard';
import ProgressIndicator from './ProgressIndicator';

interface OfflineCapability {
  id: string;
  label: string;
  icon: string;
  available: boolean;
  description: string;
}

interface OfflineStatusProps {
  isOnline: boolean;
  pendingItems?: {
    foodLog?: number;
    weight?: number;
    goals?: number;
    other?: number;
  };
  lastSyncTime?: string;
  onSync?: () => void;
  onRetry?: () => void;
  isSyncing?: boolean;
  syncProgress?: number;
  className?: string;
  compact?: boolean;
}

const OfflineStatus: React.FC<OfflineStatusProps> = ({
  isOnline,
  pendingItems = {},
  lastSyncTime,
  onSync,
  onRetry,
  isSyncing = false,
  syncProgress = 0,
  className = '',
  compact = false
}) => {
  const { isMobile } = useResponsive();
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'poor' | 'none'>('none');
  const [estimatedSyncTime, setEstimatedSyncTime] = useState<number>(0);

  const totalPending = Object.values(pendingItems).reduce((sum, count) => sum + (count || 0), 0);

  useEffect(() => {
    if (isOnline) {
      // Simulate connection quality detection
      const detectConnectionQuality = async () => {
        try {
          const startTime = performance.now();
          await fetch('/api/ping', { 
            method: 'HEAD',
            cache: 'no-cache'
          });
          const duration = performance.now() - startTime;
          
          if (duration < 500) {
            setConnectionQuality('good');
          } else {
            setConnectionQuality('poor');
          }
        } catch {
          setConnectionQuality('none');
        }
      };

      detectConnectionQuality();
      
      // Estimate sync time based on pending items
      const baseTime = 2; // seconds per item
      const estimatedTime = Math.max(totalPending * baseTime, 5);
      setEstimatedSyncTime(estimatedTime);
    } else {
      setConnectionQuality('none');
    }
  }, [isOnline, totalPending]);

  const offlineCapabilities: OfflineCapability[] = [
    {
      id: 'food-logging',
      label: 'Food Logging',
      icon: 'fas fa-utensils',
      available: true,
      description: 'Log meals and track calories'
    },
    {
      id: 'weight-tracking',
      label: 'Weight Tracking',
      icon: 'fas fa-weight',
      available: true,
      description: 'Record weight measurements'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: 'fas fa-chart-line',
      available: true,
      description: 'View progress and trends'
    },
    {
      id: 'food-library',
      label: 'Food Library',
      icon: 'fas fa-book',
      available: true,
      description: 'Access saved foods and meals'
    },
    {
      id: 'barcode-scan',
      label: 'Barcode Scanning',
      icon: 'fas fa-barcode',
      available: false,
      description: 'Requires internet connection'
    },
    {
      id: 'ai-features',
      label: 'AI Suggestions',
      icon: 'fas fa-robot',
      available: false,
      description: 'Requires internet connection'
    }
  ];

  const getConnectionIcon = () => {
    if (!isOnline) return 'fa-wifi-slash';
    if (connectionQuality === 'good') return 'fa-wifi';
    if (connectionQuality === 'poor') return 'fa-signal';
    return 'fa-wifi-weak';
  };

  const getConnectionColor = () => {
    if (!isOnline) return 'text-red-500';
    if (connectionQuality === 'good') return 'text-green-500';
    if (connectionQuality === 'poor') return 'text-yellow-500';
    return 'text-orange-500';
  };

  const formatLastSync = (timestamp: string) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (compact) {
    return (
      <div className={`bg-bg-card border border-border-default rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className={`fas ${getConnectionIcon()} ${getConnectionColor()}`} />
            <span className="text-sm font-medium text-text-default">
              {isOnline ? 'Connected' : 'Offline Mode'}
            </span>
            {totalPending > 0 && (
              <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs px-2 py-1 rounded-full">
                {totalPending} pending
              </span>
            )}
          </div>
          
          {isOnline && totalPending > 0 && onSync && (
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-xs px-3 py-1 rounded-md transition-colors"
            >
              {isSyncing ? (
                <>
                  <i className="fas fa-spinner animate-spin mr-1"></i>
                  Syncing...
                </>
              ) : (
                <>
                  <i className="fas fa-sync mr-1"></i>
                  Sync
                </>
              )}
            </button>
          )}
        </div>
        
        {isSyncing && syncProgress > 0 && (
          <div className="mt-2">
            <ProgressIndicator
              value={syncProgress}
              max={100}
              size="sm"
              color="primary"
              showPercentage={true}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <AnimatedCard
      title="Connection Status"
      icon={getConnectionIcon()}
      iconColor={getConnectionColor()}
      animation="fade"
      className={className}
    >
      <div className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center space-x-3">
            <i className={`fas ${getConnectionIcon()} ${getConnectionColor()} text-lg`} />
            <div>
              <p className="font-medium text-text-default">
                {isOnline ? 'Connected' : 'Offline Mode'}
              </p>
              <p className="text-sm text-text-alt">
                {isOnline 
                  ? connectionQuality === 'good' 
                    ? 'Strong connection'
                    : connectionQuality === 'poor'
                    ? 'Weak connection'
                    : 'Checking connection...'
                  : 'No internet connection'
                }
              </p>
            </div>
          </div>
          
          {lastSyncTime && (
            <div className="text-right">
              <p className="text-xs text-text-alt">Last sync</p>
              <p className="text-sm font-medium text-text-default">
                {formatLastSync(lastSyncTime)}
              </p>
            </div>
          )}
        </div>

        {/* Pending Items */}
        {totalPending > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-text-default flex items-center">
              <i className="fas fa-clock text-orange-500 mr-2"></i>
              Pending Sync ({totalPending} items)
            </h4>
            
            <div className="grid grid-cols-2 gap-2">
              {pendingItems.foodLog && (
                <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-md">
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                    Food Log: {pendingItems.foodLog}
                  </p>
                </div>
              )}
              {pendingItems.weight && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Weight: {pendingItems.weight}
                  </p>
                </div>
              )}
              {pendingItems.goals && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-md">
                  <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
                    Goals: {pendingItems.goals}
                  </p>
                </div>
              )}
              {pendingItems.other && (
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-300">
                    Other: {pendingItems.other}
                  </p>
                </div>
              )}
            </div>
            
            {isOnline && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-alt">
                  Estimated sync time: {estimatedSyncTime}s
                </p>
                {onSync && (
                  <button
                    onClick={onSync}
                    disabled={isSyncing}
                    className="bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    {isSyncing ? (
                      <>
                        <i className="fas fa-spinner animate-spin mr-2"></i>
                        Syncing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sync mr-2"></i>
                        Sync Now
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Sync Progress */}
        {isSyncing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-default">Syncing data...</span>
              <span className="text-sm text-text-alt">{syncProgress}%</span>
            </div>
            <ProgressIndicator
              value={syncProgress}
              max={100}
              color="primary"
              animated={true}
              striped={true}
            />
          </div>
        )}

        {/* Offline Capabilities */}
        <div className="space-y-3">
          <h4 className="font-medium text-text-default flex items-center">
            <i className="fas fa-cog text-gray-500 mr-2"></i>
            Available Features
          </h4>
          
          <div className="grid grid-cols-1 gap-2">
            {offlineCapabilities.map((capability) => (
              <div
                key={capability.id}
                className={`
                  flex items-center justify-between p-2 rounded-md border transition-colors
                  ${capability.available 
                    ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20' 
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                  }
                `}
              >
                <div className="flex items-center space-x-2">
                  <i 
                    className={`
                      ${capability.icon} 
                      ${capability.available 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-400 dark:text-gray-500'
                      }
                    `} 
                  />
                  <div>
                    <p className={`text-sm font-medium ${capability.available ? 'text-green-800 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>
                      {capability.label}
                    </p>
                    <p className={`text-xs ${capability.available ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}`}>
                      {capability.description}
                    </p>
                  </div>
                </div>
                
                <i 
                  className={`
                    fas 
                    ${capability.available 
                      ? 'fa-check-circle text-green-500' 
                      : 'fa-times-circle text-gray-400'
                    }
                  `} 
                />
              </div>
            ))}
          </div>
        </div>

        {/* Retry Connection */}
        {!isOnline && onRetry && (
          <button
            onClick={onRetry}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
          >
            <i className="fas fa-redo mr-2"></i>
            Retry Connection
          </button>
        )}
      </div>
    </AnimatedCard>
  );
};

export default OfflineStatus;