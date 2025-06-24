import React, { useState } from 'react';

interface MobileHeaderProps {
  title: string;
  isOnline: boolean;
  isPremium: boolean;
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
  notificationCount?: number;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  isOnline,
  isPremium,
  onMenuClick,
  onNotificationClick,
  notificationCount = 0
}) => {
  const [showOfflineTooltip, setShowOfflineTooltip] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-50 md:hidden">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left side - Menu button */}
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg active:bg-gray-100 dark:active:bg-gray-800"
          aria-label="Menu"
        >
          <i className="fas fa-bars text-gray-600 dark:text-gray-400"></i>
        </button>

        {/* Center - Title and status */}
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h1>
          
          {/* Offline indicator */}
          {!isOnline && (
            <div className="relative">
              <button
                onClick={() => setShowOfflineTooltip(!showOfflineTooltip)}
                className="w-2 h-2 bg-red-500 rounded-full animate-pulse"
                aria-label="Offline status"
              />
              {showOfflineTooltip && (
                <div className="absolute top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  You're offline
                </div>
              )}
            </div>
          )}
          
          {/* Premium badge */}
          {isPremium && (
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-xs font-bold px-2 py-0.5 rounded-full text-gray-800">
              PRO
            </span>
          )}
        </div>

        {/* Right side - Notifications */}
        <button
          onClick={onNotificationClick}
          className="p-2 -mr-2 rounded-lg active:bg-gray-100 dark:active:bg-gray-800 relative"
          aria-label="Notifications"
        >
          <i className="fas fa-bell text-gray-600 dark:text-gray-400"></i>
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default MobileHeader;