import React from 'react';
import { Tab } from '../../types';

interface MobileBottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  isPremium: boolean;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onTabChange, isPremium }) => {
  const tabs = [
    { id: Tab.Log, label: 'Log', icon: 'fa-utensils' },
    { id: Tab.Plan, label: 'Plan', icon: 'fa-calendar' },
    { id: Tab.Progress, label: 'Progress', icon: 'fa-chart-line' },
    { id: Tab.Library, label: 'Library', icon: 'fa-book' },
    { id: Tab.Profile, label: 'Profile', icon: 'fa-user' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 bottom-nav z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isLocked = !isPremium && (tab.id === Tab.Analytics || tab.id === Tab.Export);
          
          return (
            <button
              key={tab.id}
              onClick={() => !isLocked && onTabChange(tab.id)}
              className={`
                flex flex-col items-center justify-center flex-1 h-full
                ${isActive 
                  ? 'text-primary-600 dark:text-primary-400' 
                  : 'text-gray-500 dark:text-gray-400'
                }
                ${isLocked ? 'opacity-50 cursor-not-allowed' : 'active:bg-gray-100 dark:active:bg-gray-800'}
                transition-colors duration-200
              `}
              disabled={isLocked}
            >
              <i className={`fas ${tab.icon} text-xl mb-1`}></i>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;