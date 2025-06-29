import React, { useState, useMemo } from 'react';
import { UserProfile, WeightEntry } from '../types';
import { useResponsive } from '../hooks/useResponsive';
import WeightLogFormComponent from './WeightLogFormComponent';
import WeightChartComponent from './WeightChartComponent';
import WeightGoalSetter from './WeightGoalSetter';
import DietWiseLogo from '../src/components/DietWiseLogo';

interface WeighInTabProps {
  userProfile: UserProfile;
  weightLog: WeightEntry[];
  onWeightLog: (weight: number) => void;
  onTargetWeightChange: (weight: number | null) => void;
  onTargetDateChange: (date: string | null) => void;
  targetCalories: number | null;
  isPremiumUser: boolean;
  onUpgradeClick: () => void;
}

const WeighInTab: React.FC<WeighInTabProps> = ({
  userProfile,
  weightLog,
  onWeightLog,
  onTargetWeightChange,
  onTargetDateChange,
  targetCalories,
  isPremiumUser,
  onUpgradeClick
}) => {
  const { isMobile } = useResponsive();

  // Calculate weight statistics
  const weightStats = useMemo(() => {
    if (weightLog.length === 0) {
      return {
        currentWeight: userProfile.weight,
        startWeight: userProfile.startWeight,
        weightChange: 0,
        trend: 'stable' as const
      };
    }

    const sortedLog = [...weightLog].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const currentWeight = sortedLog[sortedLog.length - 1]?.weight || userProfile.weight;
    const startWeight = userProfile.startWeight || sortedLog[0]?.weight || userProfile.weight;
    const weightChange = currentWeight && startWeight ? currentWeight - startWeight : 0;
    
    // Calculate trend from last 3 entries
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (sortedLog.length >= 3) {
      const recent = sortedLog.slice(-3);
      const firstRecent = recent[0].weight;
      const lastRecent = recent[recent.length - 1].weight;
      const difference = lastRecent - firstRecent;
      
      if (difference > 1) trend = 'up';
      else if (difference < -1) trend = 'down';
    }

    return {
      currentWeight,
      startWeight,
      weightChange,
      trend
    };
  }, [weightLog, userProfile.weight, userProfile.startWeight]);

  const getTrendIcon = () => {
    switch (weightStats.trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = () => {
    if (!userProfile.targetWeight || !weightStats.currentWeight) return 'text-gray-500';
    
    const isLosingWeight = userProfile.targetWeight < (userProfile.startWeight || userProfile.weight || 0);
    
    switch (weightStats.trend) {
      case 'up': return isLosingWeight ? 'text-red-500' : 'text-green-500';
      case 'down': return isLosingWeight ? 'text-green-500' : 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative">
      {/* DietWise Logo in upper right */}
      <div className="absolute top-0 right-0 w-12 h-12 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 z-10">
        <DietWiseLogo size="small" />
      </div>
      
      {/* Current Weight & Stats Overview */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 p-6 sm:p-8 rounded-2xl shadow-xl border border-blue-100 dark:border-slate-600">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-default">
              <i className="fas fa-weight mr-3 text-blue-500"></i>
              Weight Tracking
            </h2>
            <p className="text-text-alt text-sm mt-1">Monitor your progress and stay on track</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-alt">Daily Calories</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {targetCalories ? targetCalories.toLocaleString() : '--'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Weight */}
          <div className="bg-white dark:bg-slate-700 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-600">
            <div className="text-center">
              <i className="fas fa-weight-hanging text-3xl text-blue-500 mb-3"></i>
              <p className="text-sm text-text-alt mb-1">Current Weight</p>
              <p className="text-3xl font-bold text-text-default">
                {weightStats.currentWeight ? `${weightStats.currentWeight} lbs` : 'Not set'}
              </p>
            </div>
          </div>

          {/* Weight Change */}
          <div className="bg-white dark:bg-slate-700 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-600">
            <div className="text-center">
              <i className={`fas fa-chart-line text-3xl mb-3 ${getTrendColor()}`}></i>
              <p className="text-sm text-text-alt mb-1">Weight Change</p>
              <p className={`text-3xl font-bold ${getTrendColor()}`}>
                {weightStats.weightChange !== 0 
                  ? `${weightStats.weightChange > 0 ? '+' : ''}${weightStats.weightChange.toFixed(1)} lbs`
                  : '0 lbs'
                }
              </p>
              <p className="text-xs text-text-alt mt-1">
                {getTrendIcon()} {weightStats.trend === 'stable' ? 'Stable' : 
                  weightStats.trend === 'up' ? 'Trending up' : 'Trending down'}
              </p>
            </div>
          </div>

          {/* Goal Progress */}
          <div className="bg-white dark:bg-slate-700 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-600">
            <div className="text-center">
              <i className="fas fa-bullseye text-3xl text-green-500 mb-3"></i>
              <p className="text-sm text-text-alt mb-1">To Goal</p>
              <p className="text-3xl font-bold text-text-default">
                {userProfile.targetWeight && weightStats.currentWeight
                  ? `${Math.abs(weightStats.currentWeight - userProfile.targetWeight).toFixed(1)} lbs`
                  : 'Set goal'
                }
              </p>
              {userProfile.targetDate && (
                <p className="text-xs text-text-alt mt-1">
                  By {new Date(userProfile.targetDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Weight Entry */}
      <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl">
        <h3 className="text-xl sm:text-2xl font-semibold text-text-default mb-6 border-b border-border-default pb-4">
          <i className="fas fa-plus-circle mr-2.5 text-green-500"></i>
          Log Today's Weight
        </h3>
        <WeightLogFormComponent
          onWeightLog={onWeightLog}
          currentWeight={weightStats.currentWeight}
        />
      </div>

      {/* Weight Goal Management */}
      <WeightGoalSetter
        profile={userProfile}
        onTargetWeightChange={onTargetWeightChange}
        onTargetDateChange={onTargetDateChange}
      />

      {/* Weight Chart */}
      <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl sm:text-2xl font-semibold text-text-default">
            <i className="fas fa-chart-area mr-2.5 text-purple-500"></i>
            Weight Progress
          </h3>
          {!isPremiumUser && weightLog.length >= 10 && (
            <button
              onClick={onUpgradeClick}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all text-sm"
            >
              <i className="fas fa-crown mr-2"></i>
              Advanced Charts
            </button>
          )}
        </div>
        
        {weightLog.length > 0 ? (
          <WeightChartComponent
            weightLog={weightLog}
            targetWeight={userProfile.targetWeight}
            startWeight={userProfile.startWeight}
            targetDate={userProfile.targetDate}
            showAdvanced={isPremiumUser}
          />
        ) : (
          <div className="text-center py-12">
            <i className="fas fa-chart-line text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
            <h4 className="text-lg font-semibold text-text-default mb-2">Start Tracking Your Weight</h4>
            <p className="text-text-alt">Log your first weight entry to see your progress chart here.</p>
          </div>
        )}
      </div>

      {/* Recent Weigh-ins History */}
      <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl">
        <h3 className="text-xl sm:text-2xl font-semibold text-text-default mb-6 border-b border-border-default pb-4">
          <i className="fas fa-history mr-2.5 text-blue-500"></i>
          Recent Weigh-ins
        </h3>
        
        {weightLog.length > 0 ? (
          <div className="space-y-3">
            {[...weightLog]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 10)
              .map((entry, index) => (
                <div
                  key={`${entry.date}-${entry.weight}`}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    index === 0 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                      : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                    <div>
                      <p className="font-semibold text-text-default">
                        {entry.weight} lbs
                      </p>
                      <p className="text-sm text-text-alt">
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  {index === 0 && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Latest
                    </span>
                  )}
                </div>
              ))}
            
            {weightLog.length > 10 && (
              <div className="text-center pt-4">
                <p className="text-sm text-text-alt">
                  Showing 10 most recent entries. Total: {weightLog.length} weigh-ins
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <i className="fas fa-scale-unbalanced text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
            <p className="text-text-alt">No weigh-ins recorded yet. Start by logging your current weight above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeighInTab;