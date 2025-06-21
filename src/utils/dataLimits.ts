import { FoodItem, WeightEntry } from '@appTypes';
import { subDays, isAfter } from 'date-fns';

export const HISTORICAL_DATA_LIMIT_DAYS = 30;

export const filterByHistoricalLimit = <T extends { timestamp: number } | { date: string }>(
  data: T[],
  isPremiumUser: boolean
): T[] => {
  if (isPremiumUser) {
    return data; // Premium users have no limit
  }

  const limitDate = subDays(new Date(), HISTORICAL_DATA_LIMIT_DAYS);
  
  return data.filter(item => {
    const itemDate = 'timestamp' in item 
      ? new Date(item.timestamp) 
      : new Date(item.date);
    return isAfter(itemDate, limitDate);
  });
};

export const getHistoricalLimitMessage = () => {
  return `Free users can only view data from the last ${HISTORICAL_DATA_LIMIT_DAYS} days. Upgrade to Premium to access your complete history.`;
};

export const isDataOutsideLimit = (dateStr: string | number, isPremiumUser: boolean): boolean => {
  if (isPremiumUser) return false;
  
  const date = typeof dateStr === 'number' ? new Date(dateStr) : new Date(dateStr);
  const limitDate = subDays(new Date(), HISTORICAL_DATA_LIMIT_DAYS);
  
  return !isAfter(date, limitDate);
};