# Empty States Audit - DietWise Codebase

This document contains all instances of empty states found in the DietWise codebase, organized by component and type.

## 1. Food Log Component (`/components/FoodLog.tsx`)

### Empty Food Log State (Lines 243-248)
```tsx
{(loggedItems.length === 0 && offlineQueue.length === 0) ? (
  <div className="text-center py-8 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-border-default">
    <i className="fas fa-utensils text-4xl text-slate-400 dark:text-slate-500 mb-3"></i>
    <p className="text-slate-500 dark:text-slate-400 font-medium">No food logged yet today.</p>
    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Scan or add items to get started!</p>
  </div>
) : (
```

**Current State:**
- Icon: Utensils icon
- Message: "No food logged yet today."
- Subtext: "Scan or add items to get started!"
- No call-to-action button

## 2. My Library Component (`/components/MyLibraryComponent.tsx`)

### Empty My Foods State (Lines 254-255)
```tsx
{myFoods.length === 0 ? (
  <p className="text-text-alt text-center py-4">No custom foods saved yet. Add your frequently eaten items!</p>
) : (
```

**Current State:**
- No icon
- Message: "No custom foods saved yet. Add your frequently eaten items!"
- No call-to-action button

### Empty My Meals State (Lines 288-289)
```tsx
{myMeals.length === 0 ? (
  <p className="text-text-alt text-center py-4">No custom meals created yet. Combine your foods into meals!</p>
) : (
```

**Current State:**
- No icon
- Message: "No custom meals created yet. Combine your foods into meals!"
- No call-to-action button

### No Foods Warning for Meal Creation (Line 434)
```tsx
{myFoods.length === 0 && <p className="text-xs text-orange-600 dark:text-orange-400">You need to add foods to 'My Foods' first to create meals.</p>}
```

## 3. Weight Chart Component (`/components/WeightChartComponent.tsx`)

### No Target Weight Set (Lines 36-43)
```tsx
if (!userProfile || userProfile.targetWeight === null) {
  ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height);
  ctx.font = "16px Inter, sans-serif"; 
  ctx.fillStyle = textColor; 
  ctx.textAlign = "center";
  ctx.fillText("Set a target weight in Profile to see your progress chart.", chartRef.current.width / 2, chartRef.current.height / 2);
  return;
}
```

**Current State:**
- No icon
- Message: "Set a target weight in Profile to see your progress chart."
- Rendered on canvas (not HTML)
- No call-to-action button

## 4. Weight Tracking Hook (`/src/hooks/useWeightTracking.ts`)

### Empty Weight Log Check (Line 93)
```tsx
if (actualWeightLog.length === 0) return null;
```

**Current State:**
- Returns null when no weight entries exist
- No UI component, just logic

## 5. Debug Log Viewer (`/src/components/debug/LogViewer.tsx`)

### No Logs Found (Lines 157-161)
```tsx
{filteredLogs.length === 0 ? (
  <div className="text-center text-gray-500 py-8">
    No logs found matching the current filters.
  </div>
) : (
```

**Current State:**
- No icon
- Message: "No logs found matching the current filters."
- No call-to-action

## 6. Meal Planner Component (`/components/MealPlannerComponent.tsx`)

### Profile Incomplete State (Lines 134-147)
```tsx
if (!isProfileComplete || !calorieTarget) {
  return (
    <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl mt-6 sm:mt-8">
      <h2 className="text-xl sm:text-2xl font-semibold text-text-default mb-4">
        <i className="fas fa-calendar-alt mr-2.5 text-sky-500 dark:text-sky-400"></i>7-Day Meal Plan & Shopping List
      </h2>
      <div className="bg-sky-50 dark:bg-sky-900/30 border-l-4 border-sky-400 text-sky-700 dark:text-sky-300 p-4 rounded-md text-center" role="status">
        <p className="font-medium">
          <i className="fas fa-info-circle mr-2"></i>
          Complete your profile and set a weight goal to generate a personalized 7-day meal plan and shopping list.
        </p>
      </div>
    </div>
  );
}
```

**Current State:**
- Icon: Info circle icon
- Message: "Complete your profile and set a weight goal to generate a personalized 7-day meal plan and shopping list."
- No call-to-action button

## 7. Progress Tab Component (`/components/ProgressTabComponent.tsx`)

### Profile Incomplete State (Lines 107-121)
```tsx
if (!isProfileComplete) {
  return (
    <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl mt-6 sm:mt-8">
      <h2 className="text-xl sm:text-2xl font-semibold text-text-default mb-4">
        <i className="fas fa-chart-line mr-2.5 text-sky-500 dark:text-sky-400"></i>Progress Tracking
      </h2>
      <div className="bg-sky-50 dark:bg-sky-900/30 border-l-4 border-sky-400 text-sky-700 dark:text-sky-300 p-4 rounded-md text-center" role="alert">
        <p className="font-medium">
          <i className="fas fa-info-circle mr-2"></i>
          Complete your profile in Settings to track your progress.
        </p>
      </div>
    </div>
  );
}
```

**Current State:**
- Icon: Info circle icon
- Message: "Complete your profile in Settings to track your progress."
- No call-to-action button

### No Target Weight State (Lines 123-137)
```tsx
if (userProfile.targetWeight === null) {
  return (
    <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl mt-6 sm:mt-8">
      <h2 className="text-xl sm:text-2xl font-semibold text-text-default mb-4">
        <i className="fas fa-chart-line mr-2.5 text-sky-500 dark:text-sky-400"></i>Progress Tracking
      </h2>
      <div className="bg-orange-50 dark:bg-orange-900/30 border-l-4 border-orange-400 text-orange-700 dark:text-orange-300 p-4 rounded-md text-center" role="alert">
        <p className="font-medium">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          Please set a target weight in Settings to enable progress tracking.
        </p>
      </div>
    </div>
  );
}
```

**Current State:**
- Icon: Exclamation triangle icon
- Message: "Please set a target weight in Settings to enable progress tracking."
- No call-to-action button

## 8. User Status Dashboard (`/components/UserStatusDashboard.tsx`)

### Null Return When Profile Incomplete (Lines 23-25)
```tsx
if (!userProfile.name || userProfile.weight === null || userProfile.targetWeight === null) {
  return null; 
}
```

**Current State:**
- Returns null (no UI rendered)
- No message or guidance for users

## 9. Advanced Analytics Component (`/components/AdvancedAnalytics.tsx`)

**Note:** No explicit empty state handling found. The component appears to render charts even with empty data, which would show empty graphs.

## Summary of Empty States

### Common Patterns:
1. Most empty states use centered text with `text-center` class
2. Padding varies from `py-4` to `py-8`
3. Some have icons (Font Awesome), others don't
4. Background colors vary (some have bg colors, some don't)
5. Very few have call-to-action buttons

### Missing Empty States (Potential Areas):
1. Search results (when searching for foods)
2. Analytics/Progress charts when no data
3. Weight log history when empty
4. Meal suggestions when API fails
5. Barcode scan history
6. Achievements/Milestones when none earned

### Improvement Opportunities:
1. **Consistent Design**: Standardize empty state appearance
2. **Icons/Illustrations**: Add meaningful visuals to all empty states
3. **Call-to-Action Buttons**: Add primary actions to guide users
4. **Better Messaging**: More encouraging and action-oriented copy
5. **Progressive Disclosure**: Show different messages for first-time vs returning users
6. **Helpful Tips**: Add contextual help or tips in empty states

### Recommended Empty State Pattern:
```tsx
<div className="text-center py-12 px-6 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-border-default">
  <div className="mb-4">
    <i className="fas fa-[icon] text-5xl text-slate-400 dark:text-slate-500"></i>
    {/* Or custom illustration component */}
  </div>
  <h3 className="text-lg font-semibold text-text-default mb-2">
    [Main Message]
  </h3>
  <p className="text-sm text-text-alt mb-6 max-w-sm mx-auto">
    [Supporting message with guidance]
  </p>
  <button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all">
    <i className="fas fa-[action-icon] mr-2"></i>
    [Call to Action]
  </button>
  {/* Optional: Additional help links or tips */}
  <div className="mt-6 text-xs text-text-alt">
    <a href="#" className="text-teal-600 hover:text-teal-700 underline">Learn more</a>
    {" · "}
    <a href="#" className="text-teal-600 hover:text-teal-700 underline">View tutorial</a>
  </div>
</div>
```

### Priority Improvements:
1. **Food Log Empty State**: Add "Quick Add" or "Scan Barcode" CTA button
2. **My Foods/Meals Empty States**: Add "Create First Food/Meal" buttons
3. **Weight Chart Empty State**: Make it HTML-based with proper CTA to set target
4. **Analytics Empty State**: Add proper empty state when no data exists
5. **Search Results**: Implement empty state for when searches return no results
6. **User Dashboard**: Show a proper empty state instead of returning null