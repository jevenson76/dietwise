import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { UserProfile, FoodItem, WeightEntry, ReminderSettings, SevenDayPlanResponse, SharePayload, AppTheme, MyFoodItem, MyMeal, MealReminder, StreakData, Milestone, MilestoneType } from '@appTypes'; 
import { DEFAULT_REMINDER_SETTINGS, DEFAULT_STREAK_DATA, STREAK_MILESTONES_DAYS, TOTAL_LOGGED_MEALS_MILESTONES } from '@constants';
import { trackEvent } from '@services/analyticsService'; 
import { API_KEY_ERROR_MESSAGE } from '@services/geminiService';

// Components
import UserProfileForm from '@components/UserProfileForm';
import CalculationsDisplay from '@components/CalculationsDisplay';
import WeightGoalSetter from '@components/WeightGoalSetter';
import MealIdeaSuggestion from '@components/MealIdeaSuggestion';
import UPCScannerComponent from '@components/UPCScannerComponent';
import FoodLog from '@components/FoodLog';
import Alert from '@components/common/Alert';
import Modal from '@components/common/Modal';
import MealPlannerComponent from '@components/MealPlannerComponent';
import { ProgressTabComponent } from '@components/ProgressTabComponent';
import UserStatusDashboard from '@components/UserStatusDashboard';
import MyLibraryComponent from '@components/MyLibraryComponent'; 
import ReviewPromptModal from '@components/ReviewPromptModal';
import { ReviewManagementSystem } from './aso/reviewManagement'; 
import StripeCheckout from '@components/StripeCheckout';
import AdvancedAnalytics from '@components/AdvancedAnalytics';
import PDFExportButton from '@components/PDFExportButton';
import CustomMacroTargets from '@components/CustomMacroTargets';
import UpgradePrompt from '@components/UpgradePrompt';
import AuthModal from '@components/auth/AuthModal';
import DietWiseSplashScreen from '@components/SplashScreen';

// Layout Components
import { AppHeader } from '@components/layout/AppHeader';
import { AppFooter } from '@components/layout/AppFooter';
import { TabNavigation, Tab } from '@components/navigation/TabNavigation';

// Hooks
import { useUserProfile } from '@hooks/useUserProfile';
import { useFoodLog } from '@hooks/useFoodLog';
import { useWeightTracking } from '@hooks/useWeightTracking';
import { useModals } from '@hooks/useModals';
import { useSplashScreen } from '@hooks/useSplashScreen';
import { usePremiumLimits } from '@hooks/usePremiumLimits';
import { usePremiumStatus } from '@hooks/usePremiumStatus';
import { useAuth } from '@hooks/useAuth';

// Utils
import { filterByHistoricalLimit, getHistoricalLimitMessage } from '@utils/dataLimits';
import { differenceInCalendarDays, format, addDays, isPast, isToday, differenceInMinutes, startOfDay, parseISO } from 'date-fns';
import { PREMIUM_FEATURES, PREMIUM_MESSAGES } from './constants/premiumFeatures';

import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

Chart.defaults.locale = 'en-US';

interface GlobalSuccessPayload {
  message: string;
  shareData?: SharePayload;
}

const App: React.FC = () => {
  // Splash screen
  const { showSplash, hideSplash } = useSplashScreen();

  // Global success message state
  const [globalSuccessMessage, setGlobalSuccessMessage] = useState<GlobalSuccessPayload | null>(null);
  const [hasShownSetupCompleteMessage, setHasShownSetupCompleteMessage] = useState<boolean>(() => {
    return localStorage.getItem('hasShownSetupCompleteMessage') === 'true';
  });

  // Milestones state
  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    const saved = localStorage.getItem('milestones');
    return saved ? JSON.parse(saved) : [];
  });

  // Milestone callback
  const addMilestone = useCallback((type: MilestoneType, description: string, value?: number | string) => {
    setMilestones(prev => {
      const todayStr = new Date().toISOString().split('T')[0];
      const existingTodayWithValue = prev.find(m => m.type === type && m.value === value && m.dateAchieved.startsWith(todayStr));
      if (existingTodayWithValue) return prev;

      const existingToday = prev.find(m => m.type === type && m.dateAchieved.startsWith(todayStr));
      if (existingToday && !value) return prev;

      const newMilestone: Milestone = {
        id: crypto.randomUUID(),
        type,
        description,
        dateAchieved: new Date().toISOString(),
        value,
      };

      trackEvent('milestone_achieved', {
        type,
        description,
        value,
      });

      return [...prev, newMilestone];
    });
  }, []);

  // Display global success message
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

  // User profile hook
  const {
    userProfile,
    calculatedMetrics,
    isInitialSetup,
    handleProfileChange,
    handleTargetWeightChange,
    handleTargetDateChange,
    handleUpdateMacroTargets,
  } = useUserProfile({ addMilestone });

  // Food log hook
  const {
    foodLog,
    offlineFoodQueue,
    isOnline,
    handleAddFood,
    handleRemoveFood,
  } = useFoodLog();

  // Weight tracking hook
  const {
    actualWeightLog,
    handleAddWeightEntry,
  } = useWeightTracking({ userProfile, addMilestone, displayGlobalSuccessMessage });

  // Modals hook
  const {
    isUpgradeModalOpen,
    isAuthModalOpen,
    authModalMode,
    isReviewPromptModalOpen,
    isLogFromMyMealModalOpen,
    isUPCScannerModalOpen,
    openUpgradeModal,
    closeUpgradeModal,
    openAuthModal,
    closeAuthModal,
    openReviewPromptModal,
    closeReviewPromptModal,
    openLogFromMyMealModal,
    closeLogFromMyMealModal,
    openUPCScannerModal,
    closeUPCScannerModal,
  } = useModals();

  // Other state
  const [activeTab, setActiveTab] = useState<Tab>(isInitialSetup ? Tab.Profile : Tab.Log);
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'ok' | 'missing'>('checking');
  const [isDashboardVisible, setIsDashboardVisible] = useState<boolean>(true);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(() => {
    const savedSettings = localStorage.getItem('reminderSettings');
    if (savedSettings) {
      try { return { ...DEFAULT_REMINDER_SETTINGS, ...JSON.parse(savedSettings) }; }
      catch(e) { }
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
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => {
    return (localStorage.getItem('appTheme') as AppTheme) || 'light';
  });

  // Auth and premium hooks
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const { isPremium: isPremiumUser, isLoading: isPremiumLoading, checkPremiumStatus, openCustomerPortal } = usePremiumStatus();
  const premiumLimits = usePremiumLimits(isPremiumUser);

  // Review management
  const reviewManagerRef = useRef(new ReviewManagementSystem());

  // Apply historical data limits for free users
  const filteredFoodLog = useMemo(() => {
    return filterByHistoricalLimit(foodLog, isPremiumUser);
  }, [foodLog, isPremiumUser]);

  const filteredWeightLog = useMemo(() => {
    return filterByHistoricalLimit(actualWeightLog, isPremiumUser);
  }, [actualWeightLog, isPremiumUser]);

  // Effects
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

  useEffect(() => { localStorage.setItem('reminderSettings', JSON.stringify(reminderSettings)); }, [reminderSettings]);
  useEffect(() => { localStorage.setItem('hasShownSetupCompleteMessage', String(hasShownSetupCompleteMessage)); }, [hasShownSetupCompleteMessage]);
  useEffect(() => { localStorage.setItem('myFoods', JSON.stringify(myFoods)); }, [myFoods]);
  useEffect(() => { localStorage.setItem('myMeals', JSON.stringify(myMeals)); }, [myMeals]);
  useEffect(() => { localStorage.setItem('streakData', JSON.stringify(streakData)); }, [streakData]);
  useEffect(() => { localStorage.setItem('milestones', JSON.stringify(milestones)); }, [milestones]);

  // Check if we need to refresh premium status after successful checkout
  useEffect(() => {
    const shouldRefresh = localStorage.getItem('refreshPremiumStatus');
    if (shouldRefresh === 'true') {
      localStorage.removeItem('refreshPremiumStatus');
      checkPremiumStatus();
    }
  }, [checkPremiumStatus]);

  // Show splash screen if needed
  if (showSplash) {
    return <DietWiseSplashScreen onComplete={hideSplash} />;
  }

  // Component calculations and derived state
  const isProfileSufficientForDashboard = userProfile.age && userProfile.sex && userProfile.height && userProfile.weight;
  const showDashboardToggle = isProfileSufficientForDashboard && !isInitialSetup;

  const tabOrder = isInitialSetup 
    ? [Tab.Profile] 
    : [Tab.Log, Tab.FoodLibrary, Tab.Meals, Tab.Planner, Tab.Progress, Tab.Analytics, Tab.Profile];

  // Tab change handler
  const handleTabChange = (tab: Tab) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  };

  // Toggle dashboard visibility
  const toggleDashboardVisibility = () => {
    const newVisibility = !isDashboardVisible;
    setIsDashboardVisible(newVisibility);
    trackEvent('dashboard_toggled', { visible: newVisibility });
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case Tab.Log:
        return (
          <>
            {/* Content for Log tab */}
          </>
        );
      case Tab.FoodLibrary:
        return (
          <MyLibraryComponent
            myFoods={myFoods}
            myMeals={myMeals}
            onAddFood={(food) => setMyFoods([...myFoods, food])}
            onUpdateFood={(id, updates) => {
              setMyFoods(myFoods.map(f => f.id === id ? { ...f, ...updates } : f));
            }}
            onDeleteFood={(id) => setMyFoods(myFoods.filter(f => f.id !== id))}
            onAddMeal={(meal) => setMyMeals([...myMeals, meal])}
            onUpdateMeal={(id, updates) => {
              setMyMeals(myMeals.map(m => m.id === id ? { ...m, ...updates } : m));
            }}
            onDeleteMeal={(id) => setMyMeals(myMeals.filter(m => m.id !== id))}
            onAddToLog={handleAddFood}
            isPremiumUser={isPremiumUser}
            premiumLimits={premiumLimits}
            onUpgradeClick={openUpgradeModal}
          />
        );
      // Add other cases...
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-bg-default text-text-default flex flex-col theme-${currentTheme}`}>
      <AppHeader
        isOnline={isOnline}
        showDashboardToggle={showDashboardToggle}
        isDashboardVisible={isDashboardVisible}
        onToggleDashboard={toggleDashboardVisibility}
      />

      <TabNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isPremiumUser={isPremiumUser}
        tabOrder={tabOrder}
      />

      <main className="container mx-auto max-w-5xl p-4 md:p-6 flex-grow w-full">
        {renderTabContent()}
      </main>

      <AppFooter />

      {/* Modals */}
      {isUpgradeModalOpen && (
        <UpgradePrompt
          isOpen={isUpgradeModalOpen}
          onClose={closeUpgradeModal}
          onUpgrade={() => {
            closeUpgradeModal();
            // Handle upgrade
          }}
          feature={PREMIUM_FEATURES.UNLIMITED_FOODS}
          message={PREMIUM_MESSAGES.GENERIC_UPGRADE}
        />
      )}

      {/* Global success message */}
      {globalSuccessMessage && (
        <Alert
          type="success"
          message={globalSuccessMessage.message}
          dismissible
          shareData={globalSuccessMessage.shareData}
        />
      )}
    </div>
  );
};

export default App;