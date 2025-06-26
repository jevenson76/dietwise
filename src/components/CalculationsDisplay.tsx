import React from 'react';
import { CalculatedMetrics } from '../types';

interface CalculationsDisplayProps {
  metrics: CalculatedMetrics;
  isProfileComplete: boolean;
  showBmiCategoryMessage?: boolean;
}

const CalculationsDisplay: React.FC<CalculationsDisplayProps> = ({ 
  metrics, 
  isProfileComplete,
  showBmiCategoryMessage = true 
}) => {
  if (!isProfileComplete) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <p className="text-yellow-800 dark:text-yellow-200">
          Complete your profile to see your calculated health metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-4">
      <h3 className="text-xl font-bold mb-4">Your Health Metrics</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.bmi && (
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">BMI</p>
            <p className="text-2xl font-bold">{metrics.bmi.toFixed(1)}</p>
          </div>
        )}
        
        {metrics.bmr && (
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">BMR</p>
            <p className="text-2xl font-bold">{Math.round(metrics.bmr)}</p>
            <p className="text-xs text-gray-500">cal/day</p>
          </div>
        )}
        
        {metrics.tdee && (
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">TDEE</p>
            <p className="text-2xl font-bold">{Math.round(metrics.tdee)}</p>
            <p className="text-xs text-gray-500">cal/day</p>
          </div>
        )}
        
        {metrics.targetCalories && (
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Target</p>
            <p className="text-2xl font-bold text-teal-600">{Math.round(metrics.targetCalories)}</p>
            <p className="text-xs text-gray-500">cal/day</p>
          </div>
        )}
      </div>
      
      {showBmiCategoryMessage && metrics.bmi && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
          {getBmiCategory(metrics.bmi)}
        </p>
      )}
    </div>
  );
};

function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export default CalculationsDisplay;