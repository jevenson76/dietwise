import { useState, useEffect, useCallback } from 'react';
import { WeightEntry, UserProfile, MilestoneType } from '@appTypes';
import { trackEvent } from '@services/analyticsService';
import { parseISO, format } from 'date-fns';
import { WEIGHT_MILESTONE_INCREMENT } from '@constants';
import { insertSorted } from './useSortedArray';

interface UseWeightTrackingProps {
  userProfile: UserProfile;
  addMilestone?: (type: MilestoneType, description: string, value?: number | string) => void;
  displayGlobalSuccessMessage?: (message: string) => void;
}

export const useWeightTracking = ({ 
  userProfile, 
  addMilestone,
  displayGlobalSuccessMessage 
}: UseWeightTrackingProps) => {
  const [actualWeightLog, setActualWeightLog] = useState<WeightEntry[]>(() => {
    const savedLog = localStorage.getItem('actualWeightLog');
    if (savedLog) {
      try {
        const parsedLog: WeightEntry[] = JSON.parse(savedLog);
        if (Array.isArray(parsedLog)) {
          return parsedLog.sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
        }
      } catch (e) { }
    }
    return [];
  });

  // Save weight log to localStorage
  useEffect(() => {
    localStorage.setItem('actualWeightLog', JSON.stringify(actualWeightLog));
  }, [actualWeightLog]);

  const handleAddWeightEntry = useCallback((weight: number, weightLbs: number, date?: Date) => {
    const newEntry: WeightEntry = {
      weight,
      weightLbs,
      date: (date || new Date()).toISOString(),
      id: crypto.randomUUID(),
    };

    setActualWeightLog(prevLog => {
      // Use optimized insertion sort instead of full array sort
      const updatedLog = insertSorted(prevLog, newEntry, (a, b) =>
        parseISO(a.date).getTime() - parseISO(b.date).getTime()
      );

      // Check for milestones
      if (userProfile.targetWeight && weight <= userProfile.targetWeight && addMilestone) {
        const hasReachedBefore = prevLog.some(entry => entry.weight <= userProfile.targetWeight!);
        if (!hasReachedBefore) {
          addMilestone(
            MilestoneType.TARGET_WEIGHT_REACHED,
            "Target Weight Reached! 🎯",
            `${weight} kg`
          );
          displayGlobalSuccessMessage?.("🎉 Congratulations! You've reached your target weight!");
        }
      }

      // Check for weight loss milestones (every 5 kg)
      if (userProfile.weight && addMilestone) {
        const totalLoss = userProfile.weight - weight;
        const previousMilestone = Math.floor((userProfile.weight - (prevLog[prevLog.length - 1]?.weight || userProfile.weight)) / WEIGHT_MILESTONE_INCREMENT) * WEIGHT_MILESTONE_INCREMENT;
        const currentMilestone = Math.floor(totalLoss / WEIGHT_MILESTONE_INCREMENT) * WEIGHT_MILESTONE_INCREMENT;

        if (currentMilestone > previousMilestone && currentMilestone > 0) {
          addMilestone(
            MilestoneType.WEIGHT_LOSS_MILESTONE,
            `Lost ${currentMilestone} kg!`,
            `${currentMilestone} kg`
          );
          displayGlobalSuccessMessage?.(`🎉 Amazing! You've lost ${currentMilestone} kg!`);
        }
      }

      trackEvent('weight_entry_added', {
        weight,
        date: format(date || new Date(), 'yyyy-MM-dd'),
        hasTargetWeight: !!userProfile.targetWeight,
        progressToTarget: userProfile.targetWeight
          ? ((userProfile.weight || weight) - weight) / ((userProfile.weight || weight) - userProfile.targetWeight)
          : undefined,
      });

      return updatedLog;
    });
  }, [userProfile, addMilestone, displayGlobalSuccessMessage]);

  const getLatestWeight = useCallback(() => {
    if (actualWeightLog.length === 0) return null;
    return actualWeightLog[actualWeightLog.length - 1];
  }, [actualWeightLog]);

  const getWeightProgress = useCallback(() => {
    if (!userProfile.weight || !userProfile.targetWeight) return null;
    
    const currentWeight = getLatestWeight()?.weight || userProfile.weight;
    const totalToLose = userProfile.weight - userProfile.targetWeight;
    const actualLost = userProfile.weight - currentWeight;
    
    return {
      totalToLose,
      actualLost,
      percentageComplete: (actualLost / totalToLose) * 100,
      remaining: currentWeight - userProfile.targetWeight,
    };
  }, [userProfile, getLatestWeight]);

  return {
    actualWeightLog,
    handleAddWeightEntry,
    getLatestWeight,
    getWeightProgress,
  };
};