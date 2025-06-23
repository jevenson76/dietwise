import { useState, useEffect } from 'react';
import { stripeApi } from '../src/services/api/stripe';

interface PremiumStatus {
  isPremium: boolean;
  isLoading: boolean;
  plan: 'monthly' | 'yearly' | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

export const usePremiumStatus = () => {
  const [status, setStatus] = useState<PremiumStatus>({
    isPremium: false,
    isLoading: true,
    plan: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
  });

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const response = await stripeApi.getSubscriptionStatus();
      const { subscription } = response;

      setStatus({
        isPremium: subscription.active,
        isLoading: false,
        plan: subscription.plan,
        currentPeriodEnd: subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      });

      // Also update localStorage for offline access
      localStorage.setItem('premiumStatus', JSON.stringify({
        isPremium: subscription.active,
        plan: subscription.plan,
        lastChecked: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error checking premium status:', error);

      // Fall back to localStorage if API fails
      const cached = localStorage.getItem('premiumStatus');
      if (cached) {
        const parsed = JSON.parse(cached);
        setStatus({
          isPremium: parsed.isPremium || false,
          isLoading: false,
          plan: parsed.plan || null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        });
      } else {
        setStatus(prev => ({ ...prev, isLoading: false }));
      }
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { url } = await stripeApi.createPortalSession();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
    }
  };

  return {
    ...status,
    checkPremiumStatus,
    openCustomerPortal,
  };
};