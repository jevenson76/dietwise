import { loadStripe } from '@stripe/stripe-js';

// Use your real Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51QGMhHI6Kz0LSHqhKQJMzQp3MR7xVh7TzGlHe4KlGZlKlBGMKVA6eGfSGvvBOUAaDRGfTgp7GSJ3fz6qJoA5oqeU00oN7tZWQo';

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Stripe Price IDs from your Stripe dashboard
export const STRIPE_PRICES = {
  monthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || 'price_1QGOcsI6Kz0LSHqhhKQJMzQp',
  yearly: import.meta.env.VITE_STRIPE_PRICE_YEARLY || 'price_1QGOd1I6Kz0LSHqhKlBGMKVA',
};

export const STRIPE_CONFIG = {
  // Your success and cancel URLs
  successUrl: `${window.location.origin}/success`,
  cancelUrl: `${window.location.origin}/cancel`,
  // Customer portal URL for managing subscriptions
  customerPortalUrl: process.env.STRIPE_CUSTOMER_PORTAL_URL || 'https://billing.stripe.com/p/login/test_00000000000000',
};