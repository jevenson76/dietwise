import React, { useState } from 'react';
import { exportFoodLogToPDF } from '../src/services/pdfExportService';
import { FoodItem, UserProfile, WeightEntry } from '@appTypes';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import { trackEvent } from '@services/analyticsService';

interface PDFExportButtonProps {
  foodLog: FoodItem[];
  userProfile: UserProfile;
  weightLog?: WeightEntry[];
  isPremiumUser: boolean;
  onUpgradeClick: () => void;
  premiumLimits: {
    canExportData: () => boolean;
    onExport: () => void;
  };
}

const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  foodLog,
  userProfile,
  weightLog,
  isPremiumUser,
  onUpgradeClick,
  premiumLimits
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    dateRange: '7days' as '7days' | '30days' | 'all',
    includeWeightHistory: true,
    includeMacroBreakdown: true
  });

  const handleExport = async () => {
    if (!isPremiumUser) {
      onUpgradeClick();
      trackEvent('pdf_export_upgrade_prompt');
      return;
    }

    if (!premiumLimits.canExportData()) {
      onUpgradeClick();
      trackEvent('pdf_export_limit_reached');
      return;
    }

    setIsExporting(true);
    trackEvent('pdf_export_started', exportOptions);

    try {
      let dateRange;
      const today = endOfDay(new Date());

      switch (exportOptions.dateRange) {
        case '7days':
          dateRange = {
            start: startOfDay(subDays(today, 7)),
            end: today
          };
          break;
        case '30days':
          dateRange = {
            start: startOfDay(subDays(today, 30)),
            end: today
          };
          break;
        case 'all':
          dateRange = undefined;
          break;
      }

      const pdf = exportFoodLogToPDF(foodLog, userProfile, weightLog, {
        dateRange,
        includeWeightHistory: exportOptions.includeWeightHistory,
        includeMacroBreakdown: exportOptions.includeMacroBreakdown
      });

      const filename = `dietwise-report-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

      premiumLimits.onExport();
      trackEvent('pdf_export_completed', { filename, ...exportOptions });
      setShowOptions(false);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
      if (process.env.NODE_ENV !== 'production') {
      console.error('PDF export failed:', error);
      }
      }
      trackEvent('pdf_export_failed', { error: (error as Error).message });
    } finally {
      setIsExporting(false);
    }
  };

  if (!isPremiumUser) {
    return (
      <button
        onClick={onUpgradeClick}
        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
      >
        <i className="fas fa-file-pdf mr-2"></i>
        <span>Export PDF</span>
        <i className="fas fa-crown ml-2 text-yellow-300"></i>
      </button>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isExporting}
        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:cursor-not-allowed"
      >
        <i className="fas fa-file-pdf mr-2"></i>
        <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
      </button>

      {showOptions && !isExporting && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-text-default mb-4">PDF Export Options</h3>

            {/* Date Range */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-alt mb-2">Date Range</label>
              <select
                value={exportOptions.dateRange}
                onChange={(e) => setExportOptions({ ...exportOptions, dateRange: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-text-default focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>

            {/* Include Options */}
            <div className="space-y-2 mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeWeightHistory}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeWeightHistory: e.target.checked })}
                  className="mr-2 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <span className="text-sm text-text-default">Include Weight History</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeMacroBreakdown}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeMacroBreakdown: e.target.checked })}
                  className="mr-2 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <span className="text-sm text-text-default">Include Macro Breakdown</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-lg shadow hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                <i className="fas fa-download mr-2"></i>
                Export Now
              </button>
              <button
                onClick={() => setShowOptions(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 font-medium py-2 px-4 rounded-lg shadow hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFExportButton;