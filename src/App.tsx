
import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import { UserProfile, CalculatedMetrics, FoodItem, WeightEntry, ReminderSettings, SharePayload, AppTheme, MyFoodItem, MyMeal, MealReminder, StreakData, Milestone, MilestoneType } from '@appTypes'; 
import { defaultUserProfile, DEFAULT_REMINDER_SETTINGS, DEFAULT_STREAK_DATA, WEIGHT_MILESTONE_INCREMENT, STREAK_MILESTONES_DAYS, TOTAL_LOGGED_MEALS_MILESTONES } from '@constants';
import GoogleAdSense from './components/GoogleAdSense';
import { ADSENSE_CONFIG, AD_PLACEMENTS, shouldShowAds } from './constants/adConfig';
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
// Lazy load heavy components with preload capability
import { lazyWithPreload, preloadComponents } from '@utils/lazyWithPreload';
const MealPlannerComponent = lazyWithPreload(() => import('@components/MealPlannerComponent'));
const ProgressTabComponent = lazyWithPreload(() => import('../components/ProgressTabComponent').then(module => ({ default: module.ProgressTabComponent })));
const UserStatusDashboard = lazyWithPreload(() => import('@components/UserStatusDashboard'));
const MyLibraryComponent = lazyWithPreload(() => import('@components/MyLibraryComponent'));
const ReviewPromptModal = lazyWithPreload(() => import('@components/ReviewPromptModal'));
import { ReviewManagementSystem, ReviewPromptMetrics } from './aso/reviewManagement'; 
import { differenceInCalendarDays, format, addDays, isPast, isToday, differenceInMinutes } from 'date-fns';
import { parseISO } from 'date-fns/parseISO';
import { startOfDay } from 'date-fns/startOfDay';
import { usePremiumLimits } from '@hooks/usePremiumLimits';
import { usePremiumStatus } from '@hooks/usePremiumStatus';
import { useAuth } from '@hooks/useAuth';
import { PREMIUM_FEATURES, PREMIUM_MESSAGES } from './constants/premiumFeatures';
// More lazy loaded components
const StripeCheckout = lazyWithPreload(() => import('@components/StripeCheckout'));
const AdvancedAnalytics = lazyWithPreload(() => import('@components/AdvancedAnalytics'));
import PDFExportButton from '@components/PDFExportButton';
import CustomMacroTargets from '@components/CustomMacroTargets';
import UpgradePrompt from '@components/UpgradePrompt';
import AuthModal from '@components/auth/AuthModal';
import { filterByHistoricalLimit, getHistoricalLimitMessage } from '../utils/dataLimits';
import SettingsTab from '@components/SettingsTab';
import DietWiseSplashScreen from '@components/SplashScreen';
import OnboardingSplashScreen from './components/OnboardingSplashScreen';
import ProgressiveOnboarding from '@components/ProgressiveOnboarding';
import OnboardingChecklist from '@components/OnboardingChecklist';
import EmailCaptureModal from './components/EmailCaptureModal';
import MobileInstallPrompt from './components/MobileInstallPrompt';
import PullToRefresh from './components/PullToRefresh';
import { useSplashScreen } from '@hooks/useSplashScreen';
import { useMobileOptimizations } from './hooks/useMobileOptimizations';
import OfflineIndicator from '@components/common/OfflineIndicator';
import OfflineBanner from '@components/common/OfflineBanner';
import OfflineStatus from '@components/common/OfflineStatus';
import DemoBanner from './components/DemoBanner';
import { isDemoMode, getDemoData } from './config/demo';

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
  Settings = 'Settings', // App settings and preferences
}

interface GlobalSuccessPayload {
  message: string;
  shareData?: SharePayload;
}

const OFFLINE_FOOD_LOG_QUEUE_KEY = 'offlineFoodLogQueue';

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    // Use demo data if in demo mode
    if (isDemoMode()) {
      return { ...defaultUserProfile, ...getDemoData().userProfile };
    }
    
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
    // Use demo data if in demo mode
    if (isDemoMode()) {
      return getDemoData().foodLog;
    }
    
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
  const [hasJustCompletedOnboarding] = useState<boolean>(() => {
    // Check if user just completed onboarding in this session
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding') === 'true';
    const onboardingTimestamp = localStorage.getItem('onboardingCompletedAt');
    if (hasSeenOnboarding && onboardingTimestamp) {
      const timeSinceOnboarding = Date.now() - parseInt(onboardingTimestamp);
      // Consider it "just completed" if less than 30 minutes ago
      return timeSinceOnboarding < 30 * 60 * 1000;
    }
    return false;
  });
  const [activeTab, setActiveTab] = useState<Tab>(isInitialSetup ? Tab.Profile : Tab.Log); // Default to Profile if initial setup
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'ok' | 'missing'>('checking');
  const [isDashboardVisible, setIsDashboardVisible] = useState<boolean>(true);
  
  // Splash screen hook
  const { showSplash, hideSplash } = useSplashScreen();

  const [globalSuccessMessage, setGlobalSuccessMessage] = useState<GlobalSuccessPayload | null>(null);
  const [hasShownSetupCompleteMessage, setHasShownSetupCompleteMessage] = useState<boolean>(() => {
    return localStorage.getItem('hasShownSetupCompleteMessage') === 'true';
  });

  // Enhanced offline state management
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    return localStorage.getItem('lastSyncTime') || '';
  });
  const [showOfflineBanner, setShowOfflineBanner] = useState<boolean>(false);
  const [isRetryingConnection, setIsRetryingConnection] = useState<boolean>(false);

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
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return !localStorage.getItem('hasSeenOnboarding') && !userProfile.profileCreationDate;
  });
  const [showProgressiveOnboarding, setShowProgressiveOnboarding] = useState<boolean>(false);
  const [showOnboardingChecklist, setShowOnboardingChecklist] = useState<boolean>(() => {
    // Show checklist for new users who haven't dismissed it
    return isInitialSetup && localStorage.getItem('onboardingChecklistDismissed') !== 'true';
  });
  const [isEmailCaptureModalOpen, setIsEmailCaptureModalOpen] = useState<boolean>(false);

  // Mobile optimizations
  const mobile = useMobileOptimizations(
    () => {
      // Swipe left - next tab
      const currentIndex = tabOrder.indexOf(activeTab);
      if (currentIndex < tabOrder.length - 1) {
        setActiveTab(tabOrder[currentIndex + 1]);
      }
    },
    () => {
      // Swipe right - previous tab
      const currentIndex = tabOrder.indexOf(activeTab);
      if (currentIndex > 0) {
        setActiveTab(tabOrder[currentIndex - 1]);
      }
    }
  );

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
    return isPremiumUser ? foodLog : filterByHistoricalLimit(foodLog);
  }, [foodLog, isPremiumUser]);

  const filteredWeightLog = useMemo(() => {
    return isPremiumUser ? actualWeightLog : filterByHistoricalLimit(actualWeightLog);
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
    
    // Preload lazy components when the app is idle
    preloadComponents([
      MealPlannerComponent,
      ProgressTabComponent,
      UserStatusDashboard,
      MyLibraryComponent,
      AdvancedAnalytics,
      StripeCheckout
    ]);
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
    return filteredFoodLog.filter((item: any) => differenceInCalendarDays(new Date(), new Date(item.timestamp)) === 0);
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

  // Debug upgrade modal state
  useEffect(() => {
    if (isUpgradeModalOpen) {
    }
  }, [isUpgradeModalOpen, activeTab, isPremiumUser]);

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
      
      // Update last sync time
      const syncTime = new Date().toISOString();
      setLastSyncTime(syncTime);
      localStorage.setItem('lastSyncTime', syncTime);
      
      trackEvent('offline_sync_success', { syncedCount: successCount });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
      console.error("Error syncing offline food log:", error);
      }
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

  // Enhanced offline management
  const retryConnection = useCallback(async () => {
    setIsRetryingConnection(true);
    try {
      // Try to make a test request to check connectivity
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      if (response.ok) {
        setIsOnline(true);
        trackEvent('connection_retry_success');
      }
    } catch (error) {
      // Connection still failed
      trackEvent('connection_retry_failed');
    } finally {
      setIsRetryingConnection(false);
    }
  }, []);

  // Show offline banner when going offline
  useEffect(() => {
    if (!isOnline) {
      setShowOfflineBanner(true);
    }
  }, [isOnline]); 

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
      const startW = userProfile.startWeight!;
      const targetW = userProfile.targetWeight;
      const currentW = entry.weight;

      if (startW && currentW <= targetW && startW > targetW) { 
         if (!milestones.find(m => m.type === MilestoneType.REACHED_TARGET_WEIGHT)) {
           addMilestone(MilestoneType.REACHED_TARGET_WEIGHT, `Reached Target Weight of ${targetW} lbs!`);
         }
      } else if (startW && currentW >= targetW && startW < targetW) { 
         if (!milestones.find(m => m.type === MilestoneType.REACHED_TARGET_WEIGHT)) {
           addMilestone(MilestoneType.REACHED_TARGET_WEIGHT, `Reached Target Weight of ${targetW} lbs!`);
         }
      }
      else { 
        const weightLost = startW ? startW - currentW : 0; 
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

  // Email capture after first week completion
  useEffect(() => {
    const hasCompletedFirstWeek = milestones.some(m => m.type === MilestoneType.FIRST_WEEK_COMPLETED);
    const hasEmailCaptured = localStorage.getItem('hasEmailCaptured');
    const hasSkippedEmailCapture = localStorage.getItem('hasSkippedEmailCapture');
    
    if (hasCompletedFirstWeek && !hasEmailCaptured && !hasSkippedEmailCapture && !userProfile.email && !isEmailCaptureModalOpen) {
      // Small delay to let milestone celebration finish
      setTimeout(() => {
        setIsEmailCaptureModalOpen(true);
        trackEvent('email_capture_modal_shown', { trigger: 'first_week_completion' });
      }, 2000);
    }
  }, [milestones, userProfile.email, isEmailCaptureModalOpen]);

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
          if (process.env.NODE_ENV !== 'production') {
          console.error("Error requesting notification permission:", err);
          }
          displayGlobalSuccessMessage({message: "Could not request notification permission."});
      }
    } else {
        displayGlobalSuccessMessage({message: "Notification permission was previously denied. Please enable it in browser settings."});
    }
  };

  const tabOrder: Tab[] = [Tab.Log, Tab.FoodLibrary, Tab.Meals, Tab.Progress, Tab.Planner, Tab.Profile, Tab.Settings];

  // Determine if we should show ads
  const showAds = shouldShowAds(isPremiumUser);

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
        if (process.env.NODE_ENV !== 'production') {
        console.error("Error exporting data to CSV:", e);
        }
        displayGlobalSuccessMessage({message: "Data export failed."});
        trackEvent('data_export_failed', { filename, error: (e as Error).message});
    }
  };

  const handleEmailSubmit = async (email: string) => {
    try {
      // Update user profile with email
      setUserProfile(prev => ({ ...prev, email }));
      localStorage.setItem('hasEmailCaptured', 'true');
      displayGlobalSuccessMessage('Thanks! You\'ll receive weekly progress summaries every Sunday.');
      trackEvent('email_captured', { source: 'first_week_modal' });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
      console.error('Email submission failed:', error);
      }
      throw error;
    }
  };

  // Handle refresh for pull-to-refresh
  const handleRefresh = async () => {
    try {
      if (mobile?.vibrate) {
        mobile.vibrate(50); // Haptic feedback
      }
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      displayGlobalSuccessMessage('Data refreshed!');
      trackEvent('pull_to_refresh_used');
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
      console.error('Refresh failed:', error);
      }
    }
  };

  // Helper function to get first name
  const getFirstName = () => userProfile.name ? userProfile.name.split(' ')[0] : '';

  const renderTabContent = () => {
    // DEBUG: Log what tab is being rendered
    const firstName = getFirstName();
    
    switch (activeTab) {
      case Tab.Profile:
        const welcomeName = firstName ? `, ${firstName}` : '';

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
                isInitialSetup={isInitialSetup || hasJustCompletedOnboarding}
                profileCreationDate={userProfile.profileCreationDate}
              />
            </div>

            {/* Account Section - moved per user feedback */}
            <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl mt-6 sm:mt-8">
              <h3 className="text-lg font-semibold text-text-default mb-4 pb-3 border-b border-border-default">
                <i className="fas fa-user mr-2.5 text-blue-500 dark:text-blue-400"></i>Account
              </h3>
              {isAuthenticated && user ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-text-default font-semibold">Signed in as {user.email}</p>
                    <p className="text-sm text-text-alt">Your data is synced across devices</p>
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
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all"
                    >
                      <i className="fas fa-user-plus mr-2"></i>
                      Create Account
                    </button>
                  </div>
                </div>
              )}
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

            {showAds && (
              <GoogleAdSense
                adClient={ADSENSE_CONFIG.CLIENT_ID}
                adSlot={ADSENSE_CONFIG.AD_SLOTS.PROFILE_BANNER}
                {...AD_PLACEMENTS.PROFILE}
                testMode={ADSENSE_CONFIG.TEST_MODE}
              />
            )}
          </>
        );
      case Tab.Settings:
        return (
          <>
            <SettingsTab
              theme={currentTheme}
              handleThemeToggle={toggleTheme}
              notificationsEnabled={reminderSettings.mealReminders.breakfast.enabled || reminderSettings.mealReminders.lunch.enabled || reminderSettings.mealReminders.dinner.enabled}
              setNotificationsEnabled={(enabled) => {
                const newMealReminders = {
                  breakfast: { ...reminderSettings.mealReminders.breakfast, enabled },
                  lunch: { ...reminderSettings.mealReminders.lunch, enabled },
                  dinner: { ...reminderSettings.mealReminders.dinner, enabled }
                };
                handleUpdateReminderSettings({ mealReminders: newMealReminders });
              }}
              appVersion="1.0.0"
              exportData={() => {
                if (isPremiumUser) {
                  // This will trigger PDF export
                  const exportButton = document.querySelector('[data-pdf-export]') as HTMLButtonElement;
                  if (exportButton) exportButton.click();
                } else {
                  setIsUpgradeModalOpen(true);
                }
              }}
              isPremiumUser={isPremiumUser}
              onUpgradeClick={() => setIsUpgradeModalOpen(true)}
              pdfExportButton={
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
              }
              isOnline={isOnline}
              pendingItems={{
                foodLog: offlineFoodQueue.length,
                weight: 0, // TODO: Add weight queue if needed
                goals: 0, // TODO: Add goals queue if needed
                other: 0
              }}
              lastSyncTime={lastSyncTime}
              onSync={syncOfflineFoodLog}
              onRetryConnection={retryConnection}
              isSyncing={isRetryingConnection}
              syncProgress={0} // TODO: Add real sync progress tracking
            />
            {showAds && (
              <GoogleAdSense
                adClient={ADSENSE_CONFIG.CLIENT_ID}
                adSlot={ADSENSE_CONFIG.AD_SLOTS.SETTINGS_BANNER}
                {...AD_PLACEMENTS.SETTINGS}
                testMode={ADSENSE_CONFIG.TEST_MODE}
              />
            )}
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
                userName={firstName || userProfile.name}
                onOpenLogFromMyMeals={() => setIsLogFromMyMealModalOpen(true)}
                isOnline={isOnline}
                onSyncOfflineItems={syncOfflineFoodLog}
                onOpenUPCScanner={() => setIsUPCScannerModalOpen(true)}
                apiKeyMissing={apiKeyStatus === 'missing'}
                canScanBarcode={premiumLimits.limits.canScanBarcode()}
                isPremiumUser={isPremiumUser}
                lastSyncTime={lastSyncTime}
                showOfflineBanner={showOfflineBanner}
                onRetryConnection={retryConnection}
            />
            {showAds && (
              <GoogleAdSense
                adClient={ADSENSE_CONFIG.CLIENT_ID}
                adSlot={ADSENSE_CONFIG.AD_SLOTS.FOOD_LOG_BANNER}
                {...AD_PLACEMENTS.FOOD_LOG}
                testMode={ADSENSE_CONFIG.TEST_MODE}
              />
            )}
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
                userName={firstName || userProfile.name}
                targetCalories={calculatedMetrics.targetCalories}
              />
            </Suspense>
            {showAds && (
              <GoogleAdSense
                adClient={ADSENSE_CONFIG.CLIENT_ID}
                adSlot={ADSENSE_CONFIG.AD_SLOTS.FOOD_LIBRARY_BANNER}
                {...AD_PLACEMENTS.FOOD_LIBRARY}
                testMode={ADSENSE_CONFIG.TEST_MODE}
              />
            )}
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
            {showAds && (
              <GoogleAdSense
                adClient={ADSENSE_CONFIG.CLIENT_ID}
                adSlot={ADSENSE_CONFIG.AD_SLOTS.MEAL_IDEAS_RECTANGLE}
                {...AD_PLACEMENTS.MEAL_IDEAS}
                testMode={ADSENSE_CONFIG.TEST_MODE}
              />
            )}
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
              {(() => {
                try {
                  return (
                    <ProgressTabComponent
                      userProfile={userProfile}
                      actualWeightLog={filteredWeightLog}
                      onAddWeightEntry={handleAddWeightEntry}
                      reminderSettings={reminderSettings}
                      onUpdateReminderSettings={handleUpdateReminderSettings}
                      isProfileComplete={isProfileCompleteForFunctionality}
                      currentTheme={currentTheme}
                    />
                  );
                } catch (error) {
                  if (process.env.NODE_ENV !== 'production') {
                  console.error('Progress tab error:', error);
                  }
                  return (
                    <div className="p-4 text-center">
                      <p className="text-red-500">Error loading Progress tab</p>
                      <p className="text-sm text-gray-500 mt-2">{error?.toString()}</p>
                    </div>
                  );
                }
              })()}
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
            {isPremiumUser && showAds && (
              <GoogleAdSense
                adClient={ADSENSE_CONFIG.CLIENT_ID}
                adSlot={ADSENSE_CONFIG.AD_SLOTS.ANALYTICS_BANNER}
                {...AD_PLACEMENTS.ANALYTICS}
                testMode={ADSENSE_CONFIG.TEST_MODE}
              />
            )}
          </>
        );
      default:
        return null;
    }
  };

  const getTabIcon = (tab: Tab) => {
    switch (tab) {
      case Tab.Profile: return "fas fa-user-cog";
      case Tab.Settings: return "fas fa-cog";
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

    
    // Check if profile has required fields (name, age, sex, weight, height)
    const isProfileIncomplete = !userProfile.name || !userProfile.age || !userProfile.sex || 
                              !userProfile.weight || !userProfile.height || 
                              !userProfile.height.ft || !userProfile.height.in;
    
    // Always allow access to Profile tab
    if (tab !== Tab.Profile && isProfileIncomplete) {
      displayGlobalSuccessMessage({
        message: "Please complete your profile first to access other features."
      });
      return;
    }
    
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

  // Show onboarding if needed
  if (showOnboarding) {
    return (
      <OnboardingSplashScreen 
        onComplete={() => {
          setShowOnboarding(false);
          // After intro slides, show progressive profile setup
          setShowProgressiveOnboarding(true);
          trackEvent('onboarding_intro_completed');
        }}
        onStartFreeTrial={() => {
          setShowOnboarding(false);
          // Even with trial, guide through profile setup
          setShowProgressiveOnboarding(true);
          // Open upgrade modal after profile setup
          setTimeout(() => setIsUpgradeModalOpen(true), 100);
          trackEvent('onboarding_trial_started');
        }}
      />
    );
  }

  // Show progressive profile setup
  if (showProgressiveOnboarding) {
    return (
      <ProgressiveOnboarding
        onComplete={(profileData) => {
          // Update user profile with onboarding data
          const updatedProfile = { ...userProfile, ...profileData };
          setUserProfile(updatedProfile);
          setShowProgressiveOnboarding(false);
          localStorage.setItem('hasSeenOnboarding', 'true');
          localStorage.setItem('onboardingCompletedAt', Date.now().toString());
          trackEvent('onboarding_profile_completed');
        }}
        onSkip={() => {
          setShowProgressiveOnboarding(false);
          localStorage.setItem('hasSeenOnboarding', 'true');
          trackEvent('onboarding_profile_skipped');
        }}
      />
    );
  }

  return (
    <div 
      className={`min-h-screen bg-bg-default text-text-default flex flex-col theme-${currentTheme}`}
      onTouchStart={mobile.swipeHandlers.onTouchStart}
      onTouchMove={mobile.swipeHandlers.onTouchMove}
      onTouchEnd={mobile.swipeHandlers.onTouchEnd}
    >
      <DemoBanner />
      <header className="bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 dark:from-teal-700 dark:via-cyan-700 dark:to-sky-700 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto max-w-7xl px-4 py-5 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              <i className="fas fa-leaf mr-3 text-3xl opacity-90"></i>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">DietWise</h1>
                <p className="text-xs sm:text-sm opacity-90 mt-0.5">
                  {userProfile.name ? `Welcome back, ${getFirstName()}!` : 'Your Personal Nutrition Companion'}
                  {calculatedMetrics.targetCalories && ` • ${calculatedMetrics.targetCalories} cal/day`}
                </p>
              </div>
              <OfflineIndicator
                isOnline={isOnline}
                variant="badge"
                size="sm"
                pendingCount={offlineFoodQueue.length}
                className="ml-3"
              />
            </div>
          </div>
          {showDashboardToggle && (
            <button
              onClick={toggleDashboardVisibility}
              className="p-1.5 rounded-full hover:bg-white/20 focus:outline-none focus:ring-1 focus:ring-white/50 transition-colors ml-4"
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

      {/* Enhanced Offline Banner */}
      {showOfflineBanner && (
        <OfflineBanner
          isOnline={isOnline}
          pendingCount={offlineFoodQueue.length}
          lastSyncTime={lastSyncTime}
          onSync={syncOfflineFoodLog}
          onDismiss={() => setShowOfflineBanner(false)}
          onRetryConnection={retryConnection}
          position="top"
          showFeatureList={true}
          autoHide={isOnline}
          autoHideDelay={8000}
        />
      )}

      <main className="container mx-auto max-w-5xl p-4 md:p-6 flex-grow w-full">
        {mobile?.isMobile ? (
          <PullToRefresh onRefresh={handleRefresh}>
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
          </PullToRefresh>
        ) : (
          <>
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
              />
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
          </>
        )}
      </main>

      {/* Onboarding Checklist for new users */}
      {showOnboardingChecklist && (
        <OnboardingChecklist
          userProfile={userProfile}
          foodLogCount={foodLog.length}
          hasCustomFoods={myFoods.length > 0}
          onNavigate={(tab) => {
            const tabMap: Record<string, Tab> = {
              'Profile': Tab.Profile,
              'Log Food': Tab.Log,
              'Food Library': Tab.FoodLibrary,
              'Meal Ideas': Tab.Meals,
            };
            if (tabMap[tab]) {
              handleTabChange(tabMap[tab]);
            }
          }}
          onDismiss={() => setShowOnboardingChecklist(false)}
        />
      )}

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

{/* Temporarily commented out to fix React hooks error */}
      {/*<Suspense fallback={<LoadingSpinner message="Loading Review Modal..." />}>
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
      </Suspense>*/}

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
            customerEmail={user?.email || userProfile.email || undefined}
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

      <EmailCaptureModal
        isOpen={isEmailCaptureModalOpen}
        onClose={() => {
          setIsEmailCaptureModalOpen(false);
          localStorage.setItem('hasSkippedEmailCapture', 'true');
        }}
        onEmailSubmit={handleEmailSubmit}
        userName={userProfile.name}
      />

      <MobileInstallPrompt
        isVisible={mobile.showIOSInstallPrompt || !!mobile.deferredPrompt}
        isIOS={mobile.isIOS}
        onDismiss={() => {
          // This will be handled by the component itself
        }}
        onInstall={mobile.showInstallPrompt}
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
