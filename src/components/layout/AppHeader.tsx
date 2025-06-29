import React from 'react';
import DietWiseLogo from '../DietWiseLogo';

interface AppHeaderProps {
  userName?: string | null;
  targetCalories?: number | null;
  isOnline?: boolean;
  showDashboardToggle: boolean;
  isDashboardVisible: boolean;
  onToggleDashboard: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  userName,
  targetCalories,
  isOnline = true,
  showDashboardToggle,
  isDashboardVisible,
  onToggleDashboard,
}) => {
  // Get first name from full name
  const getFirstName = () => {
    if (!userName) return '';
    return userName.split(' ')[0];
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-lg">
      <div className="container mx-auto max-w-7xl px-4 py-5 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-800">DietWise</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                {userName ? `Welcome back, ${getFirstName()}!` : 'Your Personal Nutrition Companion'}
                {targetCalories && ` • ${targetCalories} cal/day`}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isOnline && (
            <span className="text-xs font-normal bg-orange-500 text-white px-2 py-0.5 rounded-full animate-pulse">
              Offline Mode
            </span>
          )}
          {showDashboardToggle && (
            <button
              onClick={onToggleDashboard}
              className="p-1.5 rounded-full hover:bg-white/20 focus:outline-none focus:ring-1 focus:ring-white/50 transition-colors"
              aria-label={isDashboardVisible ? "Hide status dashboard" : "Show status dashboard"}
              title={isDashboardVisible ? "Hide status dashboard" : "Show status dashboard"}
            >
              <i className={`fas ${isDashboardVisible ? 'fa-eye-slash' : 'fa-eye'} text-lg sm:text-xl fa-fw`}></i>
            </button>
          )}
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-lg border border-gray-200">
            <DietWiseLogo size="small" />
          </div>
        </div>
      </div>
    </header>
  );
};