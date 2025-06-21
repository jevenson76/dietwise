import { UserProfile, Sex, ActivityLevel, CalculatedMetrics } from '../types';
import { activityLevelMultipliers } from '../constants';

const LB_TO_KG = 0.453592;
const INCH_TO_CM = 2.54;
const INCH_TO_M = 0.0254;

const getTotalInches = (height: { ft: number | null, in: number | null } | null): number | null => {
  if (!height) return null;
  const ft = height.ft === null || isNaN(Number(height.ft)) ? 0 : Number(height.ft);
  const inches = height.in === null || isNaN(Number(height.in)) ? 0 : Number(height.in);
  if (ft === 0 && inches === 0) return null; // If both are effectively zero, treat as not set
  return (ft * 12) + inches;
};

export const calculateBMI = (heightObj: { ft: number | null, in: number | null } | null, weightLbs: number | null): number | null => {
  const heightInches = getTotalInches(heightObj);
  if (!heightInches || !weightLbs || heightInches <= 0 || weightLbs <= 0) return null;
  const heightM = heightInches * INCH_TO_M;
  const weightKg = weightLbs * LB_TO_KG;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
};

export const calculateBMR = (
  age: number | null,
  sex: Sex | null,
  heightObj: { ft: number | null, in: number | null } | null,
  weightLbs: number | null
): number | null => {
  const heightInches = getTotalInches(heightObj);
  if (!age || !sex || !heightInches || !weightLbs || age <= 0 || heightInches <= 0 || weightLbs <= 0) return null;

  const heightCm = heightInches * INCH_TO_CM;
  const weightKg = weightLbs * LB_TO_KG;

  if (sex === Sex.MALE) {
    // Mifflin-St Jeor Equation (more accurate than Harris-Benedict)
    return Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5);
  } else {
    return Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161);
  }
};

export const calculateTDEE = (bmr: number | null, activityLevel: ActivityLevel | null): number | null => {
  if (!bmr || !activityLevel) return null;
  return Math.round(bmr * activityLevelMultipliers[activityLevel]);
};

export const calculateTargetCalories = (
  tdee: number | null,
  currentWeightLbs: number | null,
  targetWeightLbs: number | null
): number | null => {
  if (!tdee || currentWeightLbs === null || targetWeightLbs === null) return null;

  const currentWeightKg = currentWeightLbs * LB_TO_KG;
  const targetWeightKg = targetWeightLbs * LB_TO_KG;
  
  const weightDifferenceKg = targetWeightKg - currentWeightKg;
  let calorieAdjustment = 0;

  // Aim for ~1 lb/week loss (0.45 kg) = ~500 kcal deficit
  // Aim for ~0.5 lb/week gain (0.225 kg) = ~250-300 kcal surplus
  if (weightDifferenceKg < -0.2) { // Aim to lose weight (more than ~0.44 lbs)
    calorieAdjustment = -500; 
  } else if (weightDifferenceKg > 0.1) { // Aim to gain weight (more than ~0.22 lbs)
    calorieAdjustment = 300; 
  }
  // If difference is small or zero, aim for maintenance (TDEE)

  return Math.round(tdee + calorieAdjustment);
};


export const calculateDefaultMacroTargets = (targetCalories: number | null) => {
  if (!targetCalories || targetCalories <= 0) {
    return {
      protein: 50,
      carbs: 130,
      fat: 35,
      fiber: 25
    };
  }

  // Default macro split: 30% protein, 40% carbs, 30% fat
  const proteinCalories = targetCalories * 0.30;
  const carbsCalories = targetCalories * 0.40;
  const fatCalories = targetCalories * 0.30;

  // Convert calories to grams (protein: 4 cal/g, carbs: 4 cal/g, fat: 9 cal/g)
  const protein = Math.round(proteinCalories / 4);
  const carbs = Math.round(carbsCalories / 4);
  const fat = Math.round(fatCalories / 9);
  
  // Fiber recommendation: 14g per 1000 calories
  const fiber = Math.round((targetCalories / 1000) * 14);

  return { protein, carbs, fat, fiber };
};

export const calculateAllMetrics = (profile: UserProfile): CalculatedMetrics => {
  const bmi = calculateBMI(profile.height, profile.weight);
  const bmr = calculateBMR(profile.age, profile.sex, profile.height, profile.weight);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  // Pass weights in lbs to calculateTargetCalories, it will convert internally
  const targetCalories = calculateTargetCalories(tdee, profile.weight, profile.targetWeight);

  return { bmi, bmr, tdee, targetCalories };
};