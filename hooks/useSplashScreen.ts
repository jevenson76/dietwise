import { useState, useEffect } from 'react';

interface SplashScreenConfig {
  duration?: number;
  skipOnDev?: boolean;
}

export const useSplashScreen = (config: SplashScreenConfig = {}) => {
  const { duration = 4000, skipOnDev = false } = config;
  const [showSplash, setShowSplash] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Skip splash screen in development if configured
    if (skipOnDev && import.meta.env.DEV) {
      setShowSplash(false);
      setIsAppReady(true);
      return;
    }

    // Show splash screen for all platforms (web and mobile)
    setShowSplash(true);

    // Simulate app initialization
    const initTimer = setTimeout(() => {
      setIsAppReady(true);
    }, duration);

    return () => clearTimeout(initTimer);
  }, [skipOnDev, duration]);

  const hideSplash = () => {
    setShowSplash(false);
  };

  return {
    showSplash: showSplash && !isAppReady,
    isAppReady,
    hideSplash,
  };
};