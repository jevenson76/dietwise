import { ActivityLevel, UserProfile, ReminderSettings, Sex } from './types';

export const GEMINI_MODEL_NAME = "gemini-2.5-flash-preview-04-17";

export const activityLevelMultipliers: Record<ActivityLevel, number> = {
  [ActivityLevel.SEDENTARY]: 1.2,
  [ActivityLevel.LIGHT]: 1.375,
  [ActivityLevel.MODERATE]: 1.55,
  [ActivityLevel.ACTIVE]: 1.725,
  [ActivityLevel.VERY_ACTIVE]: 1.9,
};

export const defaultUserProfile: UserProfile = {
  name: null,
  email: null,
  age: null,
  sex: null,
  height: { ft: null, in: null }, 
  weight: null,
  activityLevel: null,
  targetWeight: null,
  targetDate: null, // Added
  profileCreationDate: undefined,
  startWeight: null,
};

export const LBS_PER_WEEK_TARGET_CHANGE = 1.0; // Target 1 lb per week change (loss or gain)

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  weighInFrequencyDays: 7, // Default to remind weekly
  lastWeighInReminderDismissedDate: null,
  mealReminders: {
    breakfast: { enabled: false, time: "08:00" },
    lunch: { enabled: false, time: "12:30" },
    dinner: { enabled: false, time: "18:30" },
  },
  lastReviewPromptDate: null,
  hasGivenFeedback: false,
};

export const DEFAULT_STREAK_DATA = {
  foodLogStreak: 0,
  lastFoodLogDate: null,
};

export const WEIGHT_MILESTONE_INCREMENT = 5; // lbs
export const STREAK_MILESTONES_DAYS = [7, 30, 90, 182, 365]; // Days for logging streak milestones
export const TOTAL_LOGGED_MEALS_MILESTONES = [30, 100, 250, 500];