import { useState, useEffect } from 'react';
import { PREMIUM_FEATURES } from '../src/constants/premiumFeatures';

interface UsageData {
  dailyBarcodeScans: number;
  dailyMealSuggestions: number;
  monthlyExports: number;
  monthlyMealPlans: number;
  customFoodsCount: number;
  customMealsCount: number;
  lastResetDate: string;
}

const USAGE_STORAGE_KEY = 'dietwise_usage_limits';

export const usePremiumLimits = (isPremiumUser: boolean) => {
  const [usage, setUsage] = useState<UsageData>(() => {
    const saved = localStorage.getItem(USAGE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return checkAndResetUsage(parsed);
    }
    return getDefaultUsage();
  });

  // Check and reset daily/monthly limits
  function checkAndResetUsage(data: UsageData): UsageData {
    const now = new Date();
    const lastReset = new Date(data.lastResetDate);
    const isNewDay = now.toDateString() !== lastReset.toDateString();
    const isNewMonth = now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear();

    let updated = { ...data };

    if (isNewDay) {
      updated.dailyBarcodeScans = 0;
      updated.dailyMealSuggestions = 0;
    }

    if (isNewMonth) {
      updated.monthlyExports = 0;
      updated.monthlyMealPlans = 0;
    }

    if (isNewDay || isNewMonth) {
      updated.lastResetDate = now.toISOString();
    }

    return updated;
  }

  function getDefaultUsage(): UsageData {
    return {
      dailyBarcodeScans: 0,
      dailyMealSuggestions: 0,
      monthlyExports: 0,
      monthlyMealPlans: 0,
      customFoodsCount: 0,
      customMealsCount: 0,
      lastResetDate: new Date().toISOString(),
    };
  }

  // Save usage to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage));
  }, [usage]);

  // Check limits
  const canScanBarcode = () => {
    if (isPremiumUser) return { allowed: true, remaining: Infinity };
    const remaining = PREMIUM_FEATURES.DAILY_BARCODE_SCANS - usage.dailyBarcodeScans;
    return { allowed: remaining > 0, remaining };
  };

  const canGetMealSuggestion = () => {
    if (isPremiumUser) return { allowed: true, remaining: Infinity };
    const remaining = PREMIUM_FEATURES.DAILY_MEAL_SUGGESTIONS - usage.dailyMealSuggestions;
    return { allowed: remaining > 0, remaining };
  };

  const canExport = () => {
    if (isPremiumUser) return { allowed: true, remaining: Infinity };
    const remaining = PREMIUM_FEATURES.EXPORT_LIMIT_PER_MONTH - usage.monthlyExports;
    return { allowed: remaining > 0, remaining };
  };

  const canExportData = () => {
    const result = canExport();
    return result.allowed;
  };

  const canGenerateMealPlan = () => {
    if (isPremiumUser) return { allowed: true, remaining: Infinity };
    const remaining = PREMIUM_FEATURES.MEAL_PLAN_GENERATIONS_PER_MONTH - usage.monthlyMealPlans;
    return { allowed: remaining > 0, remaining };
  };

  const canAddCustomFood = () => {
    if (isPremiumUser) return { allowed: true, remaining: Infinity };
    const remaining = PREMIUM_FEATURES.CUSTOM_FOODS_LIMIT - usage.customFoodsCount;
    return { allowed: remaining > 0, remaining };
  };

  const canAddCustomMeal = () => {
    if (isPremiumUser) return { allowed: true, remaining: Infinity };
    const remaining = PREMIUM_FEATURES.CUSTOM_MEALS_LIMIT - usage.customMealsCount;
    return { allowed: remaining > 0, remaining };
  };

  // Increment usage functions
  const incrementBarcodeScans = () => {
    setUsage(prev => ({
      ...checkAndResetUsage(prev),
      dailyBarcodeScans: prev.dailyBarcodeScans + 1,
    }));
  };

  const incrementMealSuggestions = () => {
    setUsage(prev => ({
      ...checkAndResetUsage(prev),
      dailyMealSuggestions: prev.dailyMealSuggestions + 1,
    }));
  };

  const incrementExports = () => {
    setUsage(prev => ({
      ...checkAndResetUsage(prev),
      monthlyExports: prev.monthlyExports + 1,
    }));
  };

  const incrementMealPlans = () => {
    setUsage(prev => ({
      ...checkAndResetUsage(prev),
      monthlyMealPlans: prev.monthlyMealPlans + 1,
    }));
  };

  const incrementCustomFoods = () => {
    setUsage(prev => ({
      ...prev,
      customFoodsCount: prev.customFoodsCount + 1,
    }));
  };

  const incrementCustomMeals = () => {
    setUsage(prev => ({
      ...prev,
      customMealsCount: prev.customMealsCount + 1,
    }));
  };

  const decrementCustomFoods = () => {
    setUsage(prev => ({
      ...prev,
      customFoodsCount: Math.max(0, prev.customFoodsCount - 1),
    }));
  };

  const decrementCustomMeals = () => {
    setUsage(prev => ({
      ...prev,
      customMealsCount: Math.max(0, prev.customMealsCount - 1),
    }));
  };

  return {
    usage,
    limits: {
      canScanBarcode,
      canGetMealSuggestion,
      canExport,
      canExportData,
      canGenerateMealPlan,
      canAddCustomFood,
      canAddCustomMeal,
    },
    increment: {
      barcodeScans: incrementBarcodeScans,
      mealSuggestions: incrementMealSuggestions,
      exports: incrementExports,
      mealPlans: incrementMealPlans,
      customFoods: incrementCustomFoods,
      customMeals: incrementCustomMeals,
    },
    decrement: {
      customFoods: decrementCustomFoods,
      customMeals: decrementCustomMeals,
    },
  };
};