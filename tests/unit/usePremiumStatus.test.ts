import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { stripeApi } from '../../src/services/api/stripe';

// Mock the stripe API
vi.mock('../../src/services/api/stripe', () => ({
  stripeApi: {
    getSubscriptionStatus: vi.fn(),
    createPortalSession: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
});

describe('usePremiumStatus', () => {
  const mockStripeApi = stripeApi as any;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    window.location.href = '';
  });

  describe('Initial State', () => {
    it('should initialize with default loading state', () => {
      const { result } = renderHook(() => usePremiumStatus());

      expect(result.current.isPremium).toBe(false);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.plan).toBeNull();
      expect(result.current.currentPeriodEnd).toBeNull();
      expect(result.current.cancelAtPeriodEnd).toBe(false);
    });
  });

  describe('Successful API Response', () => {
    it('should update status with premium subscription data', async () => {
      const mockSubscription = {
        active: true,
        plan: 'monthly' as const,
        currentPeriodEnd: '2024-12-31T23:59:59.999Z',
        cancelAtPeriodEnd: false,
      };

      mockStripeApi.getSubscriptionStatus.mockResolvedValue({
        subscription: mockSubscription,
      });

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isPremium).toBe(true);
      expect(result.current.plan).toBe('monthly');
      expect(result.current.currentPeriodEnd).toEqual(new Date('2024-12-31T23:59:59.999Z'));
      expect(result.current.cancelAtPeriodEnd).toBe(false);
    });

    it('should update status with non-premium subscription data', async () => {
      const mockSubscription = {
        active: false,
        plan: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };

      mockStripeApi.getSubscriptionStatus.mockResolvedValue({
        subscription: mockSubscription,
      });

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isPremium).toBe(false);
      expect(result.current.plan).toBeNull();
      expect(result.current.currentPeriodEnd).toBeNull();
      expect(result.current.cancelAtPeriodEnd).toBe(false);
    });

    it('should update status with yearly plan data', async () => {
      const mockSubscription = {
        active: true,
        plan: 'yearly' as const,
        currentPeriodEnd: '2025-01-01T00:00:00.000Z',
        cancelAtPeriodEnd: true,
      };

      mockStripeApi.getSubscriptionStatus.mockResolvedValue({
        subscription: mockSubscription,
      });

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isPremium).toBe(true);
      expect(result.current.plan).toBe('yearly');
      expect(result.current.currentPeriodEnd).toEqual(new Date('2025-01-01T00:00:00.000Z'));
      expect(result.current.cancelAtPeriodEnd).toBe(true);
    });

    it('should save status to localStorage on successful API call', async () => {
      const mockSubscription = {
        active: true,
        plan: 'monthly' as const,
        currentPeriodEnd: '2024-12-31T23:59:59.999Z',
        cancelAtPeriodEnd: false,
      };

      mockStripeApi.getSubscriptionStatus.mockResolvedValue({
        subscription: mockSubscription,
      });

      renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'premiumStatus',
          expect.stringContaining('"isPremium":true')
        );
      });

      const setItemCall = localStorageMock.setItem.mock.calls[0];
      const savedData = JSON.parse(setItemCall[1]);
      
      expect(savedData.isPremium).toBe(true);
      expect(savedData.plan).toBe('monthly');
      expect(savedData.lastChecked).toBeDefined();
    });
  });

  describe('API Error Handling', () => {
    it('should fall back to localStorage when API fails', async () => {
      const cachedData = {
        isPremium: true,
        plan: 'yearly',
        lastChecked: '2024-01-01T00:00:00.000Z',
      };

      mockStripeApi.getSubscriptionStatus.mockRejectedValue(new Error('API Error'));
      localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedData));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isPremium).toBe(true);
      expect(result.current.plan).toBe('yearly');
      expect(result.current.currentPeriodEnd).toBeNull();
      expect(result.current.cancelAtPeriodEnd).toBe(false);
    });

    it('should handle API error with no cached data gracefully', async () => {
      mockStripeApi.getSubscriptionStatus.mockRejectedValue(new Error('API Error'));
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isPremium).toBe(false);
      expect(result.current.plan).toBeNull();
      expect(result.current.currentPeriodEnd).toBeNull();
      expect(result.current.cancelAtPeriodEnd).toBe(false);
    });

    it('should handle invalid cached data gracefully', async () => {
      mockStripeApi.getSubscriptionStatus.mockRejectedValue(new Error('API Error'));
      localStorageMock.getItem.mockReturnValue('invalid json');

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isPremium).toBe(false);
      expect(result.current.plan).toBeNull();
    });

    it('should handle cached data with missing fields', async () => {
      const incompleteCachedData = {
        isPremium: true,
        // missing plan and lastChecked
      };

      mockStripeApi.getSubscriptionStatus.mockRejectedValue(new Error('API Error'));
      localStorageMock.getItem.mockReturnValue(JSON.stringify(incompleteCachedData));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isPremium).toBe(true);
      expect(result.current.plan).toBeNull();
    });
  });

  describe('checkPremiumStatus function', () => {
    it('should re-check premium status when called manually', async () => {
      const initialSubscription = {
        active: false,
        plan: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };

      const updatedSubscription = {
        active: true,
        plan: 'monthly' as const,
        currentPeriodEnd: '2024-12-31T23:59:59.999Z',
        cancelAtPeriodEnd: false,
      };

      mockStripeApi.getSubscriptionStatus
        .mockResolvedValueOnce({ subscription: initialSubscription })
        .mockResolvedValueOnce({ subscription: updatedSubscription });

      const { result } = renderHook(() => usePremiumStatus());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isPremium).toBe(false);

      // Manually check status again
      await result.current.checkPremiumStatus();

      expect(result.current.isPremium).toBe(true);
      expect(result.current.plan).toBe('monthly');
      expect(mockStripeApi.getSubscriptionStatus).toHaveBeenCalledTimes(2);
    });

    it('should handle manual check with API error', async () => {
      // First call succeeds
      mockStripeApi.getSubscriptionStatus.mockResolvedValueOnce({
        subscription: { active: true, plan: 'monthly', currentPeriodEnd: null, cancelAtPeriodEnd: false }
      });

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Second call fails
      mockStripeApi.getSubscriptionStatus.mockRejectedValueOnce(new Error('API Error'));
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        isPremium: false,
        plan: null,
        lastChecked: '2024-01-01T00:00:00.000Z',
      }));

      await result.current.checkPremiumStatus();

      expect(result.current.isPremium).toBe(false); // Falls back to cached data
    });
  });

  describe('openCustomerPortal function', () => {
    it('should redirect to customer portal URL when successful', async () => {
      const portalUrl = 'https://billing.stripe.com/session/abc123';
      mockStripeApi.createPortalSession.mockResolvedValue({ url: portalUrl });

      const { result } = renderHook(() => usePremiumStatus());

      await result.current.openCustomerPortal();

      expect(mockStripeApi.createPortalSession).toHaveBeenCalled();
      expect(window.location.href).toBe(portalUrl);
    });

    it('should handle portal session creation with no URL', async () => {
      mockStripeApi.createPortalSession.mockResolvedValue({ url: null });

      const { result } = renderHook(() => usePremiumStatus());

      await result.current.openCustomerPortal();

      expect(mockStripeApi.createPortalSession).toHaveBeenCalled();
      expect(window.location.href).toBe('');
    });

    it('should handle portal session creation error gracefully', async () => {
      mockStripeApi.createPortalSession.mockRejectedValue(new Error('Portal Error'));

      const { result } = renderHook(() => usePremiumStatus());

      // Should not throw
      await expect(result.current.openCustomerPortal()).resolves.toBeUndefined();

      expect(mockStripeApi.createPortalSession).toHaveBeenCalled();
      expect(window.location.href).toBe('');
    });
  });

  describe('Environment-specific behavior', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should not log errors in production', async () => {
      process.env.NODE_ENV = 'production';
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockStripeApi.getSubscriptionStatus.mockRejectedValue(new Error('API Error'));
      localStorageMock.getItem.mockReturnValue(null);

      renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(consoleSpy).not.toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    it('should log errors in development', async () => {
      process.env.NODE_ENV = 'development';
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockStripeApi.getSubscriptionStatus.mockRejectedValue(new Error('API Error'));
      localStorageMock.getItem.mockReturnValue(null);

      renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error checking premium status:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle subscription with null currentPeriodEnd', async () => {
      const mockSubscription = {
        active: true,
        plan: 'monthly' as const,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };

      mockStripeApi.getSubscriptionStatus.mockResolvedValue({
        subscription: mockSubscription,
      });

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentPeriodEnd).toBeNull();
    });

    it('should handle empty cached data object', async () => {
      mockStripeApi.getSubscriptionStatus.mockRejectedValue(new Error('API Error'));
      localStorageMock.getItem.mockReturnValue('{}');

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isPremium).toBe(false);
      expect(result.current.plan).toBeNull();
    });
  });
});