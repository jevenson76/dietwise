import { z } from 'zod';

export const mealIdeasSchema = z.object({
  calorieTarget: z.number().min(100).max(5000),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  dietaryRestrictions: z.array(z.string()).optional(),
  preferences: z.array(z.string()).optional()
});

export const upcScanSchema = z.object({
  upc: z.string().regex(/^\d{8,14}$/)
});

export const mealPlanSchema = z.object({
  dailyCalorieTarget: z.number().min(1000).max(5000),
  dietaryRestrictions: z.array(z.string()).optional(),
  preferences: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  startDate: z.string().optional()
});