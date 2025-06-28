import { useState, useEffect } from 'react';

export const useDebugPanel = () => {
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [isLogViewerOpen, setIsLogViewerOpen] = useState(false);

  useEffect(() => {
    // Enable debug mode in development or with special key combination
    const isDev = import.meta.env.DEV;
    const isDebugEnabled = localStorage.getItem('dietwise_debug') === 'true';
    
    setIsDebugMode(isDev || isDebugEnabled);

    // Keyboard shortcut: Ctrl+Shift+D to toggle debug panel
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        toggleDebugMode();
      }
      
      // Ctrl+Shift+L to open log viewer (when debug mode is on)
      if (event.ctrlKey && event.shiftKey && event.key === 'L' && isDebugMode) {
        event.preventDefault();
        setIsLogViewerOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDebugMode]);

  const toggleDebugMode = () => {
    const newMode = !isDebugMode;
    setIsDebugMode(newMode);
    localStorage.setItem('dietwise_debug', newMode.toString());
  };

  const openLogViewer = () => setIsLogViewerOpen(true);
  const closeLogViewer = () => setIsLogViewerOpen(false);

  return {
    isDebugMode,
    isLogViewerOpen,
    toggleDebugMode,
    openLogViewer,
    closeLogViewer,
  };
};