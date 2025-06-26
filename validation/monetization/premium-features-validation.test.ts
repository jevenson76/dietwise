import { test, expect } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StripeCheckout from '../../components/StripeCheckout';
import UpgradePrompt from '../../components/UpgradePrompt';
import AdvancedAnalytics from '../../components/AdvancedAnalytics';
import { loadStripe } from '@stripe/stripe-js';

// Mock Stripe
jest.mock('@stripe/stripe-js');
const mockStripe = {
  redirectToCheckout: jest.fn(),
  confirmCardPayment: jest.fn(),
  elements: jest.fn(() => ({
    create: jest.fn(() => ({
      mount: jest.fn(),
      destroy: jest.fn(),
      on: jest.fn()
    }))
  }))
};

(loadStripe as jest.Mock).mockResolvedValue(mockStripe);

describe('Premium Features Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Stripe Integration', () => {
    test('initializes Stripe correctly', async () => {
      render(<StripeCheckout 
        priceId="price_test_123" 
        onSuccess={jest.fn()} 
        onError={jest.fn()} 
      />);

      await waitFor(() => {
        expect(loadStripe).toHaveBeenCalledWith(expect.stringContaining('pk_'));
      });
    });

    test('handles subscription creation', async () => {
      const onSuccess = jest.fn();
      const user = userEvent.setup();

      render(<StripeCheckout 
        priceId="price_test_123" 
        onSuccess={onSuccess} 
        onError={jest.fn()} 
      />);

      const subscribeButton = screen.getByText(/subscribe/i);
      await user.click(subscribeButton);

      expect(mockStripe.redirectToCheckout).toHaveBeenCalledWith({
        lineItems: [{
          price: 'price_test_123',
          quantity: 1,
        }],
        mode: 'subscription',
        successUrl: expect.stringContaining('/success'),
        cancelUrl: expect.stringContaining('/cancel'),
      });
    });

    test('handles payment method updates', async () => {
      const user = userEvent.setup();
      
      render(<StripeCheckout 
        mode="update-payment"
        customerId="cus_test_123"
        onSuccess={jest.fn()} 
        onError={jest.fn()} 
      />);

      const updateButton = screen.getByText(/update payment/i);
      await user.click(updateButton);

      expect(mockStripe.elements).toHaveBeenCalled();
    });

    test('displays correct pricing information', () => {
      render(<StripeCheckout 
        priceId="price_monthly_test"
        amount={999} // $9.99
        interval="month"
        onSuccess={jest.fn()} 
        onError={jest.fn()} 
      />);

      expect(screen.getByText(/\$9\.99/)).toBeInTheDocument();
      expect(screen.getByText(/month/i)).toBeInTheDocument();
    });

    test('handles subscription cancellation', async () => {
      const onCancel = jest.fn();
      const user = userEvent.setup();

      render(<StripeCheckout 
        mode="cancel-subscription"
        subscriptionId="sub_test_123"
        onCancel={onCancel}
        onError={jest.fn()} 
      />);

      const cancelButton = screen.getByText(/cancel subscription/i);
      await user.click(cancelButton);

      // Should show confirmation dialog
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      
      const confirmButton = screen.getByText(/confirm/i);
      await user.click(confirmButton);

      expect(onCancel).toHaveBeenCalledWith('sub_test_123');
    });

    test('validates payment errors', async () => {
      const onError = jest.fn();
      mockStripe.redirectToCheckout.mockRejectedValue(new Error('Card declined'));

      const user = userEvent.setup();
      render(<StripeCheckout 
        priceId="price_test_123" 
        onSuccess={jest.fn()} 
        onError={onError} 
      />);

      const subscribeButton = screen.getByText(/subscribe/i);
      await user.click(subscribeButton);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.objectContaining({
          message: 'Card declined'
        }));
      });
    });
  });

  describe('Upgrade Prompts', () => {
    test('displays upgrade prompt for free users', () => {
      render(<UpgradePrompt 
        feature="advanced-analytics"
        userTier="free"
        onUpgrade={jest.fn()}
      />);

      expect(screen.getByText(/upgrade to premium/i)).toBeInTheDocument();
      expect(screen.getByText(/advanced analytics/i)).toBeInTheDocument();
    });

    test('shows feature benefits correctly', () => {
      render(<UpgradePrompt 
        feature="custom-meal-plans"
        userTier="free"
        onUpgrade={jest.fn()}
      />);

      expect(screen.getByText(/custom meal plans/i)).toBeInTheDocument();
      expect(screen.getByText(/personalized/i)).toBeInTheDocument();
      expect(screen.getByText(/unlimited/i)).toBeInTheDocument();
    });

    test('handles upgrade button click', async () => {
      const onUpgrade = jest.fn();
      const user = userEvent.setup();

      render(<UpgradePrompt 
        feature="progress-export"
        userTier="free"
        onUpgrade={onUpgrade}
      />);

      const upgradeButton = screen.getByText(/upgrade now/i);
      await user.click(upgradeButton);

      expect(onUpgrade).toHaveBeenCalledWith('progress-export');
    });

    test('shows different tiers correctly', () => {
      render(<UpgradePrompt 
        feature="ai-coaching"
        userTier="basic"
        targetTier="premium"
        onUpgrade={jest.fn()}
      />);

      expect(screen.getByText(/upgrade to premium/i)).toBeInTheDocument();
      expect(screen.getByText(/ai coaching/i)).toBeInTheDocument();
    });

    test('displays trial information', () => {
      render(<UpgradePrompt 
        feature="advanced-analytics"
        userTier="free"
        trialDays={7}
        onUpgrade={jest.fn()}
      />);

      expect(screen.getByText(/7.*day.*trial/i)).toBeInTheDocument();
    });
  });

  describe('Premium Feature Access Control', () => {
    test('allows premium users to access advanced analytics', () => {
      render(<AdvancedAnalytics 
        userTier="premium"
        nutritionData={[
          { date: '2024-06-26', calories: 2000, protein: 150, carbs: 200, fat: 80 }
        ]}
      />);

      expect(screen.getByText(/advanced analytics/i)).toBeInTheDocument();
      expect(screen.getByText(/nutrient timing/i)).toBeInTheDocument();
      expect(screen.getByText(/macro trends/i)).toBeInTheDocument();
    });

    test('blocks free users from premium features', () => {
      render(<AdvancedAnalytics 
        userTier="free"
        nutritionData={[]}
      />);

      expect(screen.getByText(/upgrade to access/i)).toBeInTheDocument();
      expect(screen.queryByText(/nutrient timing/i)).not.toBeInTheDocument();
    });

    test('shows feature usage limits for free tier', () => {
      render(<AdvancedAnalytics 
        userTier="free"
        usageCount={8}
        freeLimit={10}
      />);

      expect(screen.getByText(/8.*of.*10/i)).toBeInTheDocument();
      expect(screen.getByText(/upgrade for unlimited/i)).toBeInTheDocument();
    });

    test('handles trial access correctly', () => {
      render(<AdvancedAnalytics 
        userTier="trial"
        trialDaysRemaining={5}
        nutritionData={[
          { date: '2024-06-26', calories: 2000, protein: 150, carbs: 200, fat: 80 }
        ]}
      />);

      expect(screen.getByText(/5.*days.*remaining/i)).toBeInTheDocument();
      expect(screen.getByText(/advanced analytics/i)).toBeInTheDocument();
    });
  });

  describe('Subscription Management', () => {
    test('displays current subscription status', () => {
      const subscription = {
        id: 'sub_test_123',
        status: 'active',
        currentPeriodEnd: '2024-07-26',
        plan: {
          nickname: 'Premium Monthly',
          amount: 999,
          interval: 'month'
        }
      };

      render(<SubscriptionManager subscription={subscription} />);

      expect(screen.getByText(/active/i)).toBeInTheDocument();
      expect(screen.getByText(/premium monthly/i)).toBeInTheDocument();
      expect(screen.getByText(/\$9\.99/i)).toBeInTheDocument();
      expect(screen.getByText(/renews.*july 26/i)).toBeInTheDocument();
    });

    test('handles subscription pause', async () => {
      const onPause = jest.fn();
      const user = userEvent.setup();

      const subscription = {
        id: 'sub_test_123',
        status: 'active',
        currentPeriodEnd: '2024-07-26'
      };

      render(<SubscriptionManager 
        subscription={subscription} 
        onPause={onPause}
      />);

      const pauseButton = screen.getByText(/pause/i);
      await user.click(pauseButton);

      expect(onPause).toHaveBeenCalledWith('sub_test_123');
    });

    test('shows billing history', () => {
      const billingHistory = [
        { id: 'in_test_1', amount: 999, date: '2024-06-26', status: 'paid' },
        { id: 'in_test_2', amount: 999, date: '2024-05-26', status: 'paid' }
      ];

      render(<SubscriptionManager billingHistory={billingHistory} />);

      expect(screen.getByText(/billing history/i)).toBeInTheDocument();
      expect(screen.getAllByText(/\$9\.99/)).toHaveLength(2);
      expect(screen.getAllByText(/paid/i)).toHaveLength(2);
    });

    test('handles plan changes', async () => {
      const onPlanChange = jest.fn();
      const user = userEvent.setup();

      render(<SubscriptionManager 
        currentPlan="monthly"
        onPlanChange={onPlanChange}
      />);

      const changePlanButton = screen.getByText(/change plan/i);
      await user.click(changePlanButton);

      const yearlyPlan = screen.getByText(/yearly/i);
      await user.click(yearlyPlan);

      expect(onPlanChange).toHaveBeenCalledWith('yearly');
    });
  });

  describe('Revenue Tracking', () => {
    test('tracks subscription events', () => {
      const trackEvent = jest.fn();
      
      render(<StripeCheckout 
        priceId="price_test_123"
        onSuccess={(subscription) => {
          trackEvent('subscription_created', {
            subscriptionId: subscription.id,
            planId: subscription.items.data[0].price.id,
            amount: subscription.items.data[0].price.unit_amount
          });
        }}
        onError={jest.fn()}
      />);

      // Simulate successful subscription
      fireEvent(window, new CustomEvent('stripe_success', {
        detail: {
          subscription: {
            id: 'sub_test_123',
            items: {
              data: [{
                price: {
                  id: 'price_test_123',
                  unit_amount: 999
                }
              }]
            }
          }
        }
      }));

      expect(trackEvent).toHaveBeenCalledWith('subscription_created', {
        subscriptionId: 'sub_test_123',
        planId: 'price_test_123',
        amount: 999
      });
    });

    test('tracks upgrade conversions', () => {
      const trackEvent = jest.fn();
      
      render(<UpgradePrompt 
        feature="advanced-analytics"
        userTier="free"
        onUpgrade={(feature) => {
          trackEvent('upgrade_prompt_clicked', {
            feature,
            fromTier: 'free',
            toTier: 'premium'
          });
        }}
      />);

      const upgradeButton = screen.getByText(/upgrade now/i);
      fireEvent.click(upgradeButton);

      expect(trackEvent).toHaveBeenCalledWith('upgrade_prompt_clicked', {
        feature: 'advanced-analytics',
        fromTier: 'free',
        toTier: 'premium'
      });
    });
  });

  describe('A/B Testing for Monetization', () => {
    test('shows different pricing variants', () => {
      const variants = [
        { price: 999, label: '$9.99/month' },
        { price: 1299, label: '$12.99/month' },
        { price: 799, label: '$7.99/month' }
      ];

      variants.forEach((variant, index) => {
        render(<StripeCheckout 
          priceId={`price_test_${index}`}
          amount={variant.price}
          variant={`pricing_test_${index}`}
          onSuccess={jest.fn()}
          onError={jest.fn()}
        />);

        expect(screen.getByText(variant.label)).toBeInTheDocument();
      });
    });

    test('tracks A/B test interactions', () => {
      const trackEvent = jest.fn();

      render(<UpgradePrompt 
        feature="custom-meal-plans"
        userTier="free"
        variant="urgency_test"
        onUpgrade={(feature) => {
          trackEvent('ab_test_conversion', {
            variant: 'urgency_test',
            feature
          });
        }}
      />);

      const upgradeButton = screen.getByText(/upgrade now/i);
      fireEvent.click(upgradeButton);

      expect(trackEvent).toHaveBeenCalledWith('ab_test_conversion', {
        variant: 'urgency_test',
        feature: 'custom-meal-plans'
      });
    });
  });

  describe('AdMob Integration', () => {
    test('shows ads for free users', () => {
      render(<AdContainer 
        userTier="free"
        placement="food-log-bottom"
      />);

      expect(screen.getByTestId('admob-banner')).toBeInTheDocument();
    });

    test('hides ads for premium users', () => {
      render(<AdContainer 
        userTier="premium"
        placement="food-log-bottom"
      />);

      expect(screen.queryByTestId('admob-banner')).not.toBeInTheDocument();
    });

    test('respects ad frequency limits', () => {
      const adConfig = {
        maxAdsPerHour: 3,
        currentAdsShown: 2
      };

      render(<AdContainer 
        userTier="free"
        placement="interstitial"
        config={adConfig}
      />);

      // Should still show ad (2 < 3)
      expect(screen.getByTestId('admob-interstitial')).toBeInTheDocument();

      // Rerender with max ads reached
      render(<AdContainer 
        userTier="free"
        placement="interstitial"
        config={{ ...adConfig, currentAdsShown: 3 }}
      />);

      expect(screen.queryByTestId('admob-interstitial')).not.toBeInTheDocument();
    });

    test('tracks ad revenue events', () => {
      const trackRevenue = jest.fn();

      render(<AdContainer 
        userTier="free"
        placement="banner"
        onAdRevenue={trackRevenue}
      />);

      // Simulate ad revenue event
      fireEvent(window, new CustomEvent('admob_revenue', {
        detail: {
          placement: 'banner',
          revenue: 0.05,
          currency: 'USD'
        }
      }));

      expect(trackRevenue).toHaveBeenCalledWith({
        placement: 'banner',
        revenue: 0.05,
        currency: 'USD'
      });
    });
  });

  describe('Freemium Feature Limits', () => {
    test('enforces food log limits for free users', () => {
      render(<FoodLogLimit 
        userTier="free"
        dailyEntries={48}
        freeLimit={50}
      />);

      expect(screen.getByText(/48.*of.*50/i)).toBeInTheDocument();
      expect(screen.getByText(/2.*remaining/i)).toBeInTheDocument();
    });

    test('blocks feature access when limit exceeded', () => {
      render(<FoodLogLimit 
        userTier="free"
        dailyEntries={50}
        freeLimit={50}
      />);

      expect(screen.getByText(/daily limit reached/i)).toBeInTheDocument();
      expect(screen.getByText(/upgrade for unlimited/i)).toBeInTheDocument();
    });

    test('shows unlimited access for premium users', () => {
      render(<FoodLogLimit 
        userTier="premium"
        dailyEntries={150}
      />);

      expect(screen.getByText(/unlimited/i)).toBeInTheDocument();
      expect(screen.queryByText(/limit/i)).not.toBeInTheDocument();
    });
  });
});

// Mock components for testing
const SubscriptionManager = ({ subscription, onPause, onPlanChange, billingHistory }) => (
  <div>
    <div>Status: {subscription?.status}</div>
    <div>Plan: {subscription?.plan?.nickname}</div>
    <div>Amount: ${(subscription?.plan?.amount / 100).toFixed(2)}</div>
    <div>Renews: {subscription?.currentPeriodEnd}</div>
    <button onClick={() => onPause?.(subscription?.id)}>Pause</button>
    <button onClick={() => onPlanChange?.('yearly')}>Change Plan</button>
    
    {billingHistory && (
      <div>
        <h3>Billing History</h3>
        {billingHistory.map(invoice => (
          <div key={invoice.id}>
            ${(invoice.amount / 100).toFixed(2)} - {invoice.status}
          </div>
        ))}
      </div>
    )}
  </div>
);

const AdContainer = ({ userTier, placement, config, onAdRevenue }) => {
  if (userTier === 'premium') return null;
  
  if (placement === 'interstitial' && config?.currentAdsShown >= config?.maxAdsPerHour) {
    return null;
  }

  return <div data-testid={`admob-${placement}`}>Ad Content</div>;
};

const FoodLogLimit = ({ userTier, dailyEntries, freeLimit }) => {
  if (userTier === 'premium') {
    return <div>Unlimited access</div>;
  }

  if (dailyEntries >= freeLimit) {
    return (
      <div>
        <div>Daily limit reached</div>
        <div>Upgrade for unlimited access</div>
      </div>
    );
  }

  return (
    <div>
      <div>{dailyEntries} of {freeLimit} entries used</div>
      <div>{freeLimit - dailyEntries} remaining today</div>
    </div>
  );
};