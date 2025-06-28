import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation';
import { getGeminiService } from '../services/gemini.service';
import { logger } from '../utils/logger';
import { mealIdeasSchema, upcScanSchema, mealPlanSchema } from '../validation/ai.validation';

const router = Router();

// Rate limiting for AI endpoints
const AI_RATE_LIMITS = {
  free: {
    mealIdeas: 10, // per day
    upcScans: 5,   // per day
    mealPlans: 1   // per week
  },
  premium: {
    mealIdeas: 100,
    upcScans: 50,
    mealPlans: 7
  }
};

// Track usage (in production, use Redis or database)
const usageTracker = new Map<string, { [key: string]: { count: number, resetAt: Date } }>();

const checkRateLimit = (userId: string, feature: keyof typeof AI_RATE_LIMITS.free, isPremium: boolean) => {
  const limits = isPremium ? AI_RATE_LIMITS.premium : AI_RATE_LIMITS.free;
  const limit = limits[feature];

  const userUsage = usageTracker.get(userId) || {};
  const featureUsage = userUsage[feature] || { count: 0, resetAt: new Date() };

  // Reset if past reset time
  if (new Date() > featureUsage.resetAt) {
    const resetAt = new Date();
    if (feature === 'mealPlans') {
      resetAt.setDate(resetAt.getDate() + 7); // Weekly reset
    } else {
      resetAt.setDate(resetAt.getDate() + 1); // Daily reset
    }
    featureUsage.count = 0;
    featureUsage.resetAt = resetAt;
  }

  if (featureUsage.count >= limit) {
    return false;
  }

  // Increment usage
  featureUsage.count++;
  userUsage[feature] = featureUsage;
  usageTracker.set(userId, userUsage);

  return true;
};

// Get meal ideas
router.post('/meal-ideas', authenticate, validateRequest(mealIdeasSchema), async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const isPremium = req.user?.subscriptionStatus === 'active';

    // Check rate limit
    if (!checkRateLimit(userId, 'mealIdeas', isPremium)) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded', 
        message: isPremium ? 'Daily limit reached' : 'Upgrade to Premium for more meal ideas'
      });
    }

    const geminiService = getGeminiService();
    const ideas = await geminiService.getMealIdeas(req.body);

    return res.json({
      success: true,
      data: ideas
    });
  } catch (error) {
    logger.error('Error in meal ideas endpoint:', error);
    return res.status(500).json({ error: 'Failed to generate meal ideas' });
  }
});

// UPC barcode scanning
router.post('/upc-scan', authenticate, validateRequest(upcScanSchema), async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const isPremium = req.user?.subscriptionStatus === 'active';

    // Check rate limit
    if (!checkRateLimit(userId, 'upcScans', isPremium)) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: isPremium ? 'Daily scan limit reached' : 'Upgrade to Premium for more barcode scans'
      });
    }

    const geminiService = getGeminiService();
    const productInfo = await geminiService.getFoodInfoFromUPC(req.body);

    if (!productInfo) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json({
      success: true,
      data: productInfo
    });
  } catch (error) {
    logger.error('Error in UPC scan endpoint:', error);
    return res.status(500).json({ error: 'Failed to look up product' });
  }
});

// 7-day meal plan
router.post('/meal-plan', authenticate, validateRequest(mealPlanSchema), async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const isPremium = req.user?.subscriptionStatus === 'active';

    // Check rate limit
    if (!checkRateLimit(userId, 'mealPlans', isPremium)) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: isPremium ? 'Weekly limit reached' : 'Upgrade to Premium for more meal plans'
      });
    }

    const geminiService = getGeminiService();
    const mealPlan = await geminiService.getSevenDayMealPlan(req.body);

    return res.json({
      success: true,
      data: mealPlan
    });
  } catch (error) {
    logger.error('Error in meal plan endpoint:', error);
    return res.status(500).json({ error: 'Failed to generate meal plan' });
  }
});

// Get usage stats
router.get('/usage', authenticate, (req: Request, res: Response) => {
  const userId = req.userId!;
  const isPremium = req.user?.subscriptionStatus === 'active';
  const userUsage = usageTracker.get(userId) || {};
  const limits = isPremium ? AI_RATE_LIMITS.premium : AI_RATE_LIMITS.free;

  const usage = {
    mealIdeas: {
      used: userUsage.mealIdeas?.count || 0,
      limit: limits.mealIdeas,
      resetAt: userUsage.mealIdeas?.resetAt || new Date()
    },
    upcScans: {
      used: userUsage.upcScans?.count || 0,
      limit: limits.upcScans,
      resetAt: userUsage.upcScans?.resetAt || new Date()
    },
    mealPlans: {
      used: userUsage.mealPlans?.count || 0,
      limit: limits.mealPlans,
      resetAt: userUsage.mealPlans?.resetAt || new Date()
    }
  };

  return res.json({ usage, isPremium });
});

export default router;