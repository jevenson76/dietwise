import React from 'react';
import { trackEvent } from '@services/analyticsService';

export enum Tab {
  Log = 'Log Food',
  FoodLibrary = 'Food Library',
  Meals = 'Meal Ideas',
  Planner = '7-Day Plan',
  Progress = 'Progress',
  Analytics = 'Analytics',
  Profile = 'Profile',
}

interface TabNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  isPremiumUser: boolean;
  tabOrder: Tab[];
}

const getTabIcon = (tab: Tab): string => {
  switch (tab) {
    case Tab.Log: return 'fa-book';
    case Tab.FoodLibrary: return 'fa-database';
    case Tab.Meals: return 'fa-utensils';
    case Tab.Planner: return 'fa-calendar-week';
    case Tab.Progress: return 'fa-chart-line';
    case Tab.Analytics: return 'fa-chart-pie';
    case Tab.Profile: return 'fa-user-cog';
    default: return 'fa-question';
  }
};

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  isPremiumUser,
  tabOrder,
}) => {
  const handleTabChange = (tab: Tab) => {
    if (tab !== activeTab) {
      trackEvent('tab_changed', { from: activeTab, to: tab });
      onTabChange(tab);
    }
  };

  return (
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
            {(tab === Tab.Planner || tab === Tab.Analytics) && !isPremiumUser && (
              <i className="fas fa-star text-yellow-400 text-sm ml-1.5 -mr-0.5 transform group-hover:scale-110 transition-transform duration-150" title="Premium Feature"></i>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};