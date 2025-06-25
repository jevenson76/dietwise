import React, { useState } from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import AnimatedCard from './AnimatedCard';
import AnimatedList from './AnimatedList';
import StatusIndicator from './StatusIndicator';
import { FoodItem } from '../../types';

interface QueueItem {
  id: string;
  type: 'food' | 'weight' | 'goal' | 'meal' | 'other';
  title: string;
  subtitle?: string;
  timestamp: number;
  data: any;
  size?: number; // Estimated size in KB
  priority?: 'low' | 'normal' | 'high';
}

interface OfflineQueueProps {
  items: QueueItem[];
  isOnline: boolean;
  onSync?: (items: QueueItem[]) => void;
  onRemoveItem?: (itemId: string) => void;
  onClearQueue?: () => void;
  isSyncing?: boolean;
  syncProgress?: Record<string, number>; // Progress per item ID
  maxDisplayItems?: number;
  className?: string;
  compact?: boolean;
}

const OfflineQueue: React.FC<OfflineQueueProps> = ({
  items,
  isOnline,
  onSync,
  onRemoveItem,
  onClearQueue,
  isSyncing = false,
  syncProgress = {},
  maxDisplayItems = 10,
  className = '',
  compact = false
}) => {
  const { isMobile } = useResponsive();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const toggleItemExpansion = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const selectAllItems = () => {
    setSelectedItems(new Set(items.map(item => item.id)));
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const syncSelectedItems = () => {
    const selectedItemsList = items.filter(item => selectedItems.has(item.id));
    onSync?.(selectedItemsList);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'food': return 'fas fa-utensils';
      case 'weight': return 'fas fa-weight';
      case 'goal': return 'fas fa-bullseye';
      case 'meal': return 'fas fa-plate-wheat';
      default: return 'fas fa-file';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'food': return 'text-green-500';
      case 'weight': return 'text-blue-500';
      case 'goal': return 'text-purple-500';
      case 'meal': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-300 dark:border-red-700';
      case 'normal': return 'border-yellow-300 dark:border-yellow-700';
      case 'low': return 'border-gray-300 dark:border-gray-700';
      default: return 'border-gray-300 dark:border-gray-700';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const totalSize = items.reduce((sum, item) => sum + (item.size || 0), 0);
  const displayItems = items.slice(0, maxDisplayItems);
  const hasMoreItems = items.length > maxDisplayItems;

  if (items.length === 0) {
    return (
      <div className={`bg-bg-card border border-border-default rounded-lg p-4 ${className}`}>
        <div className="text-center text-text-alt">
          <i className="fas fa-check-circle text-green-500 text-2xl mb-2"></i>
          <p className="text-sm">All data is synced</p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="fas fa-clock text-orange-500"></i>
            <span className="text-sm font-medium text-orange-800 dark:text-orange-300">
              {items.length} items queued
            </span>
            {totalSize > 0 && (
              <span className="text-xs text-orange-600 dark:text-orange-400">
                ({totalSize.toFixed(1)} KB)
              </span>
            )}
          </div>
          
          {isOnline && onSync && (
            <button
              onClick={() => onSync(items)}
              disabled={isSyncing}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs px-3 py-1 rounded-md transition-colors"
            >
              {isSyncing ? (
                <>
                  <i className="fas fa-spinner animate-spin mr-1"></i>
                  Syncing...
                </>
              ) : (
                <>
                  <i className="fas fa-upload mr-1"></i>
                  Sync All
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <AnimatedCard
      title="Offline Queue"
      icon="fas fa-clock"
      iconColor="text-orange-500"
      animation="slide"
      className={className}
    >
      <div className="space-y-4">
        {/* Queue Summary */}
        <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div>
            <p className="font-medium text-orange-800 dark:text-orange-300">
              {items.length} items waiting to sync
            </p>
            <p className="text-sm text-orange-600 dark:text-orange-400">
              Total size: {totalSize.toFixed(1)} KB
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {items.length > 1 && (
              <>
                <button
                  onClick={selectedItems.size === items.length ? clearSelection : selectAllItems}
                  className="text-xs text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200"
                >
                  {selectedItems.size === items.length ? 'Clear' : 'Select All'}
                </button>
                {selectedItems.size > 0 && (
                  <span className="text-xs text-orange-600 dark:text-orange-400">
                    {selectedItems.size} selected
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {isOnline && onSync && (
            <>
              <button
                onClick={() => onSync(items)}
                disabled={isSyncing}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded-md transition-colors flex-1 min-w-[120px]"
              >
                {isSyncing ? (
                  <>
                    <i className="fas fa-spinner animate-spin mr-2"></i>
                    Syncing All...
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload mr-2"></i>
                    Sync All ({items.length})
                  </>
                )}
              </button>
              
              {selectedItems.size > 0 && (
                <button
                  onClick={syncSelectedItems}
                  disabled={isSyncing}
                  className="bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white px-4 py-2 rounded-md transition-colors"
                >
                  <i className="fas fa-check mr-2"></i>
                  Sync Selected ({selectedItems.size})
                </button>
              )}
            </>
          )}
          
          {onClearQueue && (
            <button
              onClick={onClearQueue}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              <i className="fas fa-trash mr-2"></i>
              Clear Queue
            </button>
          )}
        </div>

        {/* Queue Items */}
        <AnimatedList animation="stagger" delay={100} className="space-y-2 max-h-96 overflow-y-auto">
          {displayItems.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            const isSelected = selectedItems.has(item.id);
            const itemProgress = syncProgress[item.id] || 0;
            const isItemSyncing = itemProgress > 0 && itemProgress < 100;

            return (
              <div
                key={item.id}
                className={`
                  border rounded-lg transition-all duration-200
                  ${isSelected ? 'border-teal-400 dark:border-teal-600 bg-teal-50 dark:bg-teal-900/20' : getPriorityColor(item.priority || 'normal')}
                  ${isItemSyncing ? 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20' : ''}
                `}
              >
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {items.length > 1 && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleItemSelection(item.id)}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                      )}
                      
                      <i className={`${getTypeIcon(item.type)} ${getTypeColor(item.type)}`} />
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-default truncate">
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="text-sm text-text-alt truncate">
                            {item.subtitle}
                          </p>
                        )}
                        <p className="text-xs text-text-alt">
                          {formatTimestamp(item.timestamp)}
                          {item.size && ` • ${item.size.toFixed(1)} KB`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {isItemSyncing && (
                        <StatusIndicator
                          status="loading"
                          size="sm"
                          label={`${itemProgress}%`}
                        />
                      )}
                      
                      {item.priority === 'high' && (
                        <i className="fas fa-exclamation-triangle text-red-500 text-xs"></i>
                      )}
                      
                      <button
                        onClick={() => toggleItemExpansion(item.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                      >
                        <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-xs`}></i>
                      </button>
                      
                      {onRemoveItem && (
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-red-400 hover:text-red-600 dark:hover:text-red-300 p-1"
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Item Progress */}
                  {isItemSyncing && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${itemProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-text-alt space-y-1">
                        <p><strong>Type:</strong> {item.type}</p>
                        <p><strong>Created:</strong> {new Date(item.timestamp).toLocaleString()}</p>
                        {item.priority && (
                          <p><strong>Priority:</strong> {item.priority}</p>
                        )}
                        {item.size && (
                          <p><strong>Size:</strong> {item.size.toFixed(2)} KB</p>
                        )}
                        <details className="mt-2">
                          <summary className="cursor-pointer text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-200">
                            View Raw Data
                          </summary>
                          <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                            {JSON.stringify(item.data, null, 2)}
                          </pre>
                        </details>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </AnimatedList>

        {/* Show More */}
        {hasMoreItems && (
          <div className="text-center">
            <p className="text-sm text-text-alt">
              And {items.length - maxDisplayItems} more items...
            </p>
          </div>
        )}
      </div>
    </AnimatedCard>
  );
};

export default OfflineQueue;