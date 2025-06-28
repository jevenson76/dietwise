import { useMemo } from 'react';

/**
 * Custom hook for efficiently managing sorted arrays
 * Uses insertion sort for small additions rather than re-sorting the entire array
 */
export const useSortedArray = <T>(
  array: T[],
  compareFn: (a: T, b: T) => number,
  shouldMaintainSort: boolean = true
): T[] => {
  return useMemo(() => {
    if (!shouldMaintainSort) return array;
    
    // For small arrays or if already sorted, just sort normally
    if (array.length <= 10) {
      return [...array].sort(compareFn);
    }
    
    // For larger arrays, check if it's already mostly sorted
    let isAlreadySorted = true;
    for (let i = 1; i < array.length; i++) {
      if (compareFn(array[i - 1], array[i]) > 0) {
        isAlreadySorted = false;
        break;
      }
    }
    
    if (isAlreadySorted) {
      return array;
    }
    
    return [...array].sort(compareFn);
  }, [array, compareFn, shouldMaintainSort]);
};

/**
 * Efficiently insert an item into a sorted array while maintaining sort order
 */
export const insertSorted = <T>(
  sortedArray: T[],
  item: T,
  compareFn: (a: T, b: T) => number
): T[] => {
  // Find insertion point using binary search for O(log n) complexity
  let left = 0;
  let right = sortedArray.length;
  
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (compareFn(item, sortedArray[mid]) < 0) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }
  
  // Insert at the found position
  const newArray = [...sortedArray];
  newArray.splice(left, 0, item);
  return newArray;
};

/**
 * Efficiently remove an item from a sorted array
 */
export const removeSorted = <T>(
  sortedArray: T[],
  predicate: (item: T) => boolean
): T[] => {
  const index = sortedArray.findIndex(predicate);
  if (index === -1) return sortedArray;
  
  const newArray = [...sortedArray];
  newArray.splice(index, 1);
  return newArray;
};