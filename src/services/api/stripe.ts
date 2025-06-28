import { api } from './index';

interface CreateCheckoutSessionParams {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

interface PortalSessionResponse {
  url: string;
}

interface SubscriptionStatus {
  subscription: {
    active: boolean;
    plan: 'monthly' | 'yearly' | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    status: string;
  };
}

export const stripeApi = {
  // Create checkout session for new subscription
  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CheckoutSessionResponse> {
    try {
      const response = await api.post<CheckoutSessionResponse>('/stripe/create-checkout-session', params);
      return response;
    } catch (error: any) {
      if (process.env.NODE_ENV !== 'production') {
      console.error('Create checkout session error:', error);
      }
      
      // Provide user-friendly error messages
      if (error.response?.status === 400) {
        throw new Error('Invalid subscription request. Please try again.');
      } else if (error.response?.status === 401) {
        throw new Error('Please log in to subscribe to premium.');
      } else if (error.response?.status === 500) {
        throw new Error('Payment service temporarily unavailable. Please try again later.');
      } else if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your connection and try again.');
      }
      
      throw new Error('Failed to start checkout process. Please try again.');
    }
  },

  // Create customer portal session for managing subscription
  async createPortalSession(returnUrl?: string): Promise<PortalSessionResponse> {
    try {
      const response = await api.post<PortalSessionResponse>('/stripe/create-portal-session', {
        returnUrl: returnUrl || window.location.href,
      });
      return response;
    } catch (error: any) {
      if (process.env.NODE_ENV !== 'production') {
      console.error('Create portal session error:', error);
      }
      
      // Provide user-friendly error messages
      if (error.response?.status === 401) {
        throw new Error('Please log in to manage your subscription.');
      } else if (error.response?.status === 404) {
        throw new Error('No subscription found. Please subscribe first.');
      } else if (error.response?.status === 500) {
        throw new Error('Subscription management temporarily unavailable. Please try again later.');
      } else if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your connection and try again.');
      }
      
      throw new Error('Failed to open subscription management. Please try again.');
    }
  },

  // Get current subscription status
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const response = await api.get<SubscriptionStatus>('/stripe/subscription-status');
      return response;
    } catch (error: any) {
      if (process.env.NODE_ENV !== 'production') {
      console.error('Get subscription status error:', error);
      }
      
      // For subscription status, we might want to fail gracefully
      if (error.response?.status === 401) {
        // User not authenticated - return inactive subscription
        return {
          subscription: {
            active: false,
            plan: null,
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
            status: 'unauthenticated'
          }
        };
      }
      
      throw error;
    }
  },

  // Check if user has active premium subscription
  async hasActiveSubscription(): Promise<boolean> {
    try {
      const { subscription } = await this.getSubscriptionStatus();
      return subscription.active;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
      console.error('Check subscription error:', error);
      }
      return false;
    }
  },
};