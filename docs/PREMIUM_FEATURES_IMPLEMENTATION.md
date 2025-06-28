# Premium Features Implementation Guide

## Overview
This document details the implementation of each premium feature in DietWise, including code structure, state management, and user experience considerations.

## 1. Usage Limits System

### Architecture
The usage limits system is built on a flexible hook that tracks various user actions and enforces limits for free users.

### Implementation: `hooks/usePremiumLimits.ts`

```typescript
interface UsageData {
  dailyBarcodeScans: number;
  dailyMealSuggestions: number;
  monthlyExports: number;
  monthlyMealPlans: number;
  customFoodsCount: number;
  customMealsCount: number;
  lastResetDate: string;
}
```

### Key Features:
- **Automatic Reset Logic**: Daily and monthly counters reset automatically
- **Persistent Storage**: Usage data stored in localStorage
- **Real-time Checking**: Limits checked before allowing actions
- **Graceful Degradation**: Features disabled when limits reached

### Usage Example:
```typescript
const premiumLimits = usePremiumLimits(isPremiumUser);

// Check if user can scan
const { allowed, remaining } = premiumLimits.limits.canScanBarcode();
if (!allowed) {
  showUpgradePrompt();
  return;
}

// Increment usage after action
premiumLimits.increment.barcodeScans();
```

## 2. Advanced Analytics Dashboard

### Component: `components/AdvancedAnalytics.tsx`

### Features:
1. **Calorie/Macro Trends**
   - Line chart showing selected metric over time
   - Toggleable between calories, protein, carbs, fat
   - Time range selector (7, 30, 90 days)

2. **Macro Distribution**
   - Doughnut chart showing macro percentages
   - Color-coded for easy visualization

3. **Weekly Comparison**
   - Bar chart comparing weekly averages
   - Helps identify patterns and progress

4. **Meal Timing Analysis**
   - Radar chart showing eating patterns by hour
   - Identifies optimal meal timing

### Free User Experience:
```typescript
if (!isPremiumUser) {
  return (
    <div className="relative">
      <div className="absolute inset-0 backdrop-blur-sm">
        <UpgradePrompt />
      </div>
      <div className="opacity-20">
        {/* Blurred preview content */}
      </div>
    </div>
  );
}
```

## 3. PDF Export System

### Component: `components/PDFExportButton.tsx`
### Service: `services/pdfExportService.ts`

### Features:
- **Customizable Date Ranges**: Last 7 days, 30 days, or all time
- **Optional Sections**: Weight history, macro breakdown
- **Professional Formatting**: Company branding, page numbers
- **Responsive Design**: Works on all devices

### PDF Structure:
1. Header with user info and date range
2. Daily summary table
3. Detailed food log by date
4. Weight history chart (optional)
5. Macro breakdown summary (optional)

### Implementation:
```typescript
const pdf = new jsPDF();

// Add content with autoTable
autoTable(pdf, {
  head: [['Date', 'Calories', 'Protein', 'Carbs', 'Fat']],
  body: dailySummaryData,
  theme: 'grid',
  headStyles: { fillColor: [20, 184, 166] }
});

pdf.save(`dietwise-report-${date}.pdf`);
```

## 4. Custom Macro Targets

### Component: `components/CustomMacroTargets.tsx`

### Features:
1. **Dual Input Methods**:
   - Percentage-based sliders
   - Direct gram input fields

2. **Auto-calculation**:
   - Percentages update when grams change
   - Total calories calculated from macros

3. **Visual Feedback**:
   - Current vs. target comparison
   - Color-coded macro display

### State Management:
```typescript
// User profile extended with custom targets
interface UserProfile {
  // ... existing fields
  customMacroTargets?: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}
```

## 5. Historical Data Limits

### Service: `utils/dataLimits.ts`

### Implementation:
```typescript
export const filterByHistoricalLimit = <T>(
  data: T[],
  isPremiumUser: boolean
): T[] => {
  if (isPremiumUser) return data;
  
  const limitDate = subDays(new Date(), 30);
  return data.filter(item => {
    const itemDate = new Date(item.date || item.timestamp);
    return isAfter(itemDate, limitDate);
  });
};
```

### Applied To:
- Food logs
- Weight history
- Analytics data
- Export functions

### User Notification:
```typescript
{!isPremiumUser && (
  <Alert>
    Free users can only view data from the last 30 days.
    Upgrade to access your complete history.
  </Alert>
)}
```

## 6. Barcode Scanning Limits

### Integration Points:
1. **UPCScannerComponent**: Shows remaining scans
2. **FoodLog**: Disables scan button when limit reached
3. **Usage Tracking**: Increments on successful scan

### User Experience:
```typescript
<div className="scan-limit-indicator">
  <i className="fas fa-barcode"></i>
  {remaining} scans left today
  {remaining === 0 && <UpgradePrompt />}
</div>
```

## 7. Meal Suggestion Limits

### Component: `components/MealIdeaSuggestion.tsx`

### Implementation:
- Check limit before API call
- Show remaining suggestions
- Graceful upgrade prompt when exhausted

### State Flow:
1. User clicks "Get Suggestion"
2. Check `canGetMealSuggestion()`
3. If allowed: Make API call, increment counter
4. If not: Show upgrade modal

## 8. Strategic Upgrade Prompts

### Component: `components/UpgradePrompt.tsx`

### Variants:
1. **Inline**: Small, non-intrusive prompt
2. **Banner**: Full-width promotional message
3. **Overlay**: Modal-style for locked features

### Placement Strategy:
```typescript
// After significant usage
{foodLog.length >= 10 && !isPremiumUser && (
  <UpgradePrompt
    feature="You're doing great!"
    message="Unlock unlimited features..."
    variant="banner"
  />
)}

// At natural friction points
{!canScanBarcode && (
  <UpgradePrompt
    feature="Daily limit reached"
    message="Get unlimited scans..."
    variant="inline"
  />
)}
```

### Analytics Integration:
All prompts track:
- Display events
- Click events
- Conversion attribution
- A/B test variants

## Testing Premium Features

### Local Testing:
1. Use demo activation button
2. Modify localStorage directly:
   ```javascript
   localStorage.setItem('dietwise_subscription', 'active');
   ```
3. Toggle premium status in React DevTools

### Test Scenarios:
- [ ] Free user hitting each limit
- [ ] Upgrade flow completion
- [ ] Premium feature access
- [ ] Data filtering accuracy
- [ ] Export functionality
- [ ] Analytics calculations

## Performance Considerations

### Optimization Strategies:
1. **Lazy Loading**: Premium components loaded on demand
2. **Memoization**: Expensive calculations cached
3. **Data Filtering**: Applied at query level when possible
4. **Chart Rendering**: Throttled updates, cleanup on unmount

### Memory Management:
```typescript
useEffect(() => {
  // Initialize charts
  return () => {
    // Cleanup charts on unmount
    Object.values(chartRefs.current).forEach(chart => {
      if (chart) chart.destroy();
    });
  };
}, [dependencies]);
```

## Future Enhancements

### Planned Premium Features:
1. **AI Meal Planning**: Weekly meal prep with shopping lists
2. **Nutrition Insights**: Personalized recommendations
3. **Progress Predictions**: ML-based goal achievement estimates
4. **Recipe Import**: Scan and analyze any recipe
5. **Wearable Integration**: Sync with fitness trackers
6. **Family Sharing**: Multi-user premium accounts