import React from 'react';
import DietWiseLogo from '../DietWiseLogo';

interface AppHeaderProps {
  isOnline: boolean;
  showDashboardToggle: boolean;
  isDashboardVisible: boolean;
  onToggleDashboard: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  isOnline,
  showDashboardToggle,
  isDashboardVisible,
  onToggleDashboard,
}) => {
  return (
    <header className="bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 dark:from-teal-700 dark:via-cyan-700 dark:to-sky-700 text-white shadow-lg">
      <div className="container mx-auto max-w-7xl px-4 py-5 flex items-center justify-between">
        <div className="flex items-center">
          <DietWiseLogo size="small" className="mr-3 flex-shrink-0" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">DietWise</h1>
          {!isOnline && (
            <span className="ml-3 text-xs font-normal bg-orange-500 text-white px-2 py-0.5 rounded-full animate-pulse">
              Offline Mode
            </span>
          )}
        </div>
      </div>
    </header>
  );
};