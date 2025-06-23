
import React from 'react';
import { CalculatedMetrics } from '../types';

interface CalculationsDisplayProps {
  metrics: CalculatedMetrics;
  isProfileComplete: boolean;
  showBmiCategoryMessage?: boolean; // New prop
}

const MetricCard: React.FC<{ title: string; value: string | number | null; unit?: string; info?: string; icon?: string; iconColor?: string }> = 
  ({ title, value, unit, info, icon, iconColor = "text-teal-600" }) => (
  <div className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-700/50 dark:to-slate-800/50 p-5 rounded-xl shadow-lg text-center flex flex-col justify-between h-full border border-border-default">
    <div>
      <h3 className="text-sm font-medium text-text-alt flex items-center justify-center">
        {icon && <i className={`${icon} ${iconColor} mr-2 text-lg`}></i>}
        {title}
      </h3>
      {value !== null && value !== undefined ? (
        <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-500 dark:from-teal-500 dark:to-cyan-400 mt-1.5">
          {value} <span className="text-base font-normal text-text-alt">{unit}</span>
        </p>
      ) : (
        <p className="text-3xl font-bold text-slate-400 dark:text-slate-500 mt-1.5">-</p>
      )}
    </div>
    {info && <p className="text-xs text-text-alt mt-2.5">{info}</p>}
  </div>
);

const CalculationsDisplay: React.FC<CalculationsDisplayProps> = ({ metrics, isProfileComplete, showBmiCategoryMessage = true }) => {
  const getBMICategory = (bmi: number | null): string => {
    if (!bmi) return "";
    if (bmi < 18.5) return "Underweight";
    if (bmi < 24.9) return "Normal weight";
    if (bmi < 29.9) return "Overweight";
    return "Obese";
  };

  const bmiCategory = getBMICategory(metrics.bmi);
  let bmiMessageColor = "text-text-default";
  let bmiBgColor = "bg-bg-alt"; 
  if (bmiCategory === "Normal weight") { bmiMessageColor = "text-green-700 dark:text-green-300"; bmiBgColor = "bg-green-50 dark:bg-green-900/30"; }
  else if (bmiCategory === "Underweight" || bmiCategory === "Overweight") { bmiMessageColor = "text-orange-700 dark:text-orange-300"; bmiBgColor = "bg-orange-50 dark:bg-orange-900/30"; }
  else if (bmiCategory === "Obese") { bmiMessageColor = "text-red-700 dark:text-red-300"; bmiBgColor = "bg-red-50 dark:bg-red-900/30"; }

  if (!isProfileComplete) {
    return (
      <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl mt-6 sm:mt-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-text-default mb-6 border-b border-border-default pb-4">
         <i className="fas fa-calculator mr-2.5 text-sky-600 dark:text-sky-400"></i>Your Metrics
        </h2>
        <div className="bg-sky-50 dark:bg-sky-900/30 border-l-4 border-sky-400 text-sky-700 dark:text-sky-300 p-4 rounded-md text-center" role="alert">
          <p className="font-medium">
            <i className="fas fa-info-circle mr-2"></i>
            Please complete your profile to see your calculated health metrics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl mt-6 sm:mt-8">
      <h2 className="text-xl sm:text-2xl font-semibold text-text-default mb-6 border-b border-border-default pb-4">
        <i className="fas fa-calculator mr-2.5 text-sky-600 dark:text-sky-400"></i>Your Metrics
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard title="BMI" value={metrics.bmi} unit={bmiCategory ? `(${bmiCategory})` : ''} icon="fas fa-weight-scale" iconColor="text-purple-600 dark:text-purple-400"/>
        <MetricCard title="BMR" value={metrics.bmr} unit="kcal/day" info="Basal Metabolic Rate" icon="fas fa-fire" iconColor="text-orange-500 dark:text-orange-400" />
        <MetricCard title="TDEE" value={metrics.tdee} unit="kcal/day" info="Daily Energy Use" icon="fas fa-person-running" iconColor="text-lime-600 dark:text-lime-400" />
        <MetricCard title="Target Calories" value={metrics.targetCalories} unit="kcal/day" info="Daily Calorie Goal" icon="fas fa-bullseye-arrow" iconColor="text-red-500 dark:text-red-400" />
      </div>
       {showBmiCategoryMessage && metrics.bmi && (
        <p className={`mt-6 text-sm text-center font-medium p-3.5 rounded-md ${bmiBgColor} ${bmiMessageColor}`}>
          Your BMI is {metrics.bmi}, which is considered {bmiCategory}.
        </p>
      )}
    </div>
  );
};

export default CalculationsDisplay;
