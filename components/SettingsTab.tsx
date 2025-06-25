import React from 'react';
import { AppTheme } from '../types';
import { useResponsive } from '../hooks/useResponsive';
import OfflineStatus from './common/OfflineStatus';

interface SettingsTabProps {
  theme: AppTheme;
  handleThemeToggle: () => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  appVersion: string;
  exportData: () => void;
  isPremiumUser: boolean;
  onUpgradeClick: () => void;
  pdfExportButton?: React.ReactNode;
  isOnline?: boolean;
  pendingItems?: {
    foodLog?: number;
    weight?: number;
    goals?: number;
    other?: number;
  };
  lastSyncTime?: string;
  onSync?: () => void;
  onRetryConnection?: () => void;
  isSyncing?: boolean;
  syncProgress?: number;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  theme,
  handleThemeToggle,
  notificationsEnabled,
  setNotificationsEnabled,
  appVersion,
  exportData,
  isPremiumUser,
  onUpgradeClick,
  pdfExportButton,
  isOnline = true,
  pendingItems,
  lastSyncTime,
  onSync,
  onRetryConnection,
  isSyncing = false,
  syncProgress = 0
}) => {
  const { isMobile, isTablet } = useResponsive();
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Appearance Settings */}
      <div className={`bg-bg-card rounded-xl shadow-xl ${isMobile ? 'p-4' : isTablet ? 'p-6' : 'p-8'}`}>
        <h2 className={`${isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'} font-semibold text-text-default mb-6 border-b border-border-default pb-4`}>
          <i className="fas fa-palette mr-2.5 text-purple-600"></i>Appearance
        </h2>
        <div className={`flex items-center justify-between ${isMobile ? 'py-3' : 'py-4'}`}>
          <div className="flex items-center">
            <i className={`fas ${theme === 'dark' ? 'fa-moon' : 'fa-sun'} mr-3 ${isMobile ? 'text-base' : 'text-lg'} text-text-alt`}></i>
            <span className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-text-default`}>Theme</span>
          </div>
          <button
            onClick={handleThemeToggle}
            className={`relative inline-flex items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-bg-default ${isMobile ? 'h-8 w-14' : 'h-6 w-11'}`}
            role="switch"
            aria-checked={theme === 'dark'}
            aria-label="Toggle dark mode"
          >
            <span
              className={`inline-block transform rounded-full bg-white transition-transform duration-200 ${
                isMobile 
                  ? `h-6 w-6 ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`
                  : `h-4 w-4 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`
              }`}
            />
          </button>
        </div>
      </div>

      {/* Notifications Settings */}
      <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl">
        <h2 className="text-xl sm:text-2xl font-semibold text-text-default mb-6 border-b border-border-default pb-4">
          <i className="fas fa-bell mr-2.5 text-orange-600"></i>Notifications
        </h2>
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <i className="fas fa-bell mr-3 text-lg text-text-alt"></i>
            <span className="text-base font-medium text-text-default">Push Notifications</span>
          </div>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-bg-default"
            role="switch"
            aria-checked={notificationsEnabled}
            aria-label="Toggle notifications"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <p className="text-sm text-text-alt mt-2">
          Get reminders for meal logging and weigh-ins
        </p>
      </div>

      {/* Offline Status */}
      <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl">
        <h2 className="text-xl sm:text-2xl font-semibold text-text-default mb-6 border-b border-border-default pb-4">
          <i className="fas fa-wifi mr-2.5 text-blue-600"></i>Connection & Sync
        </h2>
        <OfflineStatus
          isOnline={isOnline}
          pendingItems={pendingItems}
          lastSyncTime={lastSyncTime}
          onSync={onSync}
          onRetry={onRetryConnection}
          isSyncing={isSyncing}
          syncProgress={syncProgress}
          compact={false}
        />
      </div>

      {/* Data Export */}
      <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl">
        <h2 className="text-xl sm:text-2xl font-semibold text-text-default mb-6 border-b border-border-default pb-4">
          <i className="fas fa-download mr-2.5 text-green-600"></i>Export Data
        </h2>
        <p className="text-text-alt mb-6 text-base">
          Download your complete diet tracking data as a PDF report
        </p>
        {pdfExportButton ? (
          <div data-pdf-export>{pdfExportButton}</div>
        ) : (
          <button
            onClick={isPremiumUser ? exportData : onUpgradeClick}
            className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-150 flex items-center justify-center"
          >
            <i className="fas fa-file-pdf mr-2"></i>
            Export as PDF
            {!isPremiumUser && (
              <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-bold">
                Premium
              </span>
            )}
          </button>
        )}
      </div>

      {/* Legal & About */}
      <div className="bg-bg-card p-6 sm:p-8 rounded-xl shadow-xl">
        <h2 className="text-xl sm:text-2xl font-semibold text-text-default mb-6 border-b border-border-default pb-4">
          <i className="fas fa-info-circle mr-2.5 text-sky-600"></i>Legal & About
        </h2>
        <div className="space-y-4">
          <a
            href="#privacy-policy"
            className="flex items-center justify-between py-3 border-b border-border-default hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded px-2"
          >
            <span className="text-base text-text-default">Privacy Policy</span>
            <i className="fas fa-chevron-right text-text-alt"></i>
          </a>
          <a
            href="#terms-of-service"
            className="flex items-center justify-between py-3 border-b border-border-default hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded px-2"
          >
            <span className="text-base text-text-default">Terms of Service</span>
            <i className="fas fa-chevron-right text-text-alt"></i>
          </a>
          <div className="pt-4">
            <p className="text-sm text-text-alt">
              DietWise Version {appVersion}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;