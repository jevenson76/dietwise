// Premium Feature Configuration
export const PREMIUM_FEATURES = {
  // Pricing
  MONTHLY_PRICE: 4.99,
  YEARLY_PRICE: 39.99,
  MONTHLY_PRICE_DISPLAY: '$4.99',
  YEARLY_PRICE_DISPLAY: '$39.99',
  YEARLY_SAVINGS_PERCENT: 33, // Save 33% with yearly
  TRIAL_DAYS: 7,
  LAUNCH_DISCOUNT_PERCENT: 50, // 50% off first month

  // Feature Limits for Free Users
  DAILY_BARCODE_SCANS: 5,
  DAILY_MEAL_SUGGESTIONS: 3,
  HISTORICAL_DATA_DAYS: 30,
  CUSTOM_FOODS_LIMIT: 20,
  CUSTOM_MEALS_LIMIT: 10,
  EXPORT_LIMIT_PER_MONTH: 2,
  MEAL_PLAN_GENERATIONS_PER_MONTH: 3,

  // Premium Benefits
  UNLIMITED_BARCODE_SCANS: true,
  UNLIMITED_MEAL_SUGGESTIONS: true,
  UNLIMITED_HISTORICAL_DATA: true,
  UNLIMITED_CUSTOM_FOODS: true,
  UNLIMITED_CUSTOM_MEALS: true,
  UNLIMITED_EXPORTS: true,
  UNLIMITED_MEAL_PLANS: true,
  ADVANCED_ANALYTICS: true,
  CUSTOM_MACRO_TARGETS: true,
  PDF_EXPORTS: true,
  NO_ADS: true,
  PRIORITY_AI_SUPPORT: true,
  FAMILY_PROFILES: true,
  RECIPE_IMPORT_EXPORT: true,
};

// Feature access messages
export const PREMIUM_MESSAGES = {
  BARCODE_LIMIT: `You've reached your daily limit of ${PREMIUM_FEATURES.DAILY_BARCODE_SCANS} barcode scans. Upgrade to Premium for unlimited scanning!`,
  MEAL_SUGGESTION_LIMIT: `You've used all ${PREMIUM_FEATURES.DAILY_MEAL_SUGGESTIONS} meal suggestions for today. Upgrade to Premium for unlimited AI-powered suggestions!`,
  HISTORICAL_DATA_LIMIT: `Free users can only view the last ${PREMIUM_FEATURES.HISTORICAL_DATA_DAYS} days. Upgrade to Premium to access your complete history!`,
  CUSTOM_FOOD_LIMIT: `You've reached the limit of ${PREMIUM_FEATURES.CUSTOM_FOODS_LIMIT} custom foods. Upgrade to Premium for unlimited storage!`,
  CUSTOM_MEAL_LIMIT: `You've reached the limit of ${PREMIUM_FEATURES.CUSTOM_MEALS_LIMIT} custom meals. Upgrade to Premium for unlimited meals!`,
  EXPORT_LIMIT: `You've used your ${PREMIUM_FEATURES.EXPORT_LIMIT_PER_MONTH} exports this month. Upgrade to Premium for unlimited exports!`,
  MEAL_PLAN_LIMIT: `You've generated ${PREMIUM_FEATURES.MEAL_PLAN_GENERATIONS_PER_MONTH} meal plans this month. Upgrade to Premium for unlimited meal planning!`,

  // Value propositions
  UPGRADE_VALUE_PROP: 'Premium users lose 2x more weight and save 5+ hours per week on meal planning!',
  LIMITED_TIME_OFFER: `Limited time: Get ${PREMIUM_FEATURES.LAUNCH_DISCOUNT_PERCENT}% off your first month!`,
};