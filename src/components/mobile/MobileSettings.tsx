import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { BiometricService } from '../../services/biometricService';
import { NotificationService } from '../../services/notificationService';

interface MobileSettingsProps {
  onClose: () => void;
}

const MobileSettings: React.FC<MobileSettingsProps> = ({ onClose }) => {
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [mealRemindersEnabled, setMealRemindersEnabled] = useState(false);
  const [waterRemindersEnabled, setWaterRemindersEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    checkSettings();
  }, []);

  const checkSettings = async () => {
    if (!Capacitor.isNativePlatform()) return;

    // Check biometric availability
    const bioAvailable = await BiometricService.isAvailable();
    setBiometricAvailable(bioAvailable);
    setBiometricEnabled(BiometricService.isBiometricEnabled());

    // Check notification settings from localStorage
    setMealRemindersEnabled(localStorage.getItem('mealRemindersEnabled') === 'true');
    setWaterRemindersEnabled(localStorage.getItem('waterRemindersEnabled') === 'true');
  };

  const handleBiometricToggle = async () => {
    setLoading(true);
    setMessage(null);

    try {
      if (!biometricEnabled) {
        const result = await BiometricService.enableBiometric();
        if (result.success) {
          setBiometricEnabled(true);
          setMessage({ type: 'success', text: 'Biometric authentication enabled' });
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to enable biometric' });
        }
      } else {
        await BiometricService.disableBiometric();
        setBiometricEnabled(false);
        setMessage({ type: 'success', text: 'Biometric authentication disabled' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleMealRemindersToggle = async () => {
    setLoading(true);
    setMessage(null);

    try {
      if (!mealRemindersEnabled) {
        await NotificationService.initialize();
        await NotificationService.scheduleMealReminders();
        localStorage.setItem('mealRemindersEnabled', 'true');
        setMealRemindersEnabled(true);
        setMessage({ type: 'success', text: 'Meal reminders enabled' });
      } else {
        await NotificationService.cancelMealReminders();
        localStorage.setItem('mealRemindersEnabled', 'false');
        setMealRemindersEnabled(false);
        setMessage({ type: 'success', text: 'Meal reminders disabled' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update meal reminders' });
    } finally {
      setLoading(false);
    }
  };

  const handleWaterRemindersToggle = async () => {
    setLoading(true);
    setMessage(null);

    try {
      if (!waterRemindersEnabled) {
        await NotificationService.initialize();
        await NotificationService.scheduleWaterReminders();
        localStorage.setItem('waterRemindersEnabled', 'true');
        setWaterRemindersEnabled(true);
        setMessage({ type: 'success', text: 'Water reminders enabled' });
      } else {
        // Cancel water reminders (would need to implement in NotificationService)
        localStorage.setItem('waterRemindersEnabled', 'false');
        setWaterRemindersEnabled(false);
        setMessage({ type: 'success', text: 'Water reminders disabled' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update water reminders' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Mobile Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <i className="fas fa-times text-gray-500"></i>
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}>
            <p className="text-sm">
              <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
              {message.text}
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* Biometric Authentication */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Security
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Biometric Authentication
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Use Face ID or Touch ID to unlock the app
                  </p>
                </div>
                <button
                  onClick={handleBiometricToggle}
                  disabled={!biometricAvailable || loading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    biometricEnabled 
                      ? 'bg-primary-600' 
                      : 'bg-gray-200 dark:bg-gray-600'
                  } ${(!biometricAvailable || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      biometricEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {!biometricAvailable && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Biometric authentication is not available on this device
                </p>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Notifications
            </h3>
            <div className="space-y-3">
              {/* Meal Reminders */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      Meal Reminders
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Get notified for breakfast, lunch, and dinner
                    </p>
                  </div>
                  <button
                    onClick={handleMealRemindersToggle}
                    disabled={loading}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      mealRemindersEnabled 
                        ? 'bg-primary-600' 
                        : 'bg-gray-200 dark:bg-gray-600'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        mealRemindersEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Water Reminders */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      Water Reminders
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Stay hydrated with regular reminders
                    </p>
                  </div>
                  <button
                    onClick={handleWaterRemindersToggle}
                    disabled={loading}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      waterRemindersEnabled 
                        ? 'bg-primary-600' 
                        : 'bg-gray-200 dark:bg-gray-600'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        waterRemindersEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <i className="fas fa-info-circle mr-2"></i>
              These features are only available in the mobile app and require appropriate permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSettings;