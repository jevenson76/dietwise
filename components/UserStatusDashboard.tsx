
import React from 'react';
import { UserProfile, WeightEntry, ReminderSettings, StreakData } from '../types';
import { differenceInDays, addDays, format } from 'date-fns';
import parseISO from 'date-fns/parseISO';
import startOfDay from 'date-fns/startOfDay';

interface UserStatusDashboardProps {
  userProfile: UserProfile;
  actualWeightLog: WeightEntry[];
  reminderSettings: ReminderSettings;
  streakData: StreakData;
  onNavigateToMealIdeas: () => void;
}

const UserStatusDashboard: React.FC<UserStatusDashboardProps> = ({ 
  userProfile, 
  actualWeightLog, 
  reminderSettings,
  streakData,
  onNavigateToMealIdeas 
}) => {
  if (!userProfile.name || userProfile.weight === null || userProfile.targetWeight === null) {
    return null; 
  }

  const currentWeight = typeof userProfile.weight === 'number' 
    ? (actualWeightLog.length > 0 ? actualWeightLog[actualWeightLog.length - 1].weight : userProfile.weight)
    : 0; 

  const targetWeight = typeof userProfile.targetWeight === 'number' ? userProfile.targetWeight : currentWeight; 
  
  const startWeightNum = typeof userProfile.startWeight === 'number' 
    ? userProfile.startWeight 
    : (actualWeightLog.length > 0 ? actualWeightLog[0].weight : currentWeight);

  const displayStartDate = userProfile.startWeight && actualWeightLog.length > 0 && parseISO(actualWeightLog[0].date) < parseISO(userProfile.profileCreationDate || new Date().toISOString()) 
    ? actualWeightLog[0].date 
    : userProfile.profileCreationDate;


  const lbsToGo = targetWeight - currentWeight;
  const lbsChanged = currentWeight - startWeightNum;

  let progressPercentage = 0;
  if (startWeightNum && startWeightNum !== targetWeight) {
    const totalChangeNeeded = startWeightNum - targetWeight;
    const changeAchieved = startWeightNum - currentWeight;
    
    if (totalChangeNeeded !== 0) { 
        if (startWeightNum < targetWeight) { 
            progressPercentage = Math.max(0, Math.min(100, ( (currentWeight - startWeightNum) / (targetWeight - startWeightNum) ) * 100));
        } else { 
            progressPercentage = Math.max(0, Math.min(100, (changeAchieved / totalChangeNeeded) * 100));
        }
    } else if (currentWeight === targetWeight) { 
        progressPercentage = 100;
    }
    if (isNaN(progressPercentage) || !isFinite(progressPercentage)) progressPercentage = 0;
  } else if (currentWeight === targetWeight && startWeightNum === targetWeight) {
    progressPercentage = 100;
  }


  let nextWeighInStatus = "";
  const today = startOfDay(new Date());
  let lastWeighInDate: Date | null = null;
  if (actualWeightLog.length > 0) {
    try { lastWeighInDate = startOfDay(parseISO(actualWeightLog[actualWeightLog.length - 1].date)); }
    catch (e) { /* ignore invalid date */ }
  }

  if (lastWeighInDate) {
    const nextRecommendedDate = addDays(lastWeighInDate, reminderSettings.weighInFrequencyDays);
    const daysUntil = differenceInDays(nextRecommendedDate, today);
    if (daysUntil <= 0) {
      nextWeighInStatus = differenceInDays(today, lastWeighInDate) >= reminderSettings.weighInFrequencyDays ? "Overdue!" : "Today!";
    } else {
      nextWeighInStatus = `${daysUntil} day${daysUntil > 1 ? 's' : ''}`;
    }
  } else {
    nextWeighInStatus = "Log first weigh-in";
  }

  const getProgressColor = () => {
    if (progressPercentage >= 80) return "bg-green-500";
    if (progressPercentage >= 50) return "bg-yellow-500";
    if (progressPercentage > 0) return "bg-sky-500";
    return "bg-slate-400 dark:bg-slate-500"; 
  }

  const progressText = () => {
    if (lbsChanged === 0 && currentWeight === startWeightNum) {
      return "At Starting Weight";
    }
    return `${Math.abs(lbsChanged).toFixed(1)} lbs ${lbsChanged < 0 ? 'Lost' : 'Gained'} So Far`;
  };

  return (
    <div className="bg-bg-card p-5 sm:p-6 rounded-xl shadow-lg mb-6 sm:mb-8 border border-border-default">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-text-default mb-2 sm:mb-0">
          Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-500 dark:from-teal-500 dark:to-cyan-400">{userProfile.name}!</span>
        </h2>
        <button 
          onClick={onNavigateToMealIdeas}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all whitespace-nowrap mt-2 sm:mt-0"
        >
          <i className="fas fa-utensils fa-fw mr-1.5"></i>Next Meal Idea
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-center">
        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg shadow-sm">
          <p className="text-xs text-text-alt uppercase tracking-wider">Current Weight</p>
          <p className="text-2xl font-bold text-text-default">{currentWeight.toFixed(1)} <span className="text-sm font-normal">lbs</span></p>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg shadow-sm">
          <p className="text-xs text-text-alt uppercase tracking-wider">Target Weight</p>
          <p className="text-2xl font-bold text-text-default">{targetWeight.toFixed(1)} <span className="text-sm font-normal">lbs</span></p>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg shadow-sm">
          <p className="text-xs text-text-alt uppercase tracking-wider">Next Weigh-In</p>
          <p className={`text-2xl font-bold ${nextWeighInStatus === "Overdue!" || nextWeighInStatus === "Today!" ? 'text-orange-500 dark:text-orange-400' : 'text-text-default'}`}>
            {nextWeighInStatus}
          </p>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg shadow-sm">
          <p className="text-xs text-text-alt uppercase tracking-wider">Logging Streak</p>
          <p className={`text-2xl font-bold ${streakData.foodLogStreak > 0 ? 'text-teal-600 dark:text-teal-400' : 'text-text-default'}`}>
            {streakData.foodLogStreak > 0 ? <><i className="fas fa-fire mr-1 text-red-500"></i>{streakData.foodLogStreak} Day{streakData.foodLogStreak > 1 ? 's' : ''}</> : "-"}
          </p>
        </div>
      </div>

      {startWeightNum && startWeightNum !== targetWeight && (
        <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-text-alt">
                    {progressText()}
                </span>
                <span className="font-medium text-teal-600 dark:text-teal-400">
                    {lbsToGo !== 0 ? `${Math.abs(lbsToGo).toFixed(1)} lbs To Go` : "Goal Reached!"}
                </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3.5 shadow-inner overflow-hidden relative">
                <div 
                    className={`${getProgressColor()} h-3.5 rounded-full transition-all duration-500 ease-out flex items-center justify-center text-xs text-white font-bold`}
                    style={{ width: `${progressPercentage.toFixed(2)}%` }}
                    role="progressbar"
                    aria-valuenow={progressPercentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Progress towards weight goal: ${progressPercentage.toFixed(0)}%`}
                >
                </div>
                 {displayStartDate && (
                    <div className="absolute left-0 top-full mt-0.5 text-xxs text-text-alt leading-none">
                        <span className="font-semibold">Starting Weight</span>
                        <br/>
                        ({format(parseISO(displayStartDate), 'MMM d, yy')})
                    </div>
                )}
            </div>
            <p className="text-xs text-text-alt text-right mt-1">{progressPercentage.toFixed(0)}% Of Goal</p>
        </div>
      )}
    </div>
  );
};

export default UserStatusDashboard;

// Add text-xxs to tailwind config if not available
// In index.html style block or a CSS file:
// .text-xxs { font-size: 0.65rem; } (adjust as needed)
// For this exercise, assuming it might be available or a minor visual detail.
// For tailwind.config, you'd add:
// theme: { extend: { fontSize: { 'xxs': '0.65rem' }}}
