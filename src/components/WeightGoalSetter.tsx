import React from 'react';
import { UserProfile } from '../types';

interface WeightGoalSetterProps {
  profile: UserProfile;
  onTargetWeightChange: (weight: number | null) => void;
  onTargetDateChange: (date: string | null) => void;
}

const WeightGoalSetter: React.FC<WeightGoalSetterProps> = ({
  profile,
  onTargetWeightChange,
  onTargetDateChange
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-4">
      <h3 className="text-xl font-bold mb-4">Weight Goals</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="targetWeight" className="block text-sm font-medium mb-1">
            Target Weight (lbs)
          </label>
          <input
            id="targetWeight"
            type="number"
            value={profile.targetWeight || ''}
            onChange={(e) => onTargetWeightChange(parseFloat(e.target.value) || null)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter target weight"
          />
        </div>
        
        <div>
          <label htmlFor="targetDate" className="block text-sm font-medium mb-1">
            Target Date
          </label>
          <input
            id="targetDate"
            type="date"
            value={profile.targetDate || ''}
            onChange={(e) => onTargetDateChange(e.target.value || null)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>
      
      {profile.weight && profile.targetWeight && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <p className="text-sm">
            Goal: {profile.weight > profile.targetWeight ? 'Lose' : 'Gain'}{' '}
            {Math.abs(profile.weight - profile.targetWeight).toFixed(1)} lbs
          </p>
        </div>
      )}
    </div>
  );
};

export default WeightGoalSetter;