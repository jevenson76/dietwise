# Secure API Migration Guide

## 🔒 Security Fix: Moving Gemini API to Backend

The Gemini API key was previously exposed in the frontend code, allowing anyone to steal and use it. This has been fixed by moving all AI API calls to the secure backend.

## 🔄 Migration Steps

### 1. Backend Setup

1. **Add API Key to Backend Environment**:
   ```bash
   # In backend/.env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

2. **Install Backend Dependencies** (if needed):
   ```bash
   cd backend
   npm install
   ```

3. **Start Backend Server**:
   ```bash
   npm run dev
   ```

### 2. Frontend Migration

To complete the migration, update the frontend imports:

```typescript
// OLD (insecure):
import { getMealIdeas, getFoodInfoFromUPC } from './services/geminiService';

// NEW (secure):
import { getMealIdeas, getFoodInfoFromUPC } from './services/geminiService.secure';
```

### 3. Update Components

The following components need to be updated to use the secure service:

1. **UPCScannerComponent.tsx**
   ```typescript
   // Change import from:
   import { getFoodInfoFromUPC } from '@services/geminiService';
   // To:
   import { getFoodInfoFromUPC } from '@services/geminiService.secure';
   ```

2. **MealIdeaSuggestion.tsx**
   ```typescript
   // Change import from:
   import { getMealIdeas } from '@services/geminiService';
   // To:
   import { getMealIdeas } from '@services/geminiService.secure';
   ```

3. **MealPlannerComponent.tsx**
   ```typescript
   // Change import from:
   import { getSevenDayDietPlan } from '@services/geminiService';
   // To:
   import { getSevenDayDietPlan } from '@services/geminiService.secure';
   ```

## 🆕 New Features

### Rate Limiting
The backend now enforces rate limits to prevent abuse:

**Free Users:**
- Meal Ideas: 10/day
- UPC Scans: 5/day
- Meal Plans: 1/week

**Premium Users:**
- Meal Ideas: 100/day
- UPC Scans: 50/day
- Meal Plans: 7/week

### Usage Tracking
New endpoint to check AI usage:
```typescript
import { SecureGeminiService } from '@services/geminiService.secure';

const stats = await SecureGeminiService.getUsageStats();
// Returns: { usage: {...}, isPremium: boolean }
```

## 🔐 Security Benefits

1. **API Key Protection**: Gemini API key is now server-side only
2. **User Authentication**: All AI requests require authenticated users
3. **Rate Limiting**: Prevents abuse and controls costs
4. **Usage Tracking**: Monitor API usage per user
5. **Premium Features**: Better monetization control

## 🚀 Deployment

### Environment Variables

**Frontend** (remove these):
```bash
# DELETE THESE - NO LONGER NEEDED
GEMINI_API_KEY=xxx
VITE_GEMINI_API_KEY=xxx
```

**Backend** (add these):
```bash
# Required
GEMINI_API_KEY=your_actual_key_here

# Optional rate limit config
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Production Deployment

1. **Vercel/Netlify (Frontend)**:
   - Remove GEMINI_API_KEY from environment variables
   - Ensure VITE_API_URL points to your backend

2. **Railway/Heroku (Backend)**:
   - Add GEMINI_API_KEY to environment variables
   - Ensure CORS_ORIGIN includes your frontend domain

## ⚠️ Important Notes

1. **Regenerate Your API Key**: Since the old key was exposed, regenerate it immediately
2. **Test Thoroughly**: Ensure all AI features work through the backend
3. **Monitor Usage**: Check the usage endpoint to ensure rate limits work correctly
4. **Error Handling**: The new service provides better error messages for rate limits

## 📊 Testing the Migration

1. **Test UPC Scanning**:
   - Scan a barcode
   - Should work exactly as before
   - Check network tab - calls should go to `/api/v1/ai/upc-scan`

2. **Test Meal Ideas**:
   - Generate meal suggestions
   - Should work exactly as before
   - Check network tab - calls should go to `/api/v1/ai/meal-ideas`

3. **Test Rate Limits**:
   - As a free user, exceed the daily limit
   - Should see appropriate error message
   - Premium users should have higher limits

## 🎉 Migration Complete!

Your API key is now secure and your AI features are protected with proper authentication and rate limiting!