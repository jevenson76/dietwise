import { useState, useEffect, useCallback } from 'react';
import { UserProfile, CalculatedMetrics, MilestoneType } from '@appTypes';
import { defaultUserProfile } from '@constants';
import { calculateAllMetrics } from '@services/calculationService';
import { trackEvent } from '@services/analyticsService';

interface UseUserProfileProps {
  onProfileChange?: (profile: UserProfile) => void;
  addMilestone?: (type: MilestoneType, description: string, value?: number | string) => void;
}

export const useUserProfile = ({ onProfileChange, addMilestone }: UseUserProfileProps = {}) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const savedProfile = localStorage.getItem('userProfile');
    try {
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile) as UserProfile;
        if (typeof parsed === 'object' && parsed !== null && ('age' in parsed || 'name' in parsed || 'height' in parsed)) {
          if (typeof parsed.height === 'number' || parsed.height === null) {
            parsed.height = null;
          } else if (parsed.height && (typeof parsed.height.ft !== 'number' || typeof parsed.height.in !== 'number')) {
            parsed.height = null;
          }
          return { ...defaultUserProfile, ...parsed };
        }
      }
    } catch (e) { }
    return defaultUserProfile;
  });

  const [calculatedMetrics, setCalculatedMetrics] = useState<CalculatedMetrics>({
    bmi: null, bmr: null, tdee: null, targetCalories: null,
  });

  const [isInitialSetup, setIsInitialSetup] = useState<boolean>(!userProfile.profileCreationDate);

  // Update calculated metrics when profile changes
  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    const metrics = calculateAllMetrics(userProfile);
    setCalculatedMetrics(metrics);
    
    if (userProfile.profileCreationDate && isInitialSetup) {
      setIsInitialSetup(false);
      if (addMilestone) {
        addMilestone(MilestoneType.PROFILE_COMPLETE, "Profile Setup Complete!");
      }
    }
  }, [userProfile, isInitialSetup, addMilestone]);

  const handleProfileChange = useCallback((updatedProfile: UserProfile) => {
    const isNewUser = !userProfile.profileCreationDate;
    if (isNewUser && updatedProfile.age && updatedProfile.sex && updatedProfile.height && updatedProfile.weight) {
      updatedProfile.profileCreationDate = new Date().toISOString();
      trackEvent('profile_created', {
        activityLevel: updatedProfile.activityLevel,
        sex: updatedProfile.sex,
        hasTargetWeight: !!updatedProfile.targetWeight,
        hasTargetDate: !!updatedProfile.targetDate,
      });
    }
    setUserProfile(updatedProfile);
    onProfileChange?.(updatedProfile);
  }, [userProfile, onProfileChange]);

  const handleTargetWeightChange = useCallback((targetWeight: number | null, targetWeightLbs: number | null, targetDate?: string | null) => {
    trackEvent('target_weight_set', {
      hasTarget: targetWeight !== null,
      hasDate: !!targetDate,
    });
    handleProfileChange({
      ...userProfile,
      targetWeight,
      targetDate: targetDate ?? userProfile.targetDate,
    });
  }, [userProfile, handleProfileChange]);

  const handleTargetDateChange = useCallback((targetDate: string | null) => {
    handleProfileChange({ ...userProfile, targetDate });
  }, [userProfile, handleProfileChange]);

  const handleUpdateMacroTargets = useCallback((newTargets: Partial<UserProfile>) => {
    trackEvent('macro_targets_updated', {
      customProtein: newTargets.customMacroTargets?.protein !== undefined,
      customCarbs: newTargets.customMacroTargets?.carbs !== undefined,
      customFat: newTargets.customMacroTargets?.fat !== undefined,
    });
    handleProfileChange({ ...userProfile, ...newTargets });
  }, [userProfile, handleProfileChange]);

  return {
    userProfile,
    calculatedMetrics,
    isInitialSetup,
    handleProfileChange,
    handleTargetWeightChange,
    handleTargetDateChange,
    handleUpdateMacroTargets,
  };
};