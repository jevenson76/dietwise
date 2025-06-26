import { 
  calculateBMI, 
  calculateBMR, 
  calculateTDEE, 
  calculateTargetCalories,
  calculateDefaultMacroTargets,
  calculateAllMetrics 
} from '../../services/calculationService';
import { Sex, ActivityLevel, UserProfile } from '../../types';

describe('calculationService', () => {
  describe('calculateBMI', () => {
    it('should calculate BMI correctly for valid inputs', () => {
      const height = { ft: 5, in: 10 };
      const weight = 150;
      const result = calculateBMI(height, weight);
      expect(result).toBeCloseTo(21.5, 1);
    });

    it('should return null for null height', () => {
      expect(calculateBMI(null, 150)).toBeNull();
    });

    it('should return null for null weight', () => {
      const height = { ft: 5, in: 10 };
      expect(calculateBMI(height, null)).toBeNull();
    });

    it('should return null for zero height', () => {
      const height = { ft: 0, in: 0 };
      expect(calculateBMI(height, 150)).toBeNull();
    });

    it('should return null for negative weight', () => {
      const height = { ft: 5, in: 10 };
      expect(calculateBMI(height, -150)).toBeNull();
    });

    it('should handle height with only feet', () => {
      const height = { ft: 6, in: null };
      const weight = 180;
      const result = calculateBMI(height, weight);
      expect(result).toBeCloseTo(24.4, 1);
    });

    it('should handle height with only inches', () => {
      const height = { ft: null, in: 70 };
      const weight = 150;
      const result = calculateBMI(height, weight);
      expect(result).toBeCloseTo(21.5, 1);
    });
  });

  describe('calculateBMR', () => {
    it('should calculate BMR correctly for male', () => {
      const height = { ft: 5, in: 10 };
      const result = calculateBMR(30, Sex.MALE, height, 150);
      expect(result).toBeCloseTo(1647, 0);
    });

    it('should calculate BMR correctly for female', () => {
      const height = { ft: 5, in: 6 };
      const result = calculateBMR(25, Sex.FEMALE, height, 130);
      expect(result).toBeCloseTo(1351, 0);
    });

    it('should return null for null age', () => {
      const height = { ft: 5, in: 10 };
      expect(calculateBMR(null, Sex.MALE, height, 150)).toBeNull();
    });

    it('should return null for null sex', () => {
      const height = { ft: 5, in: 10 };
      expect(calculateBMR(30, null, height, 150)).toBeNull();
    });

    it('should return null for null height', () => {
      expect(calculateBMR(30, Sex.MALE, null, 150)).toBeNull();
    });

    it('should return null for null weight', () => {
      const height = { ft: 5, in: 10 };
      expect(calculateBMR(30, Sex.MALE, height, null)).toBeNull();
    });

    it('should return null for negative age', () => {
      const height = { ft: 5, in: 10 };
      expect(calculateBMR(-5, Sex.MALE, height, 150)).toBeNull();
    });
  });

  describe('calculateTDEE', () => {
    it('should calculate TDEE correctly for sedentary activity', () => {
      const bmr = 1600;
      const result = calculateTDEE(bmr, ActivityLevel.SEDENTARY);
      expect(result).toBe(1920); // 1600 * 1.2
    });

    it('should calculate TDEE correctly for moderate activity', () => {
      const bmr = 1600;
      const result = calculateTDEE(bmr, ActivityLevel.MODERATE);
      expect(result).toBe(2480); // 1600 * 1.55
    });

    it('should return null for null BMR', () => {
      expect(calculateTDEE(null, ActivityLevel.SEDENTARY)).toBeNull();
    });

    it('should return null for null activity level', () => {
      expect(calculateTDEE(1600, null)).toBeNull();
    });
  });

  describe('calculateTargetCalories', () => {
    it('should calculate deficit for weight loss', () => {
      const tdee = 2000;
      const currentWeight = 180;
      const targetWeight = 160; // Lose 20 lbs
      const result = calculateTargetCalories(tdee, currentWeight, targetWeight);
      expect(result).toBe(1500); // 2000 - 500
    });

    it('should calculate surplus for weight gain', () => {
      const tdee = 2000;
      const currentWeight = 140;
      const targetWeight = 160; // Gain 20 lbs
      const result = calculateTargetCalories(tdee, currentWeight, targetWeight);
      expect(result).toBe(2300); // 2000 + 300
    });

    it('should return maintenance calories for small weight difference', () => {
      const tdee = 2000;
      const currentWeight = 150;
      const targetWeight = 150.2; // Small gain (0.2 lbs = 0.09 kg, under 0.1 kg threshold)
      const result = calculateTargetCalories(tdee, currentWeight, targetWeight);
      expect(result).toBe(2000); // Maintenance
    });

    it('should return null for null TDEE', () => {
      expect(calculateTargetCalories(null, 150, 160)).toBeNull();
    });

    it('should return null for null current weight', () => {
      expect(calculateTargetCalories(2000, null, 160)).toBeNull();
    });

    it('should return null for null target weight', () => {
      expect(calculateTargetCalories(2000, 150, null)).toBeNull();
    });
  });

  describe('calculateDefaultMacroTargets', () => {
    it('should calculate macro targets correctly for 2000 calories', () => {
      const result = calculateDefaultMacroTargets(2000);
      expect(result).toEqual({
        protein: 150, // 2000 * 0.30 / 4
        carbs: 200,   // 2000 * 0.40 / 4
        fat: 67,      // 2000 * 0.30 / 9
        fiber: 28     // (2000 / 1000) * 14
      });
    });

    it('should return default values for null calories', () => {
      const result = calculateDefaultMacroTargets(null);
      expect(result).toEqual({
        protein: 50,
        carbs: 130,
        fat: 35,
        fiber: 25
      });
    });

    it('should return default values for zero calories', () => {
      const result = calculateDefaultMacroTargets(0);
      expect(result).toEqual({
        protein: 50,
        carbs: 130,
        fat: 35,
        fiber: 25
      });
    });

    it('should calculate macro targets for low calorie intake', () => {
      const result = calculateDefaultMacroTargets(1200);
      expect(result).toEqual({
        protein: 90,  // 1200 * 0.30 / 4
        carbs: 120,   // 1200 * 0.40 / 4
        fat: 40,      // 1200 * 0.30 / 9
        fiber: 17     // (1200 / 1000) * 14
      });
    });
  });

  describe('calculateAllMetrics', () => {
    const mockProfile: UserProfile = {
      age: 30,
      sex: Sex.MALE,
      height: { ft: 5, in: 10 },
      weight: 150,
      targetWeight: 140,
      activityLevel: ActivityLevel.MODERATE
    };

    it('should calculate all metrics correctly', () => {
      const result = calculateAllMetrics(mockProfile);
      
      expect(result.bmi).toBeCloseTo(21.5, 1);
      expect(result.bmr).toBeCloseTo(1647, 0);
      expect(result.tdee).toBeCloseTo(2553, 0);
      expect(result.targetCalories).toBeCloseTo(2053, 0); // TDEE - 500 for weight loss
    });

    it('should handle profile with missing optional fields', () => {
      const incompleteProfile: UserProfile = {
        age: null,
        sex: null,
        height: null,
        weight: null,
        targetWeight: null,
        activityLevel: null
      };

      const result = calculateAllMetrics(incompleteProfile);
      
      expect(result.bmi).toBeNull();
      expect(result.bmr).toBeNull();
      expect(result.tdee).toBeNull();
      expect(result.targetCalories).toBeNull();
    });

    it('should handle profile for weight maintenance', () => {
      const maintenanceProfile: UserProfile = {
        ...mockProfile,
        targetWeight: 150 // Same as current weight
      };

      const result = calculateAllMetrics(maintenanceProfile);
      expect(result.targetCalories).toBe(2553); // Should equal TDEE for maintenance
    });
  });
});