import React, { useState, useEffect } from 'react';
import { UserProfile, WeightEntry, ReminderSettings, AppTheme } from '@appTypes';
import WeightChartComponent from '@components/WeightChartComponent';
import WeightLogFormComponent from '@components/WeightLogFormComponent';
import Alert from '@components/common/Alert';
import { trackEvent } from '@services/analyticsService'; // Import analytics
import { differenceInDays, format } from 'date-fns';
import { parseISO } from 'date-fns/parseISO';
import { startOfDay } from 'date-fns/startOfDay';
import EmptyState from '@components/common/EmptyState';

interface ProgressTabComponentProps {
  userProfile: UserProfile;
  actualWeightLog: WeightEntry[];
  onAddWeightEntry: (entry: WeightEntry) => void;
  reminderSettings: ReminderSettings;
  onUpdateReminderSettings: (settings: Partial<ReminderSettings>) => void;
  isProfileComplete: boolean;
  currentTheme: AppTheme;
}

export const ProgressTabComponent: React.FC<ProgressTabComponentProps> = ({
  userProfile,
  actualWeightLog,
  onAddWeightEntry,
  reminderSettings,
  onUpdateReminderSettings,
  isProfileComplete,
  currentTheme,
}) => {
  const [showWeighInReminder, setShowWeighInReminder] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile.targetWeight) {
      setShowWeighInReminder(false);
      setMotivationalMessage(null);
      return;
    }

    const today = startOfDay(new Date());
    let lastReminderDismissDate: Date | null = null;
    if (reminderSettings.lastWeighInReminderDismissedDate) {
        try { lastReminderDismissDate = startOfDay(parseISO(reminderSettings.lastWeighInReminderDismissedDate)); }
        catch (e) {  }
    }

    if (lastReminderDismissDate && format(lastReminderDismissDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
        setShowWeighInReminder(false);
    } else {
        let lastWeighInDate: Date | null = null;
        if (actualWeightLog.length > 0) {
            try { lastWeighInDate = startOfDay(parseISO(actualWeightLog[actualWeightLog.length - 1].date)); }
            catch (e) {  }
        }

        const shouldShowReminder = lastWeighInDate 
          ? differenceInDays(today, lastWeighInDate) >= reminderSettings.weighInFrequencyDays
          : Boolean(
              (userProfile.targetWeight && (userProfile.weight || userProfile.profileCreationDate)) &&
              (differenceInDays(today, userProfile.profileCreationDate ? parseISO(userProfile.profileCreationDate) : new Date(0)) >=1 || userProfile.weight)
            );

        if (shouldShowReminder && !showWeighInReminder) {
            trackEvent('weigh_in_reminder_shown', { frequencyDays: reminderSettings.weighInFrequencyDays, lastWeighIn: lastWeighInDate?.toISOString() });
        }
        setShowWeighInReminder(shouldShowReminder);
    }

    // Motivational Message Logic
    const name = userProfile.name ? `, ${userProfile.name}` : '';
    if (actualWeightLog.length > 1 && userProfile.targetWeight) {
      const firstLog = userProfile.startWeight || actualWeightLog[0].weight;
      const latestLog = actualWeightLog[actualWeightLog.length - 1].weight;
      const target = userProfile.targetWeight;

      if ((target < firstLog && latestLog < firstLog) || (target > firstLog && latestLog > firstLog)) { 
        if (Math.abs(latestLog - target) < Math.abs(firstLog - target)) { 
            if (Math.abs(latestLog - target) <= 5) { 
                 setMotivationalMessage(`You're so close to your goal${name}! Amazing dedication!`);
            } else {
                 setMotivationalMessage(`Great job on your progress${name}! Keep up the fantastic work.`);
            }
        } else { 
             setMotivationalMessage(`Steady progress is key${name}. Keep pushing towards your goal!`);
        }
      } else if (firstLog !== latestLog) { 
        setMotivationalMessage(`Every weigh-in is a data point${name}. Stay focused on your goal!`);
      } else { 
        setMotivationalMessage(`Consistency is important${name}. You've got this!`);
      }
    } else if (actualWeightLog.length === 1) {
      setMotivationalMessage(`First weigh-in logged${name}! This is the start of your journey.`);
    } else {
      setMotivationalMessage(`Ready to track your progress${name}? Log your first weigh-in!`);
    }

  }, [actualWeightLog, userProfile, reminderSettings.weighInFrequencyDays, reminderSettings.lastWeighInReminderDismissedDate, showWeighInReminder]);

  const handleDismissReminder = () => {
    trackEvent('weigh_in_reminder_dismissed');
    onUpdateReminderSettings({ lastWeighInReminderDismissedDate: new Date().toISOString() });
    setShowWeighInReminder(false);
  };

  const latestWeightEntry = actualWeightLog.length > 0 ? actualWeightLog[actualWeightLog.length - 1].weight : userProfile.weight;

  if (!isProfileComplete) {
     return (
        <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl mt-6 sm:mt-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-text-default mb-4">
                <i className="fas fa-chart-line mr-2.5 text-sky-500 dark:text-sky-400"></i>Progress Tracking
            </h2>
            <EmptyState
              icon="fas fa-user-check"
              iconColor="text-sky-500 dark:text-sky-400"
              title="Complete Your Profile"
              description="We need a few more details to create your personalized progress tracking."
              actionLabel="Go to Settings"
              onAction={() => window.dispatchEvent(new CustomEvent('navigate-to-settings'))}
              tips={[
                "Add your current weight and height",
                "Set your target weight goal",
                "Select your activity level for accurate calculations"
              ]}
            />
        </div>
    );
  }

  if (userProfile.targetWeight === null) {
     return (
        <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl mt-6 sm:mt-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-text-default mb-4">
                <i className="fas fa-chart-line mr-2.5 text-sky-500 dark:text-sky-400"></i>Progress Tracking
            </h2>
            <EmptyState
              icon="fas fa-bullseye"
              iconColor="text-orange-500 dark:text-orange-400"
              title="Set Your Goal"
              description="Define your target weight to start tracking your progress and see how far you've come."
              actionLabel="Set Target Weight"
              onAction={() => window.dispatchEvent(new CustomEvent('navigate-to-settings'))}
              tips={[
                "Set a realistic and healthy weight goal",
                "Track your progress with regular weigh-ins",
                "Visualize your journey with progress charts"
              ]}
            />
        </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {showWeighInReminder && (
        <Alert
          type="info"
          message={`Time for your weigh-in, ${userProfile.name || 'User'}! Logging your weight regularly helps track progress towards your goal of ${userProfile.targetWeight} lbs.`}
          onClose={handleDismissReminder}
        />
      )}
      {motivationalMessage && !showWeighInReminder && ( 
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/50 dark:to-cyan-900/50 p-4 rounded-lg shadow-md border-l-4 border-teal-500 dark:border-teal-400">
            <p className="text-sm font-medium text-teal-700 dark:text-teal-300 flex items-center">
                <i className="fas fa-trophy mr-2.5 text-yellow-500 dark:text-yellow-400"></i> {motivationalMessage}
            </p>
        </div>
      )}
      <WeightChartComponent userProfile={userProfile} actualWeightLog={actualWeightLog} currentTheme={currentTheme} />
      <WeightLogFormComponent onAddWeightEntry={onAddWeightEntry} latestWeight={latestWeightEntry} />
    </div>
  );
};