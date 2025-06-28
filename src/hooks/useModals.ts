import { useState, useCallback } from 'react';

export const useModals = () => {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isReviewPromptModalOpen, setIsReviewPromptModalOpen] = useState<boolean>(false);
  const [isLogFromMyMealModalOpen, setIsLogFromMyMealModalOpen] = useState<boolean>(false);
  const [isUPCScannerModalOpen, setIsUPCScannerModalOpen] = useState<boolean>(false);

  const openUpgradeModal = useCallback(() => setIsUpgradeModalOpen(true), []);
  const closeUpgradeModal = useCallback(() => setIsUpgradeModalOpen(false), []);

  const openAuthModal = useCallback((mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const openReviewPromptModal = useCallback(() => setIsReviewPromptModalOpen(true), []);
  const closeReviewPromptModal = useCallback(() => setIsReviewPromptModalOpen(false), []);

  const openLogFromMyMealModal = useCallback(() => setIsLogFromMyMealModalOpen(true), []);
  const closeLogFromMyMealModal = useCallback(() => setIsLogFromMyMealModalOpen(false), []);

  const openUPCScannerModal = useCallback(() => setIsUPCScannerModalOpen(true), []);
  const closeUPCScannerModal = useCallback(() => setIsUPCScannerModalOpen(false), []);

  return {
    // Modal states
    isUpgradeModalOpen,
    isAuthModalOpen,
    authModalMode,
    isReviewPromptModalOpen,
    isLogFromMyMealModalOpen,
    isUPCScannerModalOpen,
    
    // Modal actions
    openUpgradeModal,
    closeUpgradeModal,
    openAuthModal,
    closeAuthModal,
    openReviewPromptModal,
    closeReviewPromptModal,
    openLogFromMyMealModal,
    closeLogFromMyMealModal,
    openUPCScannerModal,
    closeUPCScannerModal,
  };
};