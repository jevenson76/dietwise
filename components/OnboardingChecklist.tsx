import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { trackEvent } from '@services/analyticsService';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  isComplete: (profile: UserProfile, data: any) => boolean;
  action?: () => void;
  actionLabel?: string;
}

interface OnboardingChecklistProps {
  userProfile: UserProfile;
  foodLogCount: number;
  hasCustomFoods: boolean;
  onNavigate: (tab: string) => void;
  onDismiss: () => void;
}

const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  userProfile,
  foodLogCount,
  hasCustomFoods,
  onNavigate,
  onDismiss,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('onboardingChecklistDismissed') === 'true';
  });

  const checklistItems: ChecklistItem[] = [
    {
      id: 'complete-profile',
      label: 'Complete your profile',
      description: 'Add your details to get personalized recommendations',
      isComplete: (profile) => {
        return !!(
          profile.name &&
          profile.age &&
          profile.sex &&
          profile.height?.ft &&
          profile.weight &&
          profile.activityLevel
        );
      },
      action: () => onNavigate('Profile'),
      actionLabel: 'Go to Profile',
    },
    {
      id: 'set-goal',
      label: 'Set your weight goal',
      description: 'Define your target weight for personalized calorie targets',
      isComplete: (profile) => !!profile.targetWeight,
      action: () => onNavigate('Profile'),
      actionLabel: 'Set Goal',
    },
    {
      id: 'log-first-meal',
      label: 'Log your first meal',
      description: 'Start tracking your daily nutrition',
      isComplete: (_, data) => data.foodLogCount > 0,
      action: () => onNavigate('Log Food'),
      actionLabel: 'Log Food',
    },
    {
      id: 'save-custom-food',
      label: 'Save a custom food',
      description: 'Build your personal food library',
      isComplete: (_, data) => data.hasCustomFoods,
      action: () => onNavigate('Food Library'),
      actionLabel: 'Add Food',
    },
    {
      id: 'explore-meal-ideas',
      label: 'Get AI meal suggestions',
      description: 'Discover meals that fit your calorie goals',
      isComplete: () => localStorage.getItem('hasUsedMealIdeas') === 'true',
      action: () => onNavigate('Meal Ideas'),
      actionLabel: 'Explore',
    },
  ];

  const completedCount = checklistItems.filter(item => 
    item.isComplete(userProfile, { foodLogCount, hasCustomFoods })
  ).length;

  const progress = (completedCount / checklistItems.length) * 100;
  const isComplete = completedCount === checklistItems.length;

  useEffect(() => {
    if (isComplete && !isDismissed) {
      // Auto-dismiss after completion
      setTimeout(() => {
        handleDismiss();
        trackEvent('onboarding_checklist_auto_dismissed');
      }, 3000);
    }
  }, [isComplete, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('onboardingChecklistDismissed', 'true');
    onDismiss();
  };

  if (isDismissed) {
    return null;
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-30">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-teal-500 text-white rounded-full p-3 shadow-lg hover:bg-teal-600 transition-all"
        >
          <i className="fas fa-tasks"></i>
          {completedCount < checklistItems.length && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {checklistItems.length - completedCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-30 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isComplete ? '🎉 Setup Complete!' : 'Getting Started'}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <i className="fas fa-minus"></i>
            </button>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {completedCount} of {checklistItems.length} completed
        </p>
      </div>

      {/* Checklist items */}
      <div className="p-4 max-h-96 overflow-y-auto">
        <ul className="space-y-3">
          {checklistItems.map(item => {
            const isItemComplete = item.isComplete(userProfile, { foodLogCount, hasCustomFoods });
            
            return (
              <li key={item.id} className="flex items-start">
                <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 ${
                  isItemComplete
                    ? 'bg-teal-500 border-teal-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {isItemComplete && (
                    <i className="fas fa-check text-white text-xs flex items-center justify-center w-full h-full"></i>
                  )}
                </div>
                
                <div className="ml-3 flex-1">
                  <p className={`text-sm font-medium ${
                    isItemComplete
                      ? 'text-gray-500 dark:text-gray-400 line-through'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {item.description}
                  </p>
                  {!isItemComplete && item.action && (
                    <button
                      onClick={() => {
                        item.action!();
                        trackEvent('onboarding_checklist_action', { item: item.id });
                      }}
                      className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium mt-1"
                    >
                      {item.actionLabel} →
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {isComplete && (
        <div className="p-4 bg-teal-50 dark:bg-teal-900/20 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-teal-700 dark:text-teal-300">
            Great job! You're all set up. This checklist will disappear automatically.
          </p>
        </div>
      )}
    </div>
  );
};

export default OnboardingChecklist;