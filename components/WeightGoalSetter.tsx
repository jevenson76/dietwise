import React, { useState } from 'react';
import { UserProfile } from '../types';
import { format } from 'date-fns';
import parseISO from 'date-fns/parseISO';
import { validateUserProfile } from '../utils/validation';

interface WeightGoalSetterProps {
  profile: UserProfile;
  onTargetWeightChange: (targetWeight: number | null) => void;
  onTargetDateChange: (targetDate: string | null) => void;
}

const WeightGoalSetter: React.FC<WeightGoalSetterProps> = ({ profile, onTargetWeightChange, onTargetDateChange }) => {
  const [error, setError] = useState<string>('');
  const currentWeightLbs = profile.weight; 
  const minTargetWeight = 50; 
  const maxTargetWeight = 500;

  const currentTargetWeightSetting = profile.targetWeight === null || profile.targetWeight === undefined 
                                      ? (currentWeightLbs || (minTargetWeight + maxTargetWeight)/2) 
                                      : profile.targetWeight;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTargetWeightChange(parseFloat(e.target.value));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Validate
    const validationError = validateUserProfile('targetWeight', value);
    setError(validationError?.message || '');
    
    if (value === '') {
      onTargetWeightChange(null);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        onTargetWeightChange(Math.max(minTargetWeight, Math.min(maxTargetWeight, numValue)));
      }
    }
  };
  
  const handleTargetDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTargetDateChange(e.target.value ? e.target.value : null);
  };

  const inputClass = "mt-1 block w-full px-4 py-2.5 border border-border-default rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm placeholder-slate-400 bg-bg-card text-text-default dark:placeholder-slate-500";
  const todayISO = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl mt-6 sm:mt-8">
      <h2 className="text-xl sm:text-2xl font-semibold text-text-default mb-6 border-b border-border-default pb-4">
        <i className="fas fa-bullseye mr-2.5 text-orange-500"></i>Your Weight Goal
      </h2>
      <div className="space-y-6">
        <div>
          <label htmlFor="targetWeight" className="block text-sm font-medium text-text-alt">
            Target Weight: 
            <span className="ml-2 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-500 dark:from-teal-500 dark:to-cyan-400">
              {profile.targetWeight !== null ? `${profile.targetWeight} lbs` : 'Not set'}
            </span>
          </label>
          <div className="flex items-center space-x-3 mt-3">
            <span className="text-xs text-slate-500 dark:text-slate-400">{minTargetWeight} lbs</span>
            <input
              type="range"
              id="targetWeight"
              name="targetWeight"
              min={minTargetWeight}
              max={maxTargetWeight}
              step="1"
              value={currentTargetWeightSetting}
              onChange={handleSliderChange}
              className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600 dark:accent-teal-500"
              disabled={!profile.weight}
              aria-label="Target weight slider"
            />
            <span className="text-xs text-slate-500 dark:text-slate-400">{maxTargetWeight} lbs</span>
          </div>
           <input
            type="number"
            name="targetWeightInput"
            id="targetWeightInput"
            value={profile.targetWeight === null ? '' : profile.targetWeight}
            onChange={handleInputChange}
            className={`${inputClass} mt-4 ${error ? 'border-red-500' : ''}`}
            placeholder={`Enter target weight (${minTargetWeight}-${maxTargetWeight} lbs)`}
            disabled={!profile.weight}
            min={minTargetWeight}
            max={maxTargetWeight}
            aria-label="Target weight input"
          />
          {error && (
            <p className="mt-1 text-sm text-red-500" role="alert">
              <i className="fas fa-exclamation-circle mr-1"></i>
              {error}
            </p>
          )}
        </div>
        
        <div>
            <label htmlFor="targetDate" className="block text-sm font-medium text-text-alt">
                Target Date (Optional)
            </label>
            <input
                type="date"
                id="targetDate"
                name="targetDate"
                value={profile.targetDate || ''}
                onChange={handleTargetDateChange}
                className={`${inputClass} dark:[color-scheme:dark]`}
                min={todayISO} 
                disabled={!profile.targetWeight || !profile.weight}
                aria-label="Target date for weight goal"
            />
             {profile.targetDate && profile.targetWeight && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Aiming for {profile.targetWeight} lbs by {format(parseISO(profile.targetDate), 'MMM d, yyyy')}.
                </p>
            )}
        </div>

        {profile.weight && profile.targetWeight !== null && (
          <p className="text-sm text-text-alt pt-2">
            Current: <span className="font-semibold text-text-default">{profile.weight} lbs</span>. Goal: <span className="font-semibold text-text-default">{profile.targetWeight} lbs</span>.
            Difference: <span className="font-semibold text-teal-700 dark:text-teal-500">{(profile.targetWeight - profile.weight).toFixed(1)} lbs</span>.
          </p>
        )}
        {!profile.weight && 
          <div className="bg-orange-50 dark:bg-orange-900/30 border-l-4 border-orange-400 text-orange-700 dark:text-orange-300 p-4 rounded-md" role="alert">
            <p className="font-medium"><i className="fas fa-exclamation-triangle mr-2"></i>Please enter your current weight to set a target.</p>
          </div>
        }
      </div>
    </div>
  );
};

export default WeightGoalSetter;