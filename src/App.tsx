
import React, { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import { UserProfile, CalculatedMetrics, FoodItem, WeightEntry, ReminderSettings, SharePayload, AppTheme, MyFoodItem, MyMeal, MealReminder, StreakData, Milestone, MilestoneType } from '@appTypes'; 
import { defaultUserProfile, DEFAULT_REMINDER_SETTINGS, DEFAULT_STREAK_DATA, WEIGHT_MILESTONE_INCREMENT, STREAK_MILESTONES_DAYS, TOTAL_LOGGED_MEALS_MILESTONES } from '@constants';
import { calculateAllMetrics, calculateDefaultMacroTargets } from '@services/calculationService';
import { trackEvent } from '@services/analyticsService'; 
// Removed unused import: API_KEY_ERROR_MESSAGE from '@services/geminiService'
import UserProfileForm from '@components/UserProfileForm';
import CalculationsDisplay from '@components/CalculationsDisplay';
import WeightGoalSetter from '@components/WeightGoalSetter';
import MealIdeaSuggestion from '@components/MealIdeaSuggestion';
import UPCScannerComponent from '@components/UPCScannerComponent';
import FoodLog from '@components/FoodLog';
import Alert from '@components/common/Alert';
import Modal from '@components/common/Modal';
// Lazy load heavy components
const MealPlannerComponent = lazy(() => import('@components/MealPlannerComponent'));
const ProgressTabComponent = lazy(() => import('@components/ProgressTabComponent').then(module => ({ default: module.ProgressTabComponent })));
const UserStatusDashboard = lazy(() => import('@components/UserStatusDashboard'));
const MyLibraryComponent = lazy(() => import('@components/MyLibraryComponent'));
const ReviewPromptModal = lazy(() => import('@components/ReviewPromptModal'));
import { ReviewManagementSystem, ReviewPromptMetrics } from './aso/reviewManagement'; 
import { differenceInCalendarDays, format, addDays, isPast, isToday, differenceInMinutes } from 'date-fns';
import { parseISO } from 'date-fns/parseISO';
import { startOfDay } from 'date-fns/startOfDay';
import { usePremiumLimits } from '@hooks/usePremiumLimits';
import { usePremiumStatus } from '@hooks/usePremiumStatus';
import { useAuth } from '@hooks/useAuth';
import { PREMIUM_FEATURES, PREMIUM_MESSAGES } from './constants/premiumFeatures';
// More lazy loaded components
const StripeCheckout = lazy(() => import('@components/StripeCheckout'));
const AdvancedAnalytics = lazy(() => import('@components/AdvancedAnalytics'));
import PDFExportButton from '@components/PDFExportButton';
import CustomMacroTargets from '@components/CustomMacroTargets';
import UpgradePrompt from '@components/UpgradePrompt';
import AuthModal from '@components/auth/AuthModal';
import { filterByHistoricalLimit, getHistoricalLimitMessage } from '@utils/dataLimits';
import DietWiseSplashScreen from '@components/SplashScreen';
import { useSplashScreen } from '@hooks/useSplashScreen';

import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

Chart.defaults.locale = 'en-US';

const generateUUID = () => crypto.randomUUID();

// Simple loading component for Suspense fallbacks
const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-8 px-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mb-3"></div>
    <p className="text-text-alt text-sm">{message}</p>
  </div>
);

enum Tab {
  Log = 'Log Food', 
  FoodLibrary = 'Food Library', // Renamed from My Library
  Meals = 'Meal Ideas',
  Planner = '7-Day Plan',
  Progress = 'Progress',
  Analytics = 'Analytics', // Premium feature
  Profile = 'Profile', // Renamed from Settings
}

interface GlobalSuccessPayload {
  message: string;
  shareData?: SharePayload;
}

const OFFLINE_FOOD_LOG_QUEUE_KEY = 'offlineFoodLogQueue';

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const savedProfile = localStorage.getItem('userProfile');
    try {
        if (savedProfile) {
            const parsed = JSON.parse(savedProfile) as UserProfile;
            if (typeof parsed === 'object' && parsed !== null && ('age' in parsed || 'name' in parsed || 'height' in parsed)) { 
                 if (typeof parsed.height === 'number' || parsed.height === null) { 
                     parsed.height = null; 
                 } else if (parsed.height && (typeof parsed.height.ft !== 'number' || typeof parsed.height.in !== 'number')){
                     parsed.height = null;
                 }
                 return { ...defaultUserProfile, ...parsed };
            }
        }
    } catch (e) {  }
    return defaultUserProfile;
  });

  const [calculatedMetrics, setCalculatedMetrics] = useState<CalculatedMetrics>({
    bmi: null, bmr: null, tdee: null, targetCalories: null,
  });

  const [foodLog, setFoodLog] = useState<FoodItem[]>(() => {
    const savedLog = localStorage.getItem('foodLog');
    if (savedLog) {
      try {
        const parsedLog: FoodItem[] = JSON.parse(savedLog);
        if (Array.isArray(parsedLog)) {
          return parsedLog;
        }
      } catch (e) {  }
    }
    return [];
  });

  const [offlineFoodQueue, setOfflineFoodQueue] = useState<FoodItem[]>(() => {
    const savedQueue = localStorage.getItem(OFFLINE_FOOD_LOG_QUEUE_KEY);
    return savedQueue ? JSON.parse(savedQueue) : [];
  });

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [actualWeightLog, setActualWeightLog] = useState<WeightEntry[]>(() => {
    const savedLog = localStorage.getItem('actualWeightLog');
    if (savedLog) {
      try {
        const parsedLog: WeightEntry[] = JSON.parse(savedLog);
        if (Array.isArray(parsedLog)) {
          return parsedLog.sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
        }
      } catch (e) {  }
    }
    return [];
  });

  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(() => {
    const savedSettings = localStorage.getItem('reminderSettings');
    if (savedSettings) {
        try { return { ...DEFAULT_REMINDER_SETTINGS, ...JSON.parse(savedSettings) }; }
        catch(e) {  }
    }
    return DEFAULT_REMINDER_SETTINGS;
  });

  const [myFoods, setMyFoods] = useState<MyFoodItem[]>(() => {
    const saved = localStorage.getItem('myFoods');
    return saved ? JSON.parse(saved) : [];
  });
  const [myMeals, setMyMeals] = useState<MyMeal[]>(() => {
    const saved = localStorage.getItem('myMeals');
    return saved ? JSON.parse(saved) : [];
  });
  const [streakData, setStreakData] = useState<StreakData>(() => {
    const saved = localStorage.getItem('streakData');
    return saved ? JSON.parse(saved) : DEFAULT_STREAK_DATA;
  });
  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    const saved = localStorage.getItem('milestones');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => {
    return (localStorage.getItem('appTheme') as AppTheme) || 'light';
  });

  const [isInitialSetup, setIsInitialSetup] = useState<boolean>(!userProfile.profileCreationDate);
  const [activeTab, setActiveTab] = useState<Tab>(isInitialSetup ? Tab.Profile : Tab.Log); // Default to Profile if initial setup
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'ok' | 'missing'>('checking');
  const [isDashboardVisible, setIsDashboardVisible] = useState<boolean>(true);
  
  // Splash screen hook
  const { showSplash, hideSplash } = useSplashScreen();

  const [globalSuccessMessage, setGlobalSuccessMessage] = useState<GlobalSuccessPayload | null>(null);
  const [hasShownSetupCompleteMessage, setHasShownSetupCompleteMessage] = useState<boolean>(() => {
    return localStorage.getItem('hasShownSetupCompleteMessage') === 'true';
  });

  // Use auth hook
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();

  // Use the premium status hook to check backend subscription
  const { isPremium: isPremiumUser, isLoading: isPremiumLoading, checkPremiumStatus, openCustomerPortal } = usePremiumStatus();

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isReviewPromptModalOpen, setIsReviewPromptModalOpen] = useState<boolean>(false);
  const [isLogFromMyMealModalOpen, setIsLogFromMyMealModalOpen] = useState<boolean>(false);
  const [isUPCScannerModalOpen, setIsUPCScannerModalOpen] = useState<boolean>(false); // For FoodLog's scanner

  // Premium limits hook
  const premiumLimits = usePremiumLimits(isPremiumUser);

  // Check if we need to refresh premium status after successful checkout
  useEffect(() => {
    const shouldRefresh = localStorage.getItem('refreshPremiumStatus');
    if (shouldRefresh === 'true') {
      localStorage.removeItem('refreshPremiumStatus');
      checkPremiumStatus();
    }
  }, [checkPremiumStatus]);

  // Apply historical data limits for free users
  const filteredFoodLog = useMemo(() => {
    return filterByHistoricalLimit(foodLog, isPremiumUser);
  }, [foodLog, isPremiumUser]);

  const filteredWeightLog = useMemo(() => {
    return filterByHistoricalLimit(actualWeightLog, isPremiumUser);
  }, [actualWeightLog, isPremiumUser]);

  const reviewManagerRef = useRef(new ReviewManagementSystem());

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(currentTheme);
    localStorage.setItem('appTheme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    const key = process.env.API_KEY; 
    const MISSING_KEY_PLACEHOLDER_FOR_CONSTRUCTOR = "MISSING_API_KEY_RUNTIME_CONSTRUCTOR_DietWise"; 
    if (key && key !== "MISSING_API_KEY" && key.length > 10 && key !== MISSING_KEY_PLACEHOLDER_FOR_CONSTRUCTOR && key !== "MISSING_API_KEY_RUNTIME") { 
      setApiKeyStatus('ok');
    } else {
      setApiKeyStatus('missing');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    const metrics = calculateAllMetrics(userProfile);
    setCalculatedMetrics(metrics);
    if (userProfile.profileCreationDate && isInitialSetup) { 
        setIsInitialSetup(false);
        if (!milestones.find(m => m.type === MilestoneType.PROFILE_COMPLETE)) {
          addMilestone(MilestoneType.PROFILE_COMPLETE, "Profile Setup Complete!");
        }
    }
  }, [userProfile, isInitialSetup, milestones]); 

  useEffect(() => { localStorage.setItem('foodLog', JSON.stringify(foodLog)); }, [foodLog]);
  useEffect(() => { localStorage.setItem(OFFLINE_FOOD_LOG_QUEUE_KEY, JSON.stringify(offlineFoodQueue));}, [offlineFoodQueue]);
  useEffect(() => { localStorage.setItem('actualWeightLog', JSON.stringify(actualWeightLog)); }, [actualWeightLog]);
  useEffect(() => { localStorage.setItem('reminderSettings', JSON.stringify(reminderSettings)); }, [reminderSettings]);
  useEffect(() => { localStorage.setItem('hasShownSetupCompleteMessage', String(hasShownSetupCompleteMessage)); }, [hasShownSetupCompleteMessage]);
  useEffect(() => { localStorage.setItem('myFoods', JSON.stringify(myFoods)); }, [myFoods]);
  useEffect(() => { localStorage.setItem('myMeals', JSON.stringify(myMeals)); }, [myMeals]);
  useEffect(() => { localStorage.setItem('streakData', JSON.stringify(streakData)); }, [streakData]);
  useEffect(() => { localStorage.setItem('milestones', JSON.stringify(milestones)); }, [milestones]);

  const displayGlobalSuccessMessage = useCallback((payload: GlobalSuccessPayload | string) => {
    if (typeof payload === 'string') {
      setGlobalSuccessMessage({ message: payload });
    } else {
      setGlobalSuccessMessage(payload);
    }
    setTimeout(() => {
      setGlobalSuccessMessage(null);
    }, 5000); 
  }, []);

  const addMilestone = useCallback((type: MilestoneType, description: string, value?: number | string) => {
    setMilestones(prev => {
        const todayStr = new Date().toISOString().split('T')[0];
        const existingTodayWithValue = prev.find(m => m.type === type && m.value === value && m.dateAchieved.startsWith(todayStr));
        const existingAnyDayNoValue = prev.find(m => m.type === type && value === undefined);

        if (existingTodayWithValue && (type === MilestoneType.LOGGED_FOOD_X_DAYS_STREAK || type === MilestoneType.WEIGHT_LOSS_X_LBS || type === MilestoneType.LOGGED_X_MEALS )) {
            return prev; 
        }
        if(existingAnyDayNoValue && (type === MilestoneType.PROFILE_COMPLETE || type === MilestoneType.FIRST_WEEK_COMPLETED || type === MilestoneType.REACHED_TARGET_WEIGHT)) {
            return prev;
        }

        const newMilestone: Milestone = {
          id: `${type}_${value !== undefined ? String(value) + '_' : ''}${new Date().toISOString()}`,
          type,
          description,
          dateAchieved: new Date().toISOString(),
          value,
        };
        displayGlobalSuccessMessage(`🌟 Milestone Unlocked: ${description} 🌟`);
        trackEvent('milestone_achieved', { type, description, value });
        return [...prev, newMilestone].sort((a,b) => parseISO(b.dateAchieved).getTime() - parseISO(a.dateAchieved).getTime());
    });
  }, [displayGlobalSuccessMessage]);

  // Memoize today's food log to avoid recalculating on every render
  const todaysLog = useMemo(() => {
    return filteredFoodLog.filter(item => differenceInCalendarDays(new Date(), new Date(item.timestamp)) === 0);
  }, [filteredFoodLog]);

  // Memoize today's unfiltered food log for streak calculations
  const todaysUnfilteredLog = useMemo(() => {
    const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');
    return foodLog.filter(item => format(startOfDay(new Date(item.timestamp)), 'yyyy-MM-dd') === todayStr);
  }, [foodLog]);

  useEffect(() => {
    const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');

    if (todaysUnfilteredLog.length > 0 && streakData.lastFoodLogDate !== todayStr) {
      let newStreak = 1;
      if (streakData.lastFoodLogDate) {
        const lastLogDate = startOfDay(parseISO(streakData.lastFoodLogDate));
        const yesterday = startOfDay(addDays(new Date(), -1));
        if (format(lastLogDate, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
          newStreak = streakData.foodLogStreak + 1;
        }
      }
      setStreakData({ foodLogStreak: newStreak, lastFoodLogDate: todayStr });
      if (STREAK_MILESTONES_DAYS.includes(newStreak)) { 
        addMilestone(MilestoneType.LOGGED_FOOD_X_DAYS_STREAK, `${newStreak}-Day Food Logging Streak!`, newStreak);
      }
    }

    if (userProfile.profileCreationDate && !milestones.some(m => m.type === MilestoneType.FIRST_WEEK_COMPLETED)) {
        const creationDate = parseISO(userProfile.profileCreationDate);
        if (differenceInCalendarDays(new Date(), creationDate) >= 7) {
            addMilestone(MilestoneType.FIRST_WEEK_COMPLETED, "First Week with DietWise!");
        }
    }
    const totalMealsLogged = foodLog.length;
    TOTAL_LOGGED_MEALS_MILESTONES.forEach(numMeals => {
        if (totalMealsLogged >= numMeals && !milestones.some(m => m.type === MilestoneType.LOGGED_X_MEALS && m.value === numMeals)) {
            addMilestone(MilestoneType.LOGGED_X_MEALS, `Logged ${numMeals} Meals!`, numMeals);
        }
    });

  }, [foodLog, streakData, userProfile.profileCreationDate, addMilestone, milestones]);

  const processFoodItemAddition = useCallback((foodItem: FoodItem, source: 'manual' | 'scan' | 'my_meal', isOfflineSync: boolean = false) => {
    setFoodLog(prevLog => [...prevLog, foodItem].sort((a,b) => b.timestamp - a.timestamp));
    if (!isOfflineSync) { 
      const shareText = `I just logged ${foodItem.name} (${foodItem.calories} kcal) with DietWise! Keeping track of my nutrition. #DietWise #HealthyEating`;
      displayGlobalSuccessMessage({
          message: `${foodItem.name} logged successfully!`,
          shareData: { title: "My DietWise Log!", text: shareText, url: window.location.href }
      });
    }
    trackEvent('food_added', { name: foodItem.name, calories: foodItem.calories, source, isOfflineSync });
  }, [displayGlobalSuccessMessage]);

  const handleAddFood = useCallback((foodItem: FoodItem, source: 'manual' | 'scan' | 'my_meal') => {
    if (isOnline) {
      processFoodItemAddition(foodItem, source);
    } else {
      setOfflineFoodQueue(prevQueue => [...prevQueue, {...foodItem, id: generateUUID()}]); 
      displayGlobalSuccessMessage(`${foodItem.name} added to offline queue. Will sync when online.`);
      trackEvent('food_added_offline', { name: foodItem.name, calories: foodItem.calories, source });
    }
     if (source === 'scan' && isUPCScannerModalOpen) {
      setIsUPCScannerModalOpen(false); // Close scanner modal after logging
    }
  }, [isOnline, processFoodItemAddition, displayGlobalSuccessMessage, isUPCScannerModalOpen]);

  const syncOfflineFoodLog = useCallback(async () => {
    if (!isOnline || offlineFoodQueue.length === 0) return;

    trackEvent('offline_sync_started', { queueSize: offlineFoodQueue.length });
    const itemsToSync = [...offlineFoodQueue];
    setOfflineFoodQueue([]); 

    let successCount = 0;
    try {
      for (const item of itemsToSync) {
        processFoodItemAddition(item, 'manual', true); 
        successCount++;
        await new Promise(resolve => setTimeout(resolve, 50)); 
      }
      displayGlobalSuccessMessage(`${successCount} item(s) synced successfully from offline queue!`);
      trackEvent('offline_sync_success', { syncedCount: successCount });
    } catch (error) {
      console.error("Error syncing offline food log:", error);
      setOfflineFoodQueue(prevQueue => [...itemsToSync.slice(successCount), ...prevQueue]); 
      displayGlobalSuccessMessage({message: `Error syncing offline items. ${itemsToSync.length - successCount} items remain queued.`});
      trackEvent('offline_sync_failed', { error: (error as Error).message, remainingInQueue: itemsToSync.length - successCount });
    }
  }, [isOnline, offlineFoodQueue, processFoodItemAddition, displayGlobalSuccessMessage]);

  useEffect(() => {
    if (isOnline && offlineFoodQueue.length > 0) {
      syncOfflineFoodLog();
    }
  }, [isOnline, offlineFoodQueue.length, syncOfflineFoodLog]); 

  const handleProfileChange = useCallback((newProfileData: UserProfile) => { 
    setUserProfile(prev => {
        const updatedProfile = {...newProfileData}; 
        if (!prev.profileCreationDate && 
            (updatedProfile.name || updatedProfile.age || updatedProfile.weight || (updatedProfile.height && (updatedProfile.height.ft || updatedProfile.height.in)) || updatedProfile.sex || updatedProfile.activityLevel)) {
            updatedProfile.profileCreationDate = new Date().toISOString();
            if (updatedProfile.weight && !updatedProfile.startWeight) {
                updatedProfile.startWeight = updatedProfile.weight;
            }
        } else if (updatedProfile.weight && !updatedProfile.startWeight && prev.profileCreationDate) {
           updatedProfile.startWeight = updatedProfile.weight;
        }
        trackEvent('profile_updated', { fields_changed: Object.keys(newProfileData).filter(key => (prev as any)[key] !== (newProfileData as any)[key]) });
        return updatedProfile;
    });
  }, []);

  const handleTargetWeightChange = useCallback((targetWeight: number | null) => {
    setUserProfile(prev => {
      const newProfile = {...prev, targetWeight};
      if (prev.weight && !prev.startWeight && targetWeight !== null) {
        newProfile.startWeight = prev.weight;
      }
      return newProfile;
    });
    trackEvent('target_weight_updated', { targetWeight });
  }, []);

  const handleTargetDateChange = useCallback((targetDate: string | null) => {
    setUserProfile(prev => ({...prev, targetDate}));
    trackEvent('target_date_updated', { targetDate });
  }, []);

  const handleUpdateMacroTargets = useCallback((macroTargets: { protein: number; carbs: number; fat: number; fiber: number }) => {
    setUserProfile(prev => ({
      ...prev,
      customMacroTargets: macroTargets
    }));
    trackEvent('custom_macro_targets_updated', macroTargets);
  }, []);

  const handleRemoveFood = useCallback((foodId: string, isOfflineItem: boolean = false) => {
    if (isOfflineItem) {
        setOfflineFoodQueue(prevQueue => {
            const itemToRemove = prevQueue.find(item => item.id === foodId);
            if(itemToRemove) trackEvent('offline_food_removed', { name: itemToRemove.name });
            return prevQueue.filter(item => item.id !== foodId)
        });
    } else {
        setFoodLog(prevLog => {
            const itemToRemove = prevLog.find(item => item.id === foodId);
            if(itemToRemove) {
                trackEvent('food_removed', { name: itemToRemove.name, calories: itemToRemove.calories });
            }
            return prevLog.filter(item => item.id !== foodId);
        });
    }
  }, []);

  const handleAddWeightEntry = useCallback((entry: WeightEntry) => {
    setActualWeightLog(prevLog => {
      const existingEntryIndex = prevLog.findIndex(e => e.date === entry.date);
      let newLog;
      if (existingEntryIndex > -1) {
        const updatedLog = [...prevLog];
        updatedLog[existingEntryIndex] = entry;
        newLog = updatedLog;
      } else {
        newLog = [...prevLog, entry];
      }
      return newLog.sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
    });

    const shareText = `Logged my weight on DietWise: ${entry.weight} lbs on ${entry.date}. Making progress on my health journey! #DietWise #WeightTracking #FitnessJourney`;
    displayGlobalSuccessMessage({
        message: `Weigh-in for ${format(parseISO(entry.date), 'MMM d, yyyy')} saved!`,
        shareData: { title: "My DietWise Weigh-in!", text: shareText, url: window.location.href }
    });
    trackEvent('weight_entry_added', { date: entry.date, weight: entry.weight });

    if(userProfile.targetWeight !== null && userProfile.startWeight !== null) {
      const startW = userProfile.startWeight;
      const targetW = userProfile.targetWeight;
      const currentW = entry.weight;

      if (currentW <= targetW && startW > targetW) { 
         if (!milestones.find(m => m.type === MilestoneType.REACHED_TARGET_WEIGHT)) {
           addMilestone(MilestoneType.REACHED_TARGET_WEIGHT, `Reached Target Weight of ${targetW} lbs!`);
         }
      } else if (currentW >= targetW && startW < targetW) { 
         if (!milestones.find(m => m.type === MilestoneType.REACHED_TARGET_WEIGHT)) {
           addMilestone(MilestoneType.REACHED_TARGET_WEIGHT, `Reached Target Weight of ${targetW} lbs!`);
         }
      }
      else { 
        const weightLost = startW - currentW; 
        // const weightGained = currentW - startW; 

        if (startW > targetW && weightLost > 0) { 
          const lastAchievedMilestoneVal = milestones
            .filter(m => m.type === MilestoneType.WEIGHT_LOSS_X_LBS && typeof m.value === 'number')
            .reduce((max, m) => Math.max(max, m.value as number), 0);

          const nextMilestone = Math.floor(weightLost / WEIGHT_MILESTONE_INCREMENT) * WEIGHT_MILESTONE_INCREMENT;
          if (nextMilestone > lastAchievedMilestoneVal && nextMilestone > 0) {
            addMilestone(MilestoneType.WEIGHT_LOSS_X_LBS, `Lost ${nextMilestone} lbs!`, nextMilestone);
          }
        }
      }
    }
  }, [displayGlobalSuccessMessage, userProfile.targetWeight, userProfile.startWeight, addMilestone, milestones]);

  const showNotification = useCallback( (title: string, options: NotificationOptions) => {
    if (!('Notification' in window) || Notification.permission !== 'granted' || !('serviceWorker' in navigator) || !navigator.serviceWorker.ready) {

        return;
    }
    navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, options);
    });
  }, []);

  // Updated scheduleMealReminders to show immediate notifications if time is near/past
  const handleUpdateReminderSettings = useCallback((settingsUpdate: Partial<ReminderSettings>) => {
    setReminderSettings(prev => {
      const newSettings = { ...prev, ...settingsUpdate };

      if (settingsUpdate.mealReminders) {
        const refinedMealReminders = { ...prev.mealReminders };
        for (const key of Object.keys(settingsUpdate.mealReminders) as Array<keyof ReminderSettings['mealReminders']>) {
          const updateForMeal = settingsUpdate.mealReminders[key];
          if (updateForMeal) {
            refinedMealReminders[key] = {
              ...prev.mealReminders[key],
              ...updateForMeal,
            };
          }
        }
        newSettings.mealReminders = refinedMealReminders;
      }

      trackEvent('reminder_settings_updated', settingsUpdate);

      if (Notification.permission === 'granted') {
        Object.entries(newSettings.mealReminders).forEach(([mealTypeKey, reminder]: [string, MealReminder]) => {
          if (reminder.enabled) {
            const [hours, minutes] = reminder.time.split(':').map(Number);
            const now = new Date();
            const reminderTimeToday = new Date(startOfDay(now));
            reminderTimeToday.setHours(hours, minutes, 0, 0);

            if (isToday(reminderTimeToday) && differenceInMinutes(new Date(), reminderTimeToday) >= -15 && differenceInMinutes(new Date(), reminderTimeToday) <= 5) {
              showNotification(`Time for ${mealTypeKey}!`, {
                body: `It's ${reminder.time}, time for your ${mealTypeKey}.`,
                icon: '/icons/icon-192x192.png',
                tag: `dietwise-meal-${mealTypeKey}-${format(new Date(), 'yyyy-MM-dd')}`,
                data: { url: '/#Log', type: 'meal_reminder' }
              });
            }
          }
        });
      }
      return newSettings;
    });
  }, [showNotification, format, startOfDay, isToday, differenceInMinutes ]);

  const scheduleMealReminders = useCallback(() => {
    const now = new Date();
    Object.entries(reminderSettings.mealReminders).forEach(([mealType, reminder]: [string, MealReminder]) => {
      if (reminder.enabled) {
        const [hours, minutes] = reminder.time.split(':').map(Number);

        const reminderTimeToday = new Date(startOfDay(now)); 
        reminderTimeToday.setHours(hours, minutes, 0, 0); 

        if (isToday(reminderTimeToday) && 
            differenceInMinutes(now, reminderTimeToday) >= -15 && 
            differenceInMinutes(now, reminderTimeToday) <= 5      
           ) {
          showNotification(`Time for ${mealType}!`, {
            body: `It's ${reminder.time}, time for your ${mealType}. Enjoy!`,
            icon: '/icons/icon-192x192.png',
            tag: `dietwise-meal-${mealType}-${format(now, 'yyyy-MM-dd')}`, 
            data: { url: '/#Log', type: 'meal_reminder' }
          });
          trackEvent('meal_reminder_notification_shown_client', { mealType });
        }
      }
    });
  }, [reminderSettings.mealReminders, showNotification, format, startOfDay, isToday, differenceInMinutes]);

  const scheduleWeighInReminder = useCallback(() => {
    const today = startOfDay(new Date());
    let lastReminderDismissDate: Date | null = null;
    if (reminderSettings.lastWeighInReminderDismissedDate) {
        try { lastReminderDismissDate = startOfDay(parseISO(reminderSettings.lastWeighInReminderDismissedDate)); }
        catch (e) {  }
    }

    if (lastReminderDismissDate && format(lastReminderDismissDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
        return;
    }

    let lastWeighInDate: Date | null = null;
    if (actualWeightLog.length > 0) {
        try { lastWeighInDate = startOfDay(parseISO(actualWeightLog[actualWeightLog.length - 1].date)); }
        catch (e) {  }
    }

    const shouldNotify = (lastWeighInDate 
      ? differenceInCalendarDays(today, lastWeighInDate) >= reminderSettings.weighInFrequencyDays
      : Boolean(
          (userProfile.targetWeight && (userProfile.weight || userProfile.profileCreationDate)) &&
          (differenceInCalendarDays(today, userProfile.profileCreationDate ? parseISO(userProfile.profileCreationDate) : new Date(0)) >=1 || userProfile.weight)
        ));

    if (shouldNotify) {
        showNotification('DietWise Weigh-in Reminder', {
            body: `Time for your weigh-in, ${userProfile.name || 'User'}! Keep up the great work.`,
            icon: '/icons/icon-192x192.png',
            tag: 'dietwise-weigh-in-reminder',
            data: { url: '/#Progress', type: 'weigh_in' }
        });
        trackEvent('weigh_in_notification_scheduled_client');
    }
  }, [reminderSettings, actualWeightLog, userProfile, showNotification, format, startOfDay, parseISO, differenceInCalendarDays]);

  const handleAddMyFood = (food: MyFoodItem) => setMyFoods(prev => [...prev, {...food, id: generateUUID()}]);
  const handleUpdateMyFood = (updatedFood: MyFoodItem) => setMyFoods(prev => prev.map(f => f.id === updatedFood.id ? updatedFood : f));
  const handleDeleteMyFood = (foodId: string) => setMyFoods(prev => prev.filter(f => f.id !== foodId));

  const handleAddMyMeal = (meal: MyMeal) => {
    const newMeal = {...meal, id: generateUUID()};
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    newMeal.ingredients.forEach(ing => {
      const foodItem = myFoods.find(f => f.id === ing.foodId);
      if (foodItem) {
        totalCalories += (foodItem.calories || 0) * ing.servings;
        totalProtein += (foodItem.protein || 0) * ing.servings;
        totalCarbs += (foodItem.carbs || 0) * ing.servings;
        totalFat += (foodItem.fat || 0) * ing.servings;
      }
    });
    newMeal.totalCalories = totalCalories;
    newMeal.totalProtein = totalProtein;
    newMeal.totalCarbs = totalCarbs;
    newMeal.totalFat = totalFat;
    setMyMeals(prev => [...prev, newMeal]);
  };
  const handleUpdateMyMeal = (updatedMeal: MyMeal) => {
     let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    updatedMeal.ingredients.forEach(ing => {
      const foodItem = myFoods.find(f => f.id === ing.foodId);
      if (foodItem) {
        totalCalories += (foodItem.calories || 0) * ing.servings;
        totalProtein += (foodItem.protein || 0) * ing.servings;
        totalCarbs += (foodItem.carbs || 0) * ing.servings;
        totalFat += (foodItem.fat || 0) * ing.servings;
      }
    });
    updatedMeal.totalCalories = totalCalories;
    updatedMeal.totalProtein = totalProtein;
    updatedMeal.totalCarbs = totalCarbs;
    updatedMeal.totalFat = totalFat;
    setMyMeals(prev => prev.map(m => m.id === updatedMeal.id ? updatedMeal : m));
  }
  const handleDeleteMyMeal = (mealId: string) => setMyMeals(prev => prev.filter(m => m.id !== mealId));

  const handleLogMyMeal = (mealId: string) => {
    const mealToLog = myMeals.find(m => m.id === mealId);
    if (mealToLog) {
      const foodItem: FoodItem = {
        id: `mymeal-${mealToLog.id}-${Date.now()}`,
        name: mealToLog.name,
        calories: mealToLog.totalCalories || 0,
        protein: mealToLog.totalProtein,
        carbs: mealToLog.totalCarbs,
        fat: mealToLog.totalFat,
        servingSize: mealToLog.description || "1 custom meal",
        timestamp: Date.now()
      };
      handleAddFood(foodItem, 'my_meal');
      setIsLogFromMyMealModalOpen(false); 
    }
  };

  const isProfileCompleteForFunctionality = useMemo(() => { 
    return userProfile.age !== null &&
           userProfile.sex !== null &&
           userProfile.height !== null && (userProfile.height.ft !== null || userProfile.height.in !== null) && 
           userProfile.weight !== null &&
           userProfile.activityLevel !== null &&
           userProfile.targetWeight !== null;
  }, [userProfile]);

  const isProfileSufficientForDashboard = useMemo(() => {
    return userProfile.name !== null &&
           userProfile.weight !== null &&
           userProfile.targetWeight !== null;
  }, [userProfile]);

  useEffect(() => {
    if (isProfileCompleteForFunctionality && !hasShownSetupCompleteMessage && activeTab !== Tab.Profile) {
      displayGlobalSuccessMessage(`Welcome, ${userProfile.name || 'User'}! Your profile is set up. Explore DietWise features!`);
      setHasShownSetupCompleteMessage(true);
      trackEvent('initial_setup_complete_message_shown', { userName: userProfile.name });
    }
  }, [isProfileCompleteForFunctionality, hasShownSetupCompleteMessage, activeTab, userProfile.name, displayGlobalSuccessMessage]);

  useEffect(() => {
    if (isInitialSetup || isReviewPromptModalOpen || reminderSettings.hasGivenFeedback) return;

    const reviewMetrics: ReviewPromptMetrics = {
        completedFirstWeek: milestones.some(m => m.type === MilestoneType.FIRST_WEEK_COMPLETED),
        achievedWeightMilestone: milestones.some(m => m.type === MilestoneType.WEIGHT_LOSS_X_LBS || m.type === MilestoneType.REACHED_TARGET_WEIGHT),
        logged30Meals: milestones.some(m => m.type === MilestoneType.LOGGED_X_MEALS && (m.value as number) >= 30),
        foodLogStreak7Days: milestones.some(m => m.type === MilestoneType.LOGGED_FOOD_X_DAYS_STREAK && (m.value as number) >= 7),
    };

    reviewManagerRef.current.shouldRequestReview(userProfile.email || 'anonymous', reviewMetrics, reminderSettings.lastReviewPromptDate, reminderSettings.hasGivenFeedback)
      .then(shouldPrompt => {
        if (shouldPrompt) {
          setIsReviewPromptModalOpen(true);
          handleUpdateReminderSettings({ lastReviewPromptDate: new Date().toISOString() });
        }
      });
  }, [milestones, isInitialSetup, isReviewPromptModalOpen, reminderSettings.lastReviewPromptDate, reminderSettings.hasGivenFeedback, userProfile.email, handleUpdateReminderSettings]);

  useEffect(() => {
    if (Notification.permission === 'granted') {
      scheduleMealReminders(); 
      scheduleWeighInReminder(); 
    }
  }, [reminderSettings.mealReminders, scheduleMealReminders, scheduleWeighInReminder, actualWeightLog]); 

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      displayGlobalSuccessMessage({message: "This browser does not support desktop notification."});
      return;
    }
    if (Notification.permission === 'granted') {
      displayGlobalSuccessMessage({message: "Notification permission already granted."});
      scheduleMealReminders(); 
      scheduleWeighInReminder();
    } else if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          displayGlobalSuccessMessage({message: "Notification permission granted!"});
          scheduleMealReminders();
          scheduleWeighInReminder();
          trackEvent('notification_permission_granted');
        } else {
          displayGlobalSuccessMessage({message: "Notification permission denied."});
          trackEvent('notification_permission_denied');
        }
      } catch (err) {
          console.error("Error requesting notification permission:", err);
          displayGlobalSuccessMessage({message: "Could not request notification permission."});
      }
    } else {
        displayGlobalSuccessMessage({message: "Notification permission was previously denied. Please enable it in browser settings."});
    }
  };

  const tabOrder: Tab[] = [Tab.Log, Tab.FoodLibrary, Tab.Meals, Tab.Planner, Tab.Progress, Tab.Profile];

  const AdPlaceholder: React.FC<{sizeLabel?: string; className?: string}> = ({ sizeLabel = "Banner Ad (e.g., 320x50)", className=""}) => (
    <div className={`bg-slate-200 dark:bg-slate-700 border-2 border-dashed border-slate-400 dark:border-slate-500 text-slate-500 dark:text-slate-400 text-sm flex flex-col items-center justify-center h-20 sm:h-24 my-6 rounded-md shadow text-center p-2 ${className}`}>
      <i className="fas fa-ad text-2xl text-slate-400 dark:text-slate-500 mb-1"></i>
      <p className="font-semibold">Advertisement</p>
      <p className="text-xs">{sizeLabel}</p>
    </div>
  );

  const toggleTheme = () => {
    setCurrentTheme(prev => prev === 'light' ? 'dark' : 'light');
    trackEvent('theme_toggled', { theme: currentTheme === 'light' ? 'dark' : 'light' });
  };

  const exportDataToCsv = (data: any[], filename: string) => {
    if (data.length === 0) {
      displayGlobalSuccessMessage({message: "No data to export."});
      return;
    }
    try {
        const headers = Object.keys(data[0]);
        const csvRows = [
          headers.join(','),
          ...data.map(row => 
            headers.map(header => {
              let cell = row[header] === null || row[header] === undefined ? '' : String(row[header]);
              cell = cell.includes(',') || cell.includes('"') || cell.includes('\n') ? `"${cell.replace(/"/g, '""')}"` : cell;
              return cell;
            }).join(',')
          )
        ];
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', filename);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url); 
          trackEvent('data_exported', { filename });
          displayGlobalSuccessMessage({message: `${filename} exported successfully.`});
        }
    } catch (e) {
        console.error("Error exporting data to CSV:", e);
        displayGlobalSuccessMessage({message: "Data export failed."});
        trackEvent('data_export_failed', { filename, error: (e as Error).message});
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case Tab.Profile:
        const welcomeName = userProfile.name ? `, ${userProfile.name}` : '';
        return (
          <>
            {apiKeyStatus === 'missing' && (
                <Alert 
                    type="error" 
                    message={<><strong>Critical: API Key Missing!</strong><br />DietWise AI features (meal ideas, UPC scanning, 7-day planner) will not work without a valid Gemini API Key. Please ensure the <code>API_KEY</code> environment variable is correctly set up for this application to function properly.</>} 
                    className="mb-6"
                />
            )}
            {isInitialSetup && ( 
              <Alert 
                type="info" 
                message={`Welcome to DietWise${welcomeName}! Please complete your details below to get started and unlock all features.`} 
                className="mb-6"
              />
            )}
            <UserProfileForm profile={userProfile} onProfileChange={handleProfileChange} />
            <WeightGoalSetter 
              profile={userProfile} 
              onTargetWeightChange={handleTargetWeightChange}
              onTargetDateChange={handleTargetDateChange}
            />
            <CalculationsDisplay metrics={calculatedMetrics} isProfileComplete={isProfileCompleteForFunctionality} showBmiCategoryMessage={false} />

            <div className="mt-6">
              <CustomMacroTargets
                currentTargets={userProfile.customMacroTargets || calculateDefaultMacroTargets(calculatedMetrics.targetCalories)}
                onUpdateTargets={handleUpdateMacroTargets}
                isPremiumUser={isPremiumUser}
                onUpgradeClick={() => setIsUpgradeModalOpen(true)}
                targetCalories={calculatedMetrics.targetCalories}
              />
            </div>

            {/* Premium Subscription Section */}
            <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl mt-6 sm:mt-8">
              <h3 className="text-lg font-semibold text-text-default mb-4 pb-3 border-b border-border-default">
                <i className="fas fa-crown mr-2.5 text-yellow-500 dark:text-yellow-400"></i>Premium Subscription
              </h3>
              {isPremiumLoading ? (
                <div className="text-center py-4">
                  <i className="fas fa-spinner fa-spin text-2xl text-text-alt"></i>
                </div>
              ) : isPremiumUser ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg">
                    <div>
                      <p className="text-text-default font-semibold">Premium Active</p>
                      <p className="text-sm text-text-alt">Enjoy unlimited access to all features</p>
                    </div>
                    <i className="fas fa-check-circle text-2xl text-green-500"></i>
                  </div>
                  <button
                    onClick={openCustomerPortal}
                    className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200 font-semibold py-3 px-6 rounded-lg shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all"
                  >
                    <i className="fas fa-cog mr-2"></i>
                    Manage Subscription
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-text-default font-semibold mb-2">Upgrade to Premium</p>
                    <ul className="space-y-2 text-sm text-text-alt">
                      <li><i className="fas fa-check text-teal-500 mr-2"></i>Unlimited barcode scans</li>
                      <li><i className="fas fa-check text-teal-500 mr-2"></i>Advanced analytics</li>
                      <li><i className="fas fa-check text-teal-500 mr-2"></i>7-day meal planning</li>
                      <li><i className="fas fa-check text-teal-500 mr-2"></i>Export to PDF</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => setIsUpgradeModalOpen(true)}
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all"
                  >
                    <i className="fas fa-rocket mr-2"></i>
                    Start 7-Day Free Trial
                  </button>
                </div>
              )}
            </div>

            <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl mt-6 sm:mt-8">
                <h3 className="text-lg font-semibold text-text-default mb-4 pb-3 border-b border-border-default">
                    <i className="fas fa-palette mr-2.5 text-purple-500 dark:text-purple-400"></i>Appearance
                </h3>
                <div className="flex items-center justify-between">
                    <span className="text-text-alt">Dark Mode</span>
                    <button
                        onClick={toggleTheme}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${currentTheme === 'dark' ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                        role="switch"
                        aria-checked={currentTheme === 'dark'}
                        aria-label={currentTheme === 'dark' ? 'Disable dark mode' : 'Enable dark mode'}
                    >
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${currentTheme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`}/>
                    </button>
                </div>
            </div>

            <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl mt-6 sm:mt-8">
              <h3 className="text-lg font-semibold text-text-default mb-4 pb-3 border-b border-border-default">
                <i className="fas fa-bell mr-2.5 text-yellow-500 dark:text-yellow-400"></i>Notification Settings
              </h3>
              {Notification.permission !== 'granted' && (
                <button
                  onClick={requestNotificationPermission}
                  className="mb-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
                >
                  Enable Meal & Weigh-in Reminders
                </button>
              )}
              {Object.entries(reminderSettings.mealReminders).map(([mealType, reminder]: [string, MealReminder]) => (
                <div key={mealType} className="flex items-center justify-between py-2 border-b border-border-default last:border-b-0">
                  <span className="text-text-alt capitalize">{mealType} Reminder</span>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="time" 
                      value={reminder.time}
                      disabled={!reminder.enabled || Notification.permission !== 'granted'}
                      onChange={e => handleUpdateReminderSettings({ mealReminders: { ...reminderSettings.mealReminders, [mealType as keyof ReminderSettings['mealReminders']]: {...reminder, time: e.target.value }}})}
                      className="p-1 border border-border-default rounded bg-bg-card text-text-default text-sm disabled:opacity-50 dark:[color-scheme:dark]"
                      aria-label={`Set time for ${mealType} reminder`}
                    />
                    <button
                        onClick={() => handleUpdateReminderSettings({ mealReminders: { ...reminderSettings.mealReminders, [mealType as keyof ReminderSettings['mealReminders']]: {...reminder, enabled: !reminder.enabled }}})}
                        disabled={Notification.permission !== 'granted'}
                        className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${reminder.enabled ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                        role="switch"
                        aria-checked={reminder.enabled}
                        aria-label={`${reminder.enabled ? 'Disable' : 'Enable'} ${mealType} reminder`}
                    >
                        <span className={`inline-block w-3.5 h-3.5 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${reminder.enabled ? 'translate-x-5' : 'translate-x-1'}`}/>
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between py-2 mt-2">
                  <span className="text-text-alt">Weigh-in Reminder Frequency</span>
                   <select 
                      value={reminderSettings.weighInFrequencyDays}
                      onChange={e => handleUpdateReminderSettings({ weighInFrequencyDays: parseInt(e.target.value, 10) })}
                      disabled={Notification.permission !== 'granted'}
                      className="p-1 border border-border-default rounded bg-bg-card text-text-default text-sm disabled:opacity-50 dark:[color-scheme:dark]"
                      aria-label="Set weigh-in reminder frequency"
                    >
                        <option value="1">Daily</option>
                        <option value="3">Every 3 Days</option>
                        <option value="7">Weekly</option>
                        <option value="14">Bi-Weekly</option>
                    </select>
              </div>
              {Notification.permission === 'denied' && <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">Notification permission is denied. You can change this in your browser settings.</p>}
            </div>

            <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl mt-6 sm:mt-8">
                <h3 className="text-lg font-semibold text-text-default mb-4 pb-3 border-b border-border-default">
                    <i className="fas fa-file-export mr-2.5 text-green-500 dark:text-green-400"></i>Export Data
                </h3>
                {!isPremiumUser && (
                  <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      <i className="fas fa-info-circle mr-2"></i>
                      Free users can only export data from the last 30 days. Upgrade to access your complete history.
                    </p>
                  </div>
                )}
                <div className="space-y-3">
                    <button 
                        onClick={() => exportDataToCsv(filteredFoodLog.map(item => ({...item, timestamp: new Date(item.timestamp).toLocaleString()})), 'dietwise_food_log.csv')}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow"
                    >
                        Export Food Log (CSV)
                    </button>
                    <button 
                        onClick={() => exportDataToCsv(filteredWeightLog, 'dietwise_weight_history.csv')}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow"
                    >
                        Export Weight History (CSV)
                    </button>
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <PDFExportButton
                            foodLog={filteredFoodLog}
                            userProfile={userProfile}
                            weightLog={filteredWeightLog}
                            isPremiumUser={isPremiumUser}
                            onUpgradeClick={() => setIsUpgradeModalOpen(true)}
                            premiumLimits={{
                                canExportData: premiumLimits.limits.canExportData,
                                onExport: premiumLimits.increment.exports
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl mt-6 sm:mt-8">
              <h3 className="text-lg font-semibold text-text-default mb-4 pb-3 border-b border-border-default">
                <i className="fas fa-shield-alt mr-2.5 text-blue-500 dark:text-blue-400"></i>Legal & Privacy
              </h3>
              <div className="space-y-3">
                <a 
                  href="/privacy-policy.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-bg-hover transition-colors cursor-pointer"
                >
                  <span className="text-text-default">Privacy Policy</span>
                  <i className="fas fa-external-link-alt text-text-alt text-sm"></i>
                </a>
                <a 
                  href="/terms-of-service.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-bg-hover transition-colors cursor-pointer"
                >
                  <span className="text-text-default">Terms of Service</span>
                  <i className="fas fa-external-link-alt text-text-alt text-sm"></i>
                </a>
                <div className="pt-3 mt-3 border-t border-border-default">
                  <p className="text-sm text-text-alt">
                    <i className="fas fa-info-circle mr-2"></i>
                    By using DietWise, you agree to our Terms of Service and Privacy Policy.
                  </p>
                  <p className="text-xs text-text-alt mt-2">
                    Version 1.0.0 · © 2025 Wizard Tech LLC
                  </p>
                </div>
              </div>

              {/* Account Section */}
              <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl mt-6 sm:mt-8">
                <h3 className="text-lg font-semibold text-text-default mb-4 pb-3 border-b border-border-default">
                  <i className="fas fa-user mr-2.5 text-indigo-500 dark:text-indigo-400"></i>Account
                </h3>
                {isAuthenticated && user ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <p className="text-sm text-text-alt">Signed in as</p>
                      <p className="text-text-default font-semibold">{user.email}</p>
                      {user.name && <p className="text-text-alt">{user.name}</p>}
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to sign out?')) {
                          logout();
                        }
                      }}
                      className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200 font-semibold py-3 px-6 rounded-lg shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all"
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i>
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-text-alt">Sign in to sync your data across devices and access premium features.</p>
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          setAuthModalMode('login');
                          setIsAuthModalOpen(true);
                        }}
                        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all"
                      >
                        <i className="fas fa-sign-in-alt mr-2"></i>
                        Sign In
                      </button>
                      <button
                        onClick={() => {
                          setAuthModalMode('signup');
                          setIsAuthModalOpen(true);
                        }}
                        className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200 font-semibold py-2.5 px-6 rounded-lg shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all"
                      >
                        <i className="fas fa-user-plus mr-2"></i>
                        Create Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <AdPlaceholder sizeLabel="Profile Tab Ad (e.g., 300x100)" className="mt-6" />
          </>
        );
      case Tab.Log:
        return (
          <>
            <FoodLog 
                loggedItems={todaysLog}
                offlineQueue={offlineFoodQueue}
                onAddFood={(item, source) => handleAddFood(item, source)} 
                onRemoveFood={handleRemoveFood} 
                targetCalories={calculatedMetrics.targetCalories}
                userName={userProfile.name}
                onOpenLogFromMyMeals={() => setIsLogFromMyMealModalOpen(true)}
                isOnline={isOnline}
                onSyncOfflineItems={syncOfflineFoodLog}
                onOpenUPCScanner={() => setIsUPCScannerModalOpen(true)}
                apiKeyMissing={apiKeyStatus === 'missing'}
                canScanBarcode={premiumLimits.limits.canScanBarcode()}
                isPremiumUser={isPremiumUser}
            />
            <AdPlaceholder />
          </>
        );
      case Tab.FoodLibrary:
        return (
          <>
            {!isPremiumUser && (myFoods.length + myMeals.length) >= 15 && (
              <div className="mb-4">
                <UpgradePrompt
                  feature="Expand Your Food Library"
                  message="Remove limits and save unlimited custom foods and meals. Never lose your favorite recipes!"
                  icon="fas fa-book"
                  variant="banner"
                  onUpgradeClick={() => setIsUpgradeModalOpen(true)}
                />
              </div>
            )}
            <Suspense fallback={<LoadingSpinner message="Loading Food Library..." />}>
              <MyLibraryComponent
                myFoods={myFoods}
                myMeals={myMeals}
                onAddFood={handleAddMyFood}
                onUpdateFood={handleUpdateMyFood}
                onDeleteFood={handleDeleteMyFood}
                onAddMeal={handleAddMyMeal}
                onUpdateMeal={handleUpdateMyMeal}
                onDeleteMeal={handleDeleteMyMeal}
                onLogMeal={(mealId: string) => handleLogMyMeal(mealId)}
                apiKeyMissing={apiKeyStatus === 'missing'}
              />
            </Suspense>
            <AdPlaceholder sizeLabel="Food Library Ad (e.g., 300x100)" className="mt-6"/>
          </>
        );
      case Tab.Meals:
        return (
          <>
            <MealIdeaSuggestion 
              calorieTarget={calculatedMetrics.targetCalories} 
              isProfileComplete={isProfileCompleteForFunctionality}
              userName={userProfile.name}
              apiKeyMissing={apiKeyStatus === 'missing'}
              canGetMealSuggestion={premiumLimits.limits.canGetMealSuggestion()}
              onMealSuggestion={premiumLimits.increment.mealSuggestions}
              onUpgradeClick={() => setIsUpgradeModalOpen(true)}
              isPremiumUser={isPremiumUser}
            />
            <AdPlaceholder sizeLabel="Medium Rectangle Ad (e.g., 300x250)" />
          </>
        );
      case Tab.Planner:
        if (!isPremiumUser) {
          if (!isUpgradeModalOpen) setIsUpgradeModalOpen(true); 
          return (
            <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl mt-6 sm:mt-8 text-center">
              <i className="fas fa-lock text-4xl text-slate-400 dark:text-slate-500 mb-4"></i>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-default mb-2">
                Unlock Your 7-Day Meal Plan
              </h2>
              <p className="text-text-alt mb-6">
                This exclusive feature is part of DietWise Premium. Upgrade to get personalized weekly plans!
              </p>
              <button
                onClick={() => {
                  setIsUpgradeModalOpen(true);
                  trackEvent('upgrade_modal_opened_from_planner_placeholder');
                }}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all"
              >
                <i className="fas fa-crown mr-2"></i>Upgrade to Premium
              </button>
            </div>
          );
        }
        return (
          <Suspense fallback={<LoadingSpinner message="Loading 7-Day Planner..." />}>
            <MealPlannerComponent 
              calorieTarget={calculatedMetrics.targetCalories} 
              isProfileComplete={isProfileCompleteForFunctionality} 
              apiKeyStatus={apiKeyStatus}
              apiKeyMissing={apiKeyStatus === 'missing'}
              onPlanGenerated={(planName) => {
                const shareText = `Just generated my 7-day meal plan "${planName || 'Awesome Plan'}" with DietWise! Ready for a healthy week. #DietWise #MealPlanning #HealthyLifestyle`;
                displayGlobalSuccessMessage({
                  message: "7-Day Meal Plan generated successfully!",
                  shareData: { title: "My DietWise Meal Plan!", text: shareText, url: window.location.href }
                });
              }}
            />
          </Suspense>
        );
      case Tab.Progress:
        return (
          <>
            {!isPremiumUser && actualWeightLog.length >= 5 && (
              <div className="mb-4">
                <UpgradePrompt
                  feature="Track Your Full Journey"
                  message="Get advanced progress analytics, unlimited historical data, and detailed insights to reach your goals faster."
                  icon="fas fa-trophy"
                  variant="banner"
                  onUpgradeClick={() => setIsUpgradeModalOpen(true)}
                />
              </div>
            )}
            <Suspense fallback={<LoadingSpinner message="Loading Progress..." />}>
              <ProgressTabComponent
                userProfile={userProfile}
                actualWeightLog={filteredWeightLog}
                onAddWeightEntry={handleAddWeightEntry}
                reminderSettings={reminderSettings}
                onUpdateReminderSettings={handleUpdateReminderSettings}
                isProfileComplete={isProfileCompleteForFunctionality}
                currentTheme={currentTheme}
              />
            </Suspense>
          </>
        );
      case Tab.Analytics:
        return (
          <>
            <Suspense fallback={<LoadingSpinner message="Loading Analytics..." />}>
              <AdvancedAnalytics
                foodLog={filteredFoodLog}
                isPremiumUser={isPremiumUser}
                onUpgradeClick={() => setIsUpgradeModalOpen(true)}
              />
            </Suspense>
            {isPremiumUser && <AdPlaceholder sizeLabel="Analytics Ad (e.g., 300x100)" className="mt-6"/>}
          </>
        );
      default:
        return null;
    }
  };

  const getTabIcon = (tab: Tab) => {
    switch (tab) {
      case Tab.Profile: return "fas fa-user-cog";
      case Tab.Log: return "fas fa-apple-alt"; 
      case Tab.FoodLibrary: return "fas fa-book-bookmark";
      case Tab.Meals: return "fas fa-lightbulb";
      case Tab.Planner: return "fas fa-calendar-alt";
      case Tab.Progress: return "fas fa-chart-line";
      case Tab.Analytics: return "fas fa-chart-pie";
      default: return "";
    }
  };

  const handleTabChange = (tab: Tab) => {
    trackEvent('tab_navigation', { tab_name: tab });
    if ((tab === Tab.Planner || tab === Tab.Analytics) && !isPremiumUser) {
      setIsUpgradeModalOpen(true);
      trackEvent('upgrade_modal_opened_from_tab_click', { tab_name: tab });
    } else {
      setActiveTab(tab);
    }
  };

  const toggleDashboardVisibility = () => {
    const newVisibility = !isDashboardVisible;
    setIsDashboardVisible(newVisibility);
    trackEvent('dashboard_toggled', { visible: newVisibility });
  };

  const showDashboardToggle = isProfileSufficientForDashboard && !isInitialSetup;

  // Show splash screen if needed
  if (showSplash) {
    return <DietWiseSplashScreen onComplete={hideSplash} />;
  }

  return (
    <div className={`min-h-screen bg-bg-default text-text-default flex flex-col theme-${currentTheme}`}>
      <header className="bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 dark:from-teal-700 dark:via-cyan-700 dark:to-sky-700 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto max-w-7xl px-4 py-5 flex items-center justify-between">
          <div className="flex items-center">
            <i className="fas fa-leaf mr-3 text-3xl opacity-90"></i>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">DietWise</h1>
            {!isOnline && <span className="ml-3 text-xs font-normal bg-orange-500 text-white px-2 py-0.5 rounded-full animate-pulse">Offline Mode</span>}
          </div>
          {showDashboardToggle && (
            <button
              onClick={toggleDashboardVisibility}
              className="p-1.5 rounded-full hover:bg-white/20 focus:outline-none focus:ring-1 focus:ring-white/50 transition-colors"
              aria-label={isDashboardVisible ? "Hide status dashboard" : "Show status dashboard"}
              title={isDashboardVisible ? "Hide status dashboard" : "Show status dashboard"}
            >
              <i className={`fas ${isDashboardVisible ? 'fa-eye-slash' : 'fa-eye'} text-lg sm:text-xl fa-fw`}></i>
            </button>
          )}
        </div>
      </header>

      <nav className="bg-bg-card shadow-md sticky top-[68px] sm:top-[76px] z-40 border-b border-border-default">
        <div className="container mx-auto max-w-7xl px-2 sm:px-4 flex justify-center sm:justify-start space-x-0.5 sm:space-x-1 overflow-x-auto custom-scrollbar">
          {tabOrder.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`py-3 sm:py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-medium border-b-[3px] transition-all duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-teal-400 focus:ring-opacity-50 whitespace-nowrap flex items-center group
                ${activeTab === tab 
                  ? 'border-teal-500 dark:border-teal-400 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30' 
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-teal-500 dark:hover:text-teal-400 hover:border-teal-300 dark:hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-800/20'}`}
              aria-current={activeTab === tab ? 'page' : undefined}
            >
              <i className={`${getTabIcon(tab)} fa-fw mr-1.5 sm:mr-2 text-base ${activeTab === tab ? 'text-teal-500 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-teal-500 dark:group-hover:text-teal-400'}`}></i>
              {tab}
              {(tab === Tab.Planner || tab === Tab.Analytics) && !isPremiumUser && <i className="fas fa-star text-yellow-400 text-sm ml-1.5 -mr-0.5 transform group-hover:scale-110 transition-transform duration-150" title="Premium Feature"></i>}
            </button>
          ))}
        </div>
      </nav>

      <main className="container mx-auto max-w-5xl p-4 md:p-6 flex-grow w-full">
        {/* Strategic upgrade prompt - show after user has logged 10+ items and is not premium */}
        {!isPremiumUser && foodLog.length >= 10 && activeTab === Tab.Log && (
          <div className="mb-4">
            <UpgradePrompt
              feature="You're doing great!"
              message="Unlock unlimited barcode scans, advanced analytics, and more premium features to supercharge your diet tracking."
              icon="fas fa-chart-line"
              variant="banner"
              onUpgradeClick={() => setIsUpgradeModalOpen(true)}
            />
          </div>
        )}
        {globalSuccessMessage && (
          <Alert 
            type="success" 
            message={globalSuccessMessage.message} 
            shareData={globalSuccessMessage.shareData}
            onClose={() => setGlobalSuccessMessage(null)} 
            className="mb-4" 
          />
        )}
        {apiKeyStatus === 'checking' && activeTab !== Tab.Profile && 
            <Alert type="info" message="Verifying AI integration status..." className="mb-4" />
        }

        {showDashboardToggle && isDashboardVisible && (
          <Suspense fallback={<LoadingSpinner message="Loading Dashboard..." />}>
            <UserStatusDashboard 
              userProfile={userProfile}
              actualWeightLog={actualWeightLog}
              reminderSettings={reminderSettings}
              streakData={streakData}
              onNavigateToMealIdeas={() => handleTabChange(Tab.Meals)}
            />
          </Suspense>
        )}
         {milestones.length > 0 && activeTab === Tab.Progress && (
            <div className="mt-8 bg-bg-card p-6 rounded-xl shadow-xl">
                <h3 className="text-xl font-semibold text-text-default mb-4 pb-3 border-b border-border-default">
                    <i className="fas fa-trophy mr-2.5 text-yellow-500 dark:text-yellow-400"></i>Achievements
                </h3>
                <ul className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                    {milestones.slice().reverse().map(m => (
                        <li key={m.id} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-md shadow-sm text-sm">
                            <span className="font-semibold text-green-600 dark:text-green-400">
                                {format(parseISO(m.dateAchieved), 'MMM d, yyyy')}:
                            </span> {m.description}
                        </li>
                    ))}
                </ul>
            </div>
        )}

        {renderTabContent()}
      </main>

       {isUPCScannerModalOpen && (
        <UPCScannerComponent
          onFoodScanned={(item) => {
            handleAddFood(item, 'scan');
            setIsUPCScannerModalOpen(false); 
          }}
          apiKeyMissing={apiKeyStatus === 'missing'}
          isOpen={isUPCScannerModalOpen}
          onClose={() => setIsUPCScannerModalOpen(false)}
          canScanBarcode={premiumLimits.limits.canScanBarcode()}
          onBarcodeScan={premiumLimits.increment.barcodeScans}
          onUpgradeClick={() => {
            setIsUPCScannerModalOpen(false);
            setIsUpgradeModalOpen(true);
          }}
        />
      )}

      <Modal 
        isOpen={isLogFromMyMealModalOpen} 
        onClose={() => setIsLogFromMyMealModalOpen(false)} 
        title="Log from My Meals"
        size="lg"
      >
        {myMeals.length === 0 ? (
          <p className="text-text-alt text-center py-4">You haven't created any meals yet. Go to the 'Food Library' tab to add some!</p>
        ) : (
          <ul className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            {myMeals.map(meal => (
              <li key={meal.id} className="p-4 border border-border-default rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-text-default">{meal.name}</p>
                  <p className="text-xs text-text-alt">{meal.totalCalories?.toFixed(0) || 0} kcal</p>
                </div>
                <button
                  onClick={() => handleLogMyMeal(meal.id)}
                  className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-1.5 px-3 rounded-md text-sm shadow"
                >
                  Log Meal
                </button>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      <Suspense fallback={<LoadingSpinner message="Loading Review Modal..." />}>
        <ReviewPromptModal
          isOpen={isReviewPromptModalOpen}
          onClose={() => setIsReviewPromptModalOpen(false)}
          onSubmitFeedback={(rating, feedbackText) => {
            trackEvent('internal_feedback_submitted', { rating, feedback_length: feedbackText?.length });
            handleUpdateReminderSettings({ hasGivenFeedback: true }); 
            if (rating >=4) {
               displayGlobalSuccessMessage({message: "Thanks for your positive feedback! We appreciate it."});
            } else {
               displayGlobalSuccessMessage({message: "Thanks for your feedback! We'll use it to improve."});
            }
            setIsReviewPromptModalOpen(false);
          }}
        />
      </Suspense>

      <Modal 
        isOpen={isUpgradeModalOpen && !isPremiumUser} 
        onClose={() => {
          setIsUpgradeModalOpen(false);
          trackEvent('upgrade_modal_closed');
        }} 
        title=""
        size="md"
      >
        <Suspense fallback={<LoadingSpinner message="Loading Checkout..." />}>
          <StripeCheckout
            onClose={() => {
              setIsUpgradeModalOpen(false);
              trackEvent('stripe_checkout_closed');
            }}
            customerEmail={user?.email || userProfile.email}
            selectedPlan="yearly"
          />
        </Suspense>
      </Modal>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          checkPremiumStatus(); // Refresh premium status after login
          trackEvent('auth_success', { mode: authModalMode });
        }}
        initialMode={authModalMode}
      />

      <footer className="bg-slate-800 dark:bg-slate-900 text-slate-300 dark:text-slate-400 text-center p-8 mt-16 border-t border-slate-700 dark:border-slate-600">
        <p className="text-sm">&copy; {new Date().getFullYear()} Wizard Tech, LLC.</p>
        <p className="text-xs mt-2 opacity-80">
          This tool is for informational purposes only. Always consult with a healthcare professional before making significant changes to your diet or exercise routine.
        </p>
      </footer>
    </div>
  );
};

export default App;
