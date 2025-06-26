import { 
  calculateBMI, 
  calculateBMR, 
  calculateTDEE, 
  calculateMacroTargets,
  calculateCalorieDeficit,
  calculateWaterIntake,
  validateNutritionData
} from '../../../services/calculationService';
import { UserProfile } from '../../../types';

const mockUserProfile: UserProfile = {
  name: 'John Doe',
  age: 30,
  gender: 'male',
  height: { ft: 5, in: 10 },
  weight: 180,
  activityLevel: 'moderately_active',
  dietGoal: 'maintain',
  targetWeight: 180,
  profileCreationDate: '2024-01-01',
  customMacroTargets: null
};

describe('Nutrition Calculation Service', () => {
  describe('BMI Calculations', () => {
    test('calculates BMI correctly for imperial units', () => {
      const bmi = calculateBMI(mockUserProfile);
      
      // Formula: (weight in pounds / (height in inches)²) × 703
      // Height: 5'10" = 70 inches
      // BMI = (180 / 70²) × 703 = 25.8
      expect(bmi).toBeCloseTo(25.8, 1);
    });

    test('handles edge cases for BMI calculation', () => {
      const extremeProfile = {
        ...mockUserProfile,
        height: { ft: 7, in: 0 },
        weight: 250
      };

      const bmi = calculateBMI(extremeProfile);
      expect(bmi).toBeGreaterThan(0);
      expect(bmi).toBeLessThan(50); // Reasonable upper bound
    });

    test('returns null for invalid height data', () => {
      const invalidProfile = {
        ...mockUserProfile,
        height: null
      };

      const bmi = calculateBMI(invalidProfile);
      expect(bmi).toBeNull();
    });
  });

  describe('BMR Calculations', () => {
    test('calculates BMR correctly for males using Mifflin-St Jeor equation', () => {
      const bmr = calculateBMR(mockUserProfile);
      
      // Formula for men: BMR = 88.362 + (13.397 × weight in kg) + (4.799 × height in cm) - (5.677 × age)
      // Weight: 180 lbs = 81.6 kg
      // Height: 70 inches = 177.8 cm
      // BMR = 88.362 + (13.397 × 81.6) + (4.799 × 177.8) - (5.677 × 30)
      expect(bmr).toBeCloseTo(1847, 10);
    });

    test('calculates BMR correctly for females', () => {
      const femaleProfile = {
        ...mockUserProfile,
        gender: 'female' as const,
        weight: 140,
        age: 25
      };

      const bmr = calculateBMR(femaleProfile);
      
      // Formula for women: BMR = 447.593 + (9.247 × weight in kg) + (3.098 × height in cm) - (4.330 × age)
      expect(bmr).toBeGreaterThan(1200);
      expect(bmr).toBeLessThan(2000);
    });

    test('returns null for incomplete profile data', () => {
      const incompleteProfile = {
        ...mockUserProfile,
        weight: null
      };

      const bmr = calculateBMR(incompleteProfile);
      expect(bmr).toBeNull();
    });
  });

  describe('TDEE Calculations', () => {
    test('calculates TDEE with correct activity multipliers', () => {
      const bmr = 1847;
      
      const testCases = [
        { activityLevel: 'sedentary', multiplier: 1.2 },
        { activityLevel: 'lightly_active', multiplier: 1.375 },
        { activityLevel: 'moderately_active', multiplier: 1.55 },
        { activityLevel: 'very_active', multiplier: 1.725 },
        { activityLevel: 'extremely_active', multiplier: 1.9 }
      ];

      testCases.forEach(({ activityLevel, multiplier }) => {
        const profile = { ...mockUserProfile, activityLevel: activityLevel as any };
        const tdee = calculateTDEE(bmr, profile.activityLevel);
        
        expect(tdee).toBeCloseTo(bmr * multiplier, 1);
      });
    });

    test('returns null for invalid BMR', () => {
      const tdee = calculateTDEE(null, 'moderately_active');
      expect(tdee).toBeNull();
    });
  });

  describe('Macro Target Calculations', () => {
    test('calculates standard macro targets correctly', () => {
      const targetCalories = 2600;
      const macros = calculateMacroTargets(targetCalories, mockUserProfile);
      
      // Standard ratios: 20% protein, 50% carbs, 30% fat
      expect(macros.protein).toBeCloseTo(130, 5); // (2600 * 0.20) / 4
      expect(macros.carbs).toBeCloseTo(325, 5);   // (2600 * 0.50) / 4
      expect(macros.fat).toBeCloseTo(87, 5);      // (2600 * 0.30) / 9
    });

    test('uses custom macro targets when provided', () => {
      const customProfile = {
        ...mockUserProfile,
        customMacroTargets: {
          protein: 150,
          carbs: 200,
          fat: 80
        }
      };

      const targetCalories = 2600;
      const macros = calculateMacroTargets(targetCalories, customProfile);
      
      expect(macros.protein).toBe(150);
      expect(macros.carbs).toBe(200);
      expect(macros.fat).toBe(80);
    });

    test('adjusts macros for different diet goals', () => {
      const loseWeightProfile = {
        ...mockUserProfile,
        dietGoal: 'lose_weight' as const
      };

      const targetCalories = 2100; // Deficit calories
      const macros = calculateMacroTargets(targetCalories, loseWeightProfile);
      
      // Should have higher protein ratio for weight loss
      expect(macros.protein).toBeGreaterThan(100);
    });
  });

  describe('Calorie Deficit/Surplus Calculations', () => {
    test('calculates weight loss deficit correctly', () => {
      const loseWeightProfile = {
        ...mockUserProfile,
        dietGoal: 'lose_weight' as const,
        targetWeight: 160
      };

      const tdee = 2600;
      const targetCalories = calculateCalorieDeficit(tdee, loseWeightProfile);
      
      // Should create 500 calorie deficit for 1 lb/week loss
      expect(targetCalories).toBe(2100);
    });

    test('calculates weight gain surplus correctly', () => {
      const gainWeightProfile = {
        ...mockUserProfile,
        dietGoal: 'gain_weight' as const,
        targetWeight: 200
      };

      const tdee = 2600;
      const targetCalories = calculateCalorieDeficit(tdee, gainWeightProfile);
      
      // Should create 500 calorie surplus for 1 lb/week gain
      expect(targetCalories).toBe(3100);
    });

    test('maintains calories for maintenance goal', () => {
      const tdee = 2600;
      const targetCalories = calculateCalorieDeficit(tdee, mockUserProfile);
      
      expect(targetCalories).toBe(tdee);
    });
  });

  describe('Water Intake Calculations', () => {
    test('calculates water intake based on weight and activity', () => {
      const waterIntake = calculateWaterIntake(mockUserProfile);
      
      // Base formula: weight in lbs / 2 = ounces
      // Plus activity adjustment
      const baseWater = 180 / 2; // 90 ounces
      expect(waterIntake).toBeGreaterThan(baseWater);
    });

    test('adjusts water intake for different activity levels', () => {
      const sedentaryProfile = { ...mockUserProfile, activityLevel: 'sedentary' as const };
      const activeProfile = { ...mockUserProfile, activityLevel: 'very_active' as const };
      
      const sedentaryWater = calculateWaterIntake(sedentaryProfile);
      const activeWater = calculateWaterIntake(activeProfile);
      
      expect(activeWater).toBeGreaterThan(sedentaryWater);
    });
  });

  describe('Nutrition Data Validation', () => {
    test('validates complete nutrition data', () => {
      const foodItem = {
        name: 'Apple',
        calories: 95,
        protein: 0.5,
        carbs: 25,
        fat: 0.3,
        fiber: 4.4,
        sugar: 19
      };

      const isValid = validateNutritionData(foodItem);
      expect(isValid).toBe(true);
    });

    test('rejects invalid nutrition data', () => {
      const invalidFoodItem = {
        name: 'Invalid Food',
        calories: -50, // Negative calories
        protein: 0.5,
        carbs: 25,
        fat: 0.3
      };

      const isValid = validateNutritionData(invalidFoodItem);
      expect(isValid).toBe(false);
    });

    test('validates macro consistency with calories', () => {
      const inconsistentFood = {
        name: 'Inconsistent Food',
        calories: 100,
        protein: 50, // 200 calories from protein alone
        carbs: 25,   // 100 calories from carbs
        fat: 10      // 90 calories from fat
        // Total: 390 calories vs declared 100
      };

      const isValid = validateNutritionData(inconsistentFood);
      expect(isValid).toBe(false);
    });

    test('allows reasonable margin of error in macro calculations', () => {
      const reasonableFood = {
        name: 'Reasonable Food',
        calories: 100,
        protein: 6,  // 24 calories
        carbs: 15,   // 60 calories  
        fat: 1.5     // 13.5 calories
        // Total: 97.5 calories (within 5% margin of 100)
      };

      const isValid = validateNutritionData(reasonableFood);
      expect(isValid).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles zero values gracefully', () => {
      const zeroProfile = {
        ...mockUserProfile,
        weight: 0
      };

      const bmi = calculateBMI(zeroProfile);
      expect(bmi).toBeNull();
    });

    test('handles extremely high values', () => {
      const extremeProfile = {
        ...mockUserProfile,
        weight: 1000,
        age: 150
      };

      const bmr = calculateBMR(extremeProfile);
      expect(bmr).toBeNull(); // Should reject unrealistic values
    });

    test('validates age ranges', () => {
      const youngProfile = { ...mockUserProfile, age: 10 };
      const oldProfile = { ...mockUserProfile, age: 120 };

      expect(calculateBMR(youngProfile)).toBeNull();
      expect(calculateBMR(oldProfile)).toBeNull();
    });

    test('handles missing required fields', () => {
      const incompleteProfile = {
        ...mockUserProfile,
        height: null,
        weight: null,
        age: null
      };

      expect(calculateBMI(incompleteProfile)).toBeNull();
      expect(calculateBMR(incompleteProfile)).toBeNull();
    });
  });

  describe('Performance and Optimization', () => {
    test('calculations complete within reasonable time', () => {
      const startTime = performance.now();
      
      calculateBMI(mockUserProfile);
      calculateBMR(mockUserProfile);
      calculateTDEE(1847, mockUserProfile.activityLevel);
      calculateMacroTargets(2600, mockUserProfile);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(10); // Should complete in under 10ms
    });

    test('handles batch calculations efficiently', () => {
      const profiles = Array(100).fill(mockUserProfile);
      
      const startTime = performance.now();
      
      profiles.forEach(profile => {
        calculateBMI(profile);
        calculateBMR(profile);
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // Should handle 100 calculations in under 100ms
    });
  });
});