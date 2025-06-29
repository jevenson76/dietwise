import { useState, useEffect, useCallback } from 'react';
import { FoodItem } from '@appTypes';
import { trackEvent } from '@services/analyticsService';
import { isPast, format } from 'date-fns';

const OFFLINE_FOOD_LOG_QUEUE_KEY = 'offlineFoodLogQueue';

interface UseFoodLogProps {
  onFoodAdded?: (food: FoodItem) => void;
  onFoodRemoved?: (id: string) => void;
}

export const useFoodLog = ({ onFoodAdded, onFoodRemoved }: UseFoodLogProps = {}) => {
  const [foodLog, setFoodLog] = useState<FoodItem[]>(() => {
    const savedLog = localStorage.getItem('foodLog');
    if (savedLog) {
      try {
        const parsedLog: FoodItem[] = JSON.parse(savedLog);
        if (Array.isArray(parsedLog)) {
          return parsedLog;
        }
      } catch (e) { }
    }
    return [];
  });

  const [offlineFoodQueue, setOfflineFoodQueue] = useState<FoodItem[]>(() => {
    const savedQueue = localStorage.getItem(OFFLINE_FOOD_LOG_QUEUE_KEY);
    return savedQueue ? JSON.parse(savedQueue) : [];
  });

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save food log to localStorage
  useEffect(() => {
    localStorage.setItem('foodLog', JSON.stringify(foodLog));
  }, [foodLog]);

  // Save offline queue to localStorage
  useEffect(() => {
    localStorage.setItem(OFFLINE_FOOD_LOG_QUEUE_KEY, JSON.stringify(offlineFoodQueue));
  }, [offlineFoodQueue]);

  const processFoodItemAddition = useCallback((foodItem: FoodItem): FoodItem => {
    // Process food item if needed
    return foodItem;
  }, []);

  const handleAddFood = useCallback((food: FoodItem) => {
    const processedFood = processFoodItemAddition(food);
    setFoodLog(prevLog => [...prevLog, processedFood]);
    
    if (!isOnline) {
      setOfflineFoodQueue(prevQueue => [...prevQueue, processedFood]);
    }
    
    onFoodAdded?.(processedFood);
    
    trackEvent('food_item_added', {
      foodName: processedFood.name,
      calories: processedFood.calories,
      hasAllMacros: !!(processedFood.protein && processedFood.carbs && processedFood.fat),
      source: 'manual',
      date: format(new Date(processedFood.timestamp), 'yyyy-MM-dd'),
    });
  }, [isOnline, processFoodItemAddition, onFoodAdded]);

  const handleRemoveFood = useCallback((id: string) => {
    setFoodLog(prevLog => {
      const itemToRemove = prevLog.find(item => item.id === id);
      if (itemToRemove) {
        trackEvent('food_item_removed', {
          foodName: itemToRemove.name,
          calories: itemToRemove.calories,
          source: 'manual',
        });
      }
      return prevLog.filter(item => item.id !== id);
    });
    onFoodRemoved?.(id);
  }, [onFoodRemoved]);

  const syncOfflineFoodLog = useCallback(async () => {
    if (!isOnline || offlineFoodQueue.length === 0) return;

    try {
      // In a real app, this would sync with a backend
      // For now, we just clear the queue as items are already in the local food log
      setOfflineFoodQueue([]);
      trackEvent('offline_queue_synced', {
        itemCount: offlineFoodQueue.length,
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to sync offline food log:', error);
      }
      trackEvent('offline_queue_sync_failed', {
        itemCount: offlineFoodQueue.length,
        error: (error as Error).message,
      });
    }
  }, [isOnline, offlineFoodQueue]);

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && offlineFoodQueue.length > 0) {
      syncOfflineFoodLog();
    }
  }, [isOnline, offlineFoodQueue.length, syncOfflineFoodLog]);

  return {
    foodLog,
    offlineFoodQueue,
    isOnline,
    handleAddFood,
    handleRemoveFood,
    syncOfflineFoodLog,
  };
};