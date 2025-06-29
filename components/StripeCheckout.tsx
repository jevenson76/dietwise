import React, { useState } from 'react';
import { SUBSCRIPTION_PLANS } from '../src/services/stripeService';
import { stripeApi } from '../src/services/api/stripe';
import { trackEvent } from '@services/analyticsService';
import LoadingSpinner from './common/LoadingSpinner';
import Alert from './common/Alert';
import DietWiseLogo from '../src/components/DietWiseLogo';

interface StripeCheckoutProps {
  onClose: () => void;
  customerEmail?: string;
  selectedPlan?: 'monthly' | 'yearly';
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ 
  onClose, 
  customerEmail,
  selectedPlan = 'monthly'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState(selectedPlan);

  const handleCheckout = async (planId: 'monthly' | 'yearly') => {
    setIsLoading(true);
    setError(null);

    try {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      trackEvent('checkout_initiated', { 
        plan: planId, 
        price: plan.price,
        customerEmail: customerEmail || 'anonymous'
      });

      // Create checkout session via backend API
      const { url } = await stripeApi.createCheckoutSession({
        priceId: plan.stripePriceId,
        successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: window.location.href,
      });

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Failed to create checkout session');
      }

    } catch (err: any) {
      if (process.env.NODE_ENV !== 'production') {
      console.error('Checkout error:', err);
      }
      setError(err.message || 'Failed to start checkout process');
      trackEvent('checkout_error', { 
        plan: planId,
        error: err.message 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const monthlyPlan = SUBSCRIPTION_PLANS.find(p => p.id === 'monthly')!;
  const yearlyPlan = SUBSCRIPTION_PLANS.find(p => p.id === 'yearly')!;

  return (
    <div className="max-w-md mx-auto relative">
      {/* DietWise Logo in upper right */}
      <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 z-10">
        <DietWiseLogo size="small" />
      </div>
      
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-text-default mb-2">Choose Your Plan</h3>
        <p className="text-text-alt">
          Start your 7-day free trial today. Cancel anytime.
        </p>
      </div>

      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError(null)} 
          className="mb-4" 
        />
      )}

      {/* Plan Selection Toggle */}
      <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActivePlan('monthly')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activePlan === 'monthly'
              ? 'bg-white dark:bg-slate-600 text-text-default shadow'
              : 'text-text-alt hover:text-text-default'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setActivePlan('yearly')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all relative ${
            activePlan === 'yearly'
              ? 'bg-white dark:bg-slate-600 text-text-default shadow'
              : 'text-text-alt hover:text-text-default'
          }`}
        >
          Yearly
          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            Save 34%
          </span>
        </button>
      </div>

      {/* Selected Plan Details */}
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border border-teal-200 dark:border-teal-700 rounded-lg p-6 mb-6">
        <div className="text-center">
          <h4 className="text-lg font-semibold text-text-default mb-2">
            {activePlan === 'monthly' ? monthlyPlan.name : yearlyPlan.name}
          </h4>
          <div className="flex items-baseline justify-center">
            <span className="text-3xl font-bold text-teal-600 dark:text-teal-400">
              {activePlan === 'monthly' ? monthlyPlan.priceDisplay : yearlyPlan.priceDisplay}
            </span>
            <span className="text-text-alt ml-1">
              /{activePlan === 'monthly' ? 'month' : 'year'}
            </span>
          </div>
          {activePlan === 'yearly' && (
            <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
              {yearlyPlan.savings} • Only $3.33/month
            </p>
          )}
        </div>

        <div className="mt-4 space-y-2 text-sm text-text-alt">
          <div className="flex items-center">
            <i className="fas fa-check text-green-500 mr-2"></i>
            <span>7-day free trial</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-check text-green-500 mr-2"></i>
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-check text-green-500 mr-2"></i>
            <span>All premium features included</span>
          </div>
        </div>
      </div>

      {/* Premium Features List */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-6">
        <h5 className="font-semibold text-text-default mb-3 text-center">What's Included:</h5>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <i className="fas fa-infinity text-teal-500 mr-2"></i>
            <span>Unlimited Scans</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-robot text-teal-500 mr-2"></i>
            <span>Unlimited AI Ideas</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-calendar-week text-teal-500 mr-2"></i>
            <span>7-Day Meal Plans</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-chart-line text-teal-500 mr-2"></i>
            <span>Advanced Analytics</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-file-pdf text-teal-500 mr-2"></i>
            <span>PDF Export</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-ban text-teal-500 mr-2"></i>
            <span>No Ads</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => handleCheckout(activePlan)}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-150 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" color="text-white" label="Processing..." />
          ) : (
            <>
              <i className="fas fa-rocket mr-2"></i>
              Start 7-Day Free Trial
            </>
          )}
        </button>

        <button
          onClick={onClose}
          disabled={isLoading}
          className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200 font-semibold py-2.5 px-6 rounded-lg shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all disabled:opacity-50"
        >
          Maybe Later
        </button>

        {/* Demo button removed - now using real backend integration */}
      </div>

      {/* Security Badge */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center text-xs text-text-alt">
          <i className="fas fa-lock mr-1"></i>
          <span>Secured by Stripe • SSL Encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default StripeCheckout;