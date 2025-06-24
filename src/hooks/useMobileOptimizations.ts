import { useState, useEffect, useCallback, useRef } from 'react';

interface TouchSwipeData {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  threshold: number;
}

interface MobileOptimizations {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isPWA: boolean;
  supportsHaptics: boolean;
  orientation: 'portrait' | 'landscape';
  swipeHandlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
  vibrate: (pattern?: number | number[]) => void;
  showIOSInstallPrompt: boolean;
  deferredPrompt: any;
  showInstallPrompt: () => void;
}

export const useMobileOptimizations = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  swipeThreshold: number = 50
): MobileOptimizations => {
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [showIOSInstallPrompt, setShowIOSInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const touchData = useRef<TouchSwipeData>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    threshold: swipeThreshold
  });

  // Detect device and platform
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const mobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const ios = /iPad|iPhone|iPod/.test(userAgent);
    const android = /Android/.test(userAgent);
    const pwa = window.matchMedia('(display-mode: standalone)').matches || 
                 (window.navigator as any).standalone === true;

    setIsMobile(mobile);
    setIsIOS(ios);
    setIsAndroid(android);
    setIsPWA(pwa);

    // Show iOS install prompt if not PWA and is iOS
    if (ios && !pwa && !localStorage.getItem('ios-install-dismissed')) {
      setShowIOSInstallPrompt(true);
    }
  }, []);

  // Detect orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    handleOrientationChange();
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Listen for PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Haptic feedback function
  const vibrate = useCallback((pattern: number | number[] = 50) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  // Touch handlers for swipe gestures
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchData.current.startX = touch.clientX;
    touchData.current.startY = touch.clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 1) return; // Ignore multi-touch
    
    const touch = e.touches[0];
    touchData.current.currentX = touch.clientX;
    touchData.current.currentY = touch.clientY;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const { startX, startY, currentX, currentY, threshold } = touchData.current;
    
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Only trigger if horizontal swipe is more significant than vertical
    if (absDeltaX > absDeltaY && absDeltaX > threshold) {
      vibrate(25); // Quick haptic feedback
      
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
  }, [onSwipeLeft, onSwipeRight, vibrate]);

  const showInstallPrompt = useCallback(() => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {

        }
        setDeferredPrompt(null);
      });
    }
  }, [deferredPrompt]);

  const supportsHaptics = 'vibrate' in navigator;

  return {
    isMobile,
    isIOS,
    isAndroid,
    isPWA,
    supportsHaptics,
    orientation,
    swipeHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    },
    vibrate,
    showIOSInstallPrompt,
    deferredPrompt,
    showInstallPrompt
  };
};