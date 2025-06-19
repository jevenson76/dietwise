
export enum Sex {
  MALE = 'male',
  FEMALE = 'female',
}

export enum ActivityLevel {
  SEDENTARY = 'sedentary', // Little or no exercise
  LIGHT = 'light',       // Light exercise/sports 1-3 days/week
  MODERATE = 'moderate',   // Moderate exercise/sports 3-5 days/week
  ACTIVE = 'active',       // Hard exercise/sports 6-7 days a week
  VERY_ACTIVE = 'very_active', // Very hard exercise/sports & physical job
}

export interface UserProfile {
  name: string | null;
  email?: string | null; 
  age: number | null;
  sex: Sex | null;
  height: {
    ft: number | null;
    in: number | null;
  } | null; 
  weight: number | null; // lbs
  activityLevel: ActivityLevel | null;
  targetWeight: number | null; // lbs
  targetDate: string | null; // ISO string, e.g., "2024-12-31"
  profileCreationDate?: string; // ISO string, when profile was first non-default
  startWeight?: number | null; // Initial weight when target was first set or profile created
}

export interface CalculatedMetrics {
  bmi: number | null;
  bmr: number | null;
  tdee: number | null;
  targetCalories: number | null;
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  servingSize?: string;
  timestamp: number; // For daily log
}

export interface MyFoodItem {
  id: string; 
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  servingSize?: string;
}

export interface MyMealIngredient extends MyFoodItem {
}

export interface MyMeal {
  id: string; 
  name: string;
  description?: string;
  ingredients: Array<{ foodId: string; servings: number }>; 
  totalCalories?: number; 
  totalProtein?: number; 
  totalCarbs?: number; 
  totalFat?: number; 
}


export interface ScannedFoodInfo {
  name: string;
  brand?: string;
  servingSize?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface GroundingSource {
  web: {
    uri?: string;
    title?: string;
  };
}

export interface Meal {
  name: string;
  description: string;
  calories?: number;
}

export interface DailyMealPlan {
  day: number;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snacks: Meal[];
  };
  dailyCalories?: number;
}

export interface ShoppingListItem {
  name:string;
  quantity?: string;
  brandSuggestion?: string;
  notes?: string;
}

export interface ShoppingListCategory {
  category: string;
  items: ShoppingListItem[];
}

export interface SevenDayPlanResponse {
  dailyPlans: DailyMealPlan[];
  shoppingList: ShoppingListCategory[];
}

export interface WeightEntry {
  date: string; // ISO string date (e.g., "2023-10-27")
  weight: number; // lbs
}

export interface MealReminder {
  enabled: boolean;
  time: string; // HH:mm format, e.g., "08:00"
}

export interface ReminderSettings {
  weighInFrequencyDays: number; 
  lastWeighInReminderDismissedDate: string | null; 
  mealReminders: {
    breakfast: MealReminder;
    lunch: MealReminder;
    dinner: MealReminder;
  };
  lastReviewPromptDate: string | null; 
  hasGivenFeedback: boolean; 
}

export interface SharePayload {
  title?: string;
  text: string;
  url?: string;
}

export interface StreakData {
  foodLogStreak: number; 
  lastFoodLogDate: string | null; 
}

export enum MilestoneType {
  WEIGHT_LOSS_X_LBS = 'WEIGHT_LOSS_X_LBS', 
  REACHED_TARGET_WEIGHT = 'REACHED_TARGET_WEIGHT',
  LOGGED_FOOD_X_DAYS_STREAK = 'LOGGED_FOOD_X_DAYS_STREAK', 
  PROFILE_COMPLETE = 'PROFILE_COMPLETE',
  FIRST_WEEK_COMPLETED = 'FIRST_WEEK_COMPLETED', 
  LOGGED_X_MEALS = 'LOGGED_X_MEALS_TOTAL', 
}

export interface Milestone {
  id: string; 
  type: MilestoneType;
  description: string; 
  dateAchieved: string; 
  value?: number | string; 
}

export type AppTheme = 'light' | 'dark';

// Notification Payload (conceptual for Service Worker)
export interface BaseNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag: string;
  data?: { 
    url?: string;
    type?: 'weigh_in' | 'meal_reminder' | 'general' | string; // Type to guide SW action
  };
  actions?: Array<{ action: string; title: string }>;
}
