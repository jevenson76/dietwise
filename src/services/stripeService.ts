import { stripePromise, STRIPE_PRICES, STRIPE_CONFIG } from '../config/stripe';

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export interface SubscriptionPlan {
  id: 'monthly' | 'yearly';
  name: string;
  price: number;
  priceDisplay: string;
  interval: string;
  stripePriceId: string;
  savings?: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 4.99,
    priceDisplay: '$4.99',
    interval: 'month',
    stripePriceId: STRIPE_PRICES.monthly,
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    price: 39.99,
    priceDisplay: '$39.99',
    interval: 'year',
    stripePriceId: STRIPE_PRICES.yearly,
    savings: 'Save 33%',
  },
];

/**
 * Redirects to Stripe Checkout
 */
export async function redirectToCheckout(priceId: string, customerEmail?: string): Promise<void> {
  const stripe = await stripePromise;

  if (!stripe) {
    throw new Error('Stripe failed to initialize');
  }

  // For a real implementation, you'd call your backend API here
  // For now, we'll use Stripe's client-only approach (less secure but works for testing)

  const { error } = await stripe.redirectToCheckout({
    lineItems: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    successUrl: STRIPE_CONFIG.successUrl,
    cancelUrl: STRIPE_CONFIG.cancelUrl,
    customerEmail,
    allowPromotion: true, // Allow discount codes
  });

  if (error) {
    console.error('Stripe checkout error:', error);
    throw new Error(error.message || 'Failed to redirect to checkout');
  }
}

/**
 * Opens customer portal for subscription management
 */
export async function openCustomerPortal(): Promise<void> {
  // In a real app, you'd call your backend to create a portal session
  // For demo purposes, we'll just redirect to a generic portal
  window.open(STRIPE_CONFIG.customerPortalUrl, '_blank');
}

/**
 * Check subscription status via backend API
 * @deprecated Use stripeApi.getSubscriptionStatus() instead for proper backend integration
 */
export async function getSubscriptionStatus(userId: string): Promise<{
  isActive: boolean;
  plan?: 'monthly' | 'yearly';
  currentPeriodEnd?: Date;
}> {
  // DEPRECATED: This function uses localStorage fallback for backwards compatibility
  // Production apps should use the API client in src/services/api/stripe.ts
  console.warn('Using deprecated getSubscriptionStatus. Use stripeApi.getSubscriptionStatus() instead.');
  
  // Fallback to localStorage for backwards compatibility during migration
  const mockSubscription = localStorage.getItem(`subscription_${userId}`);

  if (mockSubscription) {
    try {
      return JSON.parse(mockSubscription);
    } catch {
      return { isActive: false };
    }
  }

  return { isActive: false };
}

/**
 * Mock function to activate subscription
 * This would typically be handled by Stripe webhooks on your backend
 */
export function activateSubscription(userId: string, plan: 'monthly' | 'yearly'): void {
  const subscription = {
    isActive: true,
    plan,
    currentPeriodEnd: new Date(Date.now() + (plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
  };

  localStorage.setItem(`subscription_${userId}`, JSON.stringify(subscription));

  // Trigger a page reload to update the premium status
  window.location.reload();
}