import { api } from '../src/services/api';

interface MealIdea {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients?: string[];
  servingSize?: string;
}

interface FoodInfo {
  name: string;
  brand?: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  sources?: string[];
}

interface MealPlanDay {
  day: string;
  date: string;
  meals: {
    breakfast: MealIdea;
    lunch: MealIdea;
    dinner: MealIdea;
    snacks: Array<{ name: string; calories: number }>;
  };
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

interface ShoppingList {
  proteins: string[];
  produce: string[];
  dairy: string[];
  grains: string[];
  pantry: string[];
}

interface MealPlanResult {
  weekPlan: MealPlanDay[];
  shoppingList: ShoppingList;
}

/**
 * Secure Gemini Service - All API calls go through the backend
 */
export class SecureGeminiService {
  /**
   * Get meal ideas from the backend AI service
   */
  static async getMealIdeas(
    calorieTarget: number,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    dietaryRestrictions?: string[],
    preferences?: string[]
  ): Promise<MealIdea[]> {
    try {
      const response = await api.post('/ai/meal-ideas', {
        calorieTarget,
        mealType,
        dietaryRestrictions,
        preferences
      });

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to generate meal ideas');
    } catch (error: any) {
      if (error.message?.includes('Rate limit exceeded')) {
        throw new Error(error.message || 'Daily limit reached. Upgrade to Premium for more.');
      }
      throw error;
    }
  }

  /**
   * Get food information from UPC barcode
   */
  static async getFoodInfoFromUPC(upc: string): Promise<FoodInfo | null> {
    try {
      const response = await api.post('/ai/upc-scan', { upc });

      if (response.success && response.data) {
        return response.data;
      }

      return null;
    } catch (error: any) {
      if (error.message?.includes('Rate limit exceeded')) {
        throw new Error(error.message || 'Daily scan limit reached. Upgrade to Premium for more.');
      }
      if (error.message?.includes('Product not found')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Generate a 7-day meal plan
   */
  static async getSevenDayDietPlan(
    dailyCalorieTarget: number,
    dietaryRestrictions?: string[],
    preferences?: string[],
    allergies?: string[],
    startDate?: string
  ): Promise<MealPlanResult> {
    try {
      const response = await api.post('/ai/meal-plan', {
        dailyCalorieTarget,
        dietaryRestrictions,
        preferences,
        allergies,
        startDate
      });

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to generate meal plan');
    } catch (error: any) {
      if (error.message?.includes('Rate limit exceeded')) {
        throw new Error(error.message || 'Weekly limit reached. Upgrade to Premium for more.');
      }
      throw error;
    }
  }

  /**
   * Get AI usage statistics
   */
  static async getUsageStats(): Promise<{
    usage: {
      mealIdeas: { used: number; limit: number; resetAt: Date };
      upcScans: { used: number; limit: number; resetAt: Date };
      mealPlans: { used: number; limit: number; resetAt: Date };
    };
    isPremium: boolean;
  }> {
    try {
      const response = await api.get('/ai/usage');
      return response;
    } catch (error) {
      throw new Error('Failed to get usage statistics');
    }
  }
}

// Export the same interface as the old service for compatibility
export const getMealIdeas = SecureGeminiService.getMealIdeas;
export const getFoodInfoFromUPC = SecureGeminiService.getFoodInfoFromUPC;
export const getSevenDayDietPlan = SecureGeminiService.getSevenDayDietPlan;