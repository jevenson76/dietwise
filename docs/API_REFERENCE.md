# DietWise API Reference

## Overview
This document provides a comprehensive reference for all services, hooks, and utilities in the DietWise freemium implementation.

## Hooks

### `usePremiumLimits`

Premium feature usage tracking and limit enforcement.

```typescript
const premiumLimits = usePremiumLimits(isPremiumUser: boolean);
```

#### Returns
```typescript
{
  usage: {
    dailyBarcodeScans: number;
    dailyMealSuggestions: number;
    monthlyExports: number;
    monthlyMealPlans: number;
    customFoodsCount: number;
    customMealsCount: number;
    lastResetDate: string;
  };
  limits: {
    canScanBarcode: () => { allowed: boolean; remaining: number };
    canGetMealSuggestion: () => { allowed: boolean; remaining: number };
    canExport: () => { allowed: boolean; remaining: number };
    canExportData: () => boolean;
    canGenerateMealPlan: () => { allowed: boolean; remaining: number };
    canAddCustomFood: () => { allowed: boolean; remaining: number };
    canAddCustomMeal: () => { allowed: boolean; remaining: number };
  };
  increment: {
    barcodeScans: () => void;
    mealSuggestions: () => void;
    exports: () => void;
    mealPlans: () => void;
    customFoods: () => void;
    customMeals: () => void;
  };
  decrement: {
    customFoods: () => void;
    customMeals: () => void;
  };
}
```

## Services

### Stripe Service

#### `redirectToCheckout`
Initiates Stripe checkout session.

```typescript
async function redirectToCheckout(
  priceId: string,
  customerEmail?: string
): Promise<void>
```

**Parameters:**
- `priceId`: Stripe price ID (monthly or yearly)
- `customerEmail`: Optional customer email for prefill

**Example:**
```typescript
try {
  await redirectToCheckout(STRIPE_PRICES.monthly, 'user@example.com');
} catch (error) {
  console.error('Checkout failed:', error);
}
```

#### `activateSubscription`
Activates user subscription (for demo/testing).

```typescript
function activateSubscription(
  userId: string,
  plan: 'monthly' | 'yearly'
): void
```

### PDF Export Service

#### `exportFoodLogToPDF`
Generates PDF report from food log data.

```typescript
function exportFoodLogToPDF(
  foodLog: FoodItem[],
  userProfile: UserProfile,
  weightLog?: WeightEntry[],
  options?: ExportOptions
): jsPDF
```

**Options:**
```typescript
interface ExportOptions {
  includeWeightHistory?: boolean;
  includeMacroBreakdown?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}
```

**Example:**
```typescript
const pdf = exportFoodLogToPDF(foodLog, userProfile, weightLog, {
  dateRange: {
    start: subDays(new Date(), 30),
    end: new Date()
  },
  includeWeightHistory: true,
  includeMacroBreakdown: true
});

pdf.save('nutrition-report.pdf');
```

### Calculation Service

#### `calculateDefaultMacroTargets`
Calculates recommended macro targets based on calorie goal.

```typescript
function calculateDefaultMacroTargets(
  targetCalories: number | null
): {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}
```

**Example:**
```typescript
const macros = calculateDefaultMacroTargets(2000);
// Returns: { protein: 150, carbs: 200, fat: 67, fiber: 28 }
```

## Utilities

### Data Limits Utility

#### `filterByHistoricalLimit`
Filters data based on premium status and 30-day limit.

```typescript
function filterByHistoricalLimit<T extends { timestamp: number } | { date: string }>(
  data: T[],
  isPremiumUser: boolean
): T[]
```

**Example:**
```typescript
const filteredFoodLog = filterByHistoricalLimit(foodLog, isPremiumUser);
```

#### `getHistoricalLimitMessage`
Returns user-friendly message about data limits.

```typescript
function getHistoricalLimitMessage(): string
```

#### `isDataOutsideLimit`
Checks if specific date is outside free tier limit.

```typescript
function isDataOutsideLimit(
  dateStr: string | number,
  isPremiumUser: boolean
): boolean
```

## Components

### UpgradePrompt

Reusable upgrade call-to-action component.

```typescript
interface UpgradePromptProps {
  feature: string;
  message: string;
  icon?: string;
  onUpgradeClick: () => void;
  variant?: 'inline' | 'overlay' | 'banner';
  className?: string;
}
```

**Example:**
```typescript
<UpgradePrompt
  feature="Unlimited Scans"
  message="You've reached your daily limit. Upgrade for unlimited barcode scans!"
  icon="fas fa-barcode"
  variant="banner"
  onUpgradeClick={() => setUpgradeModalOpen(true)}
/>
```

### AdvancedAnalytics

Premium analytics dashboard component.

```typescript
interface AdvancedAnalyticsProps {
  foodLog: FoodItem[];
  isPremiumUser: boolean;
  onUpgradeClick: () => void;
}
```

**Features:**
- Calorie/macro trends
- Macro distribution
- Weekly comparisons
- Meal timing analysis

### CustomMacroTargets

Premium macro customization component.

```typescript
interface CustomMacroTargetsProps {
  currentTargets: MacroTargets;
  onUpdateTargets: (targets: MacroTargets) => void;
  isPremiumUser: boolean;
  onUpgradeClick: () => void;
  targetCalories: number | null;
}

interface MacroTargets {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}
```

### PDFExportButton

Export functionality with premium limits.

```typescript
interface PDFExportButtonProps {
  foodLog: FoodItem[];
  userProfile: UserProfile;
  weightLog?: WeightEntry[];
  isPremiumUser: boolean;
  onUpgradeClick: () => void;
  premiumLimits: {
    canExportData: () => boolean;
    onExport: () => void;
  };
}
```

## Constants

### Premium Features

```typescript
export const PREMIUM_FEATURES = {
  MONTHLY_PRICE: 9.99,
  YEARLY_PRICE: 79.00,
  DAILY_BARCODE_SCANS: 5,
  DAILY_MEAL_SUGGESTIONS: 3,
  EXPORT_LIMIT_PER_MONTH: 5,
  MEAL_PLAN_GENERATIONS_PER_MONTH: 2,
  CUSTOM_FOODS_LIMIT: 20,
  CUSTOM_MEALS_LIMIT: 10,
  HISTORICAL_DATA_DAYS: 30,
  TRIAL_DAYS: 7,
};
```

### Premium Messages

```typescript
export const PREMIUM_MESSAGES = {
  BARCODE_LIMIT: 'You\'ve reached your daily scan limit. Upgrade for unlimited scans!',
  MEAL_SUGGESTION_LIMIT: 'Daily AI suggestions used. Upgrade for unlimited meal ideas!',
  EXPORT_LIMIT: 'Monthly export limit reached. Upgrade for unlimited exports!',
  CUSTOM_FOOD_LIMIT: 'Food library full. Upgrade to save unlimited custom foods!',
  // ... more messages
};
```

## Type Definitions

### Core Types

```typescript
interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  servingSize?: string;
  timestamp: number;
  brand?: string;
  barcode?: string;
}

interface UserProfile {
  name: string | null;
  email?: string | null;
  age: number | null;
  sex: Sex | null;
  height: { ft: number | null; in: number | null } | null;
  weight: number | null;
  activityLevel: ActivityLevel | null;
  targetWeight: number | null;
  targetDate: string | null;
  customMacroTargets?: MacroTargets;
}

interface WeightEntry {
  date: string;
  weight: number;
  id: string;
}
```

## Storage Keys

LocalStorage keys used by the freemium system:

```typescript
const STORAGE_KEYS = {
  SUBSCRIPTION: 'dietwise_subscription',
  USER_SUBSCRIPTION: 'subscription_dietwise_user',
  USAGE_LIMITS: 'dietwise_usage_limits',
  USER_PROFILE: 'userProfile',
  FOOD_LOG: 'foodLog',
  WEIGHT_LOG: 'actualWeightLog',
};
```

## Error Handling

### Common Error Scenarios

```typescript
// Stripe checkout error
try {
  await redirectToCheckout(priceId);
} catch (error) {
  if (error.message.includes('network')) {
    showError('Network error. Please check your connection.');
  } else {
    showError('Payment processing failed. Please try again.');
  }
}

// PDF export error
try {
  const pdf = exportFoodLogToPDF(data);
  pdf.save();
} catch (error) {
  console.error('PDF generation failed:', error);
  showError('Export failed. Please try again.');
}

// Limit checking
const { allowed, remaining } = premiumLimits.limits.canScanBarcode();
if (!allowed) {
  showUpgradePrompt();
  return;
}
```

## Testing Utilities

### Mock Premium Status

```typescript
// Enable premium for testing
const enablePremiumTesting = () => {
  localStorage.setItem('dietwise_subscription', 'active');
  window.location.reload();
};

// Reset all limits
const resetUsageLimits = () => {
  localStorage.removeItem('dietwise_usage_limits');
  window.location.reload();
};

// Set specific usage
const setTestUsage = (usage: Partial<UsageData>) => {
  const current = JSON.parse(
    localStorage.getItem('dietwise_usage_limits') || '{}'
  );
  localStorage.setItem(
    'dietwise_usage_limits',
    JSON.stringify({ ...current, ...usage })
  );
};
```