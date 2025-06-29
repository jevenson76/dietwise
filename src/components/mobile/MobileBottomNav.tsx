import React from 'react';

// Define Tab enum locally to match App.tsx
enum Tab {
  Log = 'Log Food', 
  FoodLibrary = 'Food Library',
  Meals = 'Meal Ideas',
  Planner = '7-Day Plan',
  WeighIn = 'Weigh In',
  Progress = 'Progress',
  Analytics = 'Analytics',
  Profile = 'Profile',
  Settings = 'Settings',
}

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isPremium: boolean;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onTabChange, isPremium }) => {
  // Show only the most important tabs for mobile navigation
  const mobileTabs = [
    { id: Tab.Log, label: 'Log', icon: 'fa-apple-alt' },
    { id: Tab.FoodLibrary, label: 'Library', icon: 'fa-book-bookmark' },
    { id: Tab.Progress, label: 'Progress', icon: 'fa-chart-line' },
    { id: Tab.Profile, label: 'Profile', icon: 'fa-user-cog' },
    { id: Tab.Settings, label: 'More', icon: 'fa-ellipsis-h' },
  ];

  const getTabIcon = (tabId: string) => {
    const tab = mobileTabs.find(t => t.id === tabId);
    return tab ? tab.icon : 'fa-question';
  };

  const getTabLabel = (tabId: string) => {
    const tab = mobileTabs.find(t => t.id === tabId);
    if (tab) {
      return tab.label;
    }
    // For the "More" tab, show the actual tab name if it's not one of the main mobile tabs
    if (activeTab === tabId && !mobileTabs.find(t => t.id === tabId)) {
      return tabId.split(' ')[0]; // Show first word of tab name
    }
    return 'More';
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        {mobileTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isLocked = !isPremium && (tab.id === Tab.Planner || tab.id === Tab.Analytics);
          
          return (
            <button
              key={tab.id}
              onClick={() => !isLocked && onTabChange(tab.id)}
              className={`
                flex flex-col items-center justify-center flex-1 h-full
                ${isActive 
                  ? 'text-teal-600 dark:text-teal-400' 
                  : 'text-gray-500 dark:text-gray-400'
                }
                ${isLocked ? 'opacity-50 cursor-not-allowed' : 'active:bg-gray-100 dark:active:bg-gray-800'}
                transition-colors duration-200
              `}
              disabled={isLocked}
            >
              <i className={`fas ${tab.icon} text-xl mb-1`}></i>
              <span className="text-xs font-medium">{tab.label}</span>
              {isLocked && <i className="fas fa-lock text-xs absolute top-2 right-2"></i>}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;