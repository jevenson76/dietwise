import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// Validation schemas
export const HealthProfileSchema = z.object({
  age: z.number().min(1).max(120),
  sex: z.enum(['male', 'female', 'other']),
  height: z.object({
    value: z.number().positive(),
    unit: z.enum(['cm', 'ft'])
  }),
  weight: z.object({
    value: z.number().positive(),
    unit: z.enum(['kg', 'lbs'])
  }),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  targetWeight: z.object({
    value: z.number().positive(),
    unit: z.enum(['kg', 'lbs'])
  }).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  healthConditions: z.array(z.string()).optional(),
});

export const FoodLogEntrySchema = z.object({
  foodName: z.string(),
  brand: z.string().optional(),
  barcode: z.string().optional(),
  quantity: z.number().positive(),
  unit: z.string(),
  calories: z.number().min(0),
  macros: z.object({
    protein: z.number().min(0),
    carbs: z.number().min(0),
    fat: z.number().min(0),
    fiber: z.number().min(0).optional(),
    sugar: z.number().min(0).optional(),
  }),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  loggedAt: z.string().datetime().optional(),
});

export const WeightEntrySchema = z.object({
  weight: z.object({
    value: z.number().positive(),
    unit: z.enum(['kg', 'lbs'])
  }),
  loggedAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

// TypeScript types
export type HealthProfileDto = z.infer<typeof HealthProfileSchema>;
export type FoodLogEntryDto = z.infer<typeof FoodLogEntrySchema>;
export type WeightEntryDto = z.infer<typeof WeightEntrySchema>;

// MongoDB Schemas
interface IHealthProfile extends Document {
  userId: string;
  encryptedData: string;
  dataKey: string;
  lastModified: Date;
}

const healthProfileSchema = new Schema<IHealthProfile>({
  userId: { type: String, required: true, unique: true, index: true },
  encryptedData: { type: String, required: true },
  dataKey: { type: String, required: true },
  lastModified: { type: Date, default: Date.now }
});

interface IFoodLog extends Document {
  userId: string;
  date: Date;
  encryptedEntries: string;
  dataKey: string;
  totalCalories: number; // For quick queries without decryption
  lastModified: Date;
}

const foodLogSchema = new Schema<IFoodLog>({
  userId: { type: String, required: true, index: true },
  date: { type: Date, required: true, index: true },
  encryptedEntries: { type: String, required: true },
  dataKey: { type: String, required: true },
  totalCalories: { type: Number, default: 0 },
  lastModified: { type: Date, default: Date.now }
});

// Compound index for user and date
foodLogSchema.index({ userId: 1, date: -1 });

interface IWeightHistory extends Document {
  userId: string;
  encryptedEntries: string;
  dataKey: string;
  latestWeight: number; // For quick queries without decryption
  latestWeightUnit: string;
  lastModified: Date;
}

const weightHistorySchema = new Schema<IWeightHistory>({
  userId: { type: String, required: true, unique: true, index: true },
  encryptedEntries: { type: String, required: true },
  dataKey: { type: String, required: true },
  latestWeight: { type: Number },
  latestWeightUnit: { type: String },
  lastModified: { type: Date, default: Date.now }
});

// Export models
export const HealthProfile = mongoose.model<IHealthProfile>('HealthProfile', healthProfileSchema);
export const FoodLog = mongoose.model<IFoodLog>('FoodLog', foodLogSchema);
export const WeightHistory = mongoose.model<IWeightHistory>('WeightHistory', weightHistorySchema);