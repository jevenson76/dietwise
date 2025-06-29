import { loadStripe } from '@stripe/stripe-js';

// Stripe configuration - environment variables are required in production
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  if (process.env.NODE_ENV !== 'production') {
    console.error('Missing VITE_STRIPE_PUBLISHABLE_KEY environment variable');
  }
}

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY || '');

// Stripe Price IDs from your Stripe dashboard
export const STRIPE_PRICES = {
  monthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || '',
  yearly: import.meta.env.VITE_STRIPE_PRICE_YEARLY || '',
};

if (!STRIPE_PRICES.monthly || !STRIPE_PRICES.yearly) {
  if (process.env.NODE_ENV !== 'production') {
    console.error('Missing Stripe price IDs in environment variables');
  }
}

export const STRIPE_CONFIG = {
  // Your success and cancel URLs
  successUrl: `${window.location.origin}/success`,
  cancelUrl: `${window.location.origin}/cancel`,
  // Customer portal URL for managing subscriptions
  customerPortalUrl: import.meta.env.VITE_STRIPE_CUSTOMER_PORTAL_URL || 'https://billing.stripe.com/p/login/test_00000000000000',
};