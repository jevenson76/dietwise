# Stripe Integration Guide for DietWise

## Overview
This guide covers the complete Stripe payment integration for DietWise's freemium model.

## Configuration

### Environment Variables
```bash
# .env file
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51RbrneFmhcNUMRQy...
VITE_STRIPE_PRICE_MONTHLY=price_1Rbs8KFmhcNUMRQy7LPWM3n5
VITE_STRIPE_PRICE_YEARLY=price_1RbsAVFmhcNUMRQyI3IpNq17
```

### Stripe Dashboard Setup

1. **Products**
   - Product Name: "DietWise Premium"
   - Description: "Unlimited access to all DietWise premium features"

2. **Pricing**
   - Monthly: $9.99 (price_1Rbs8KFmhcNUMRQy7LPWM3n5)
   - Yearly: $79.00 (price_1RbsAVFmhcNUMRQyI3IpNq17)
   - Currency: USD
   - Billing: Recurring

3. **Checkout Settings**
   - Enable promotional codes
   - Allow customers to adjust quantity: No
   - Collect billing address: Yes
   - Collect phone number: Optional

## Implementation

### 1. Stripe Configuration (`src/config/stripe.ts`)
```typescript
import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export const STRIPE_PRICES = {
  monthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY,
  yearly: import.meta.env.VITE_STRIPE_PRICE_YEARLY,
};
```

### 2. Stripe Service (`src/services/stripeService.ts`)
```typescript
export const redirectToCheckout = async (priceId: string, customerEmail?: string) => {
  const stripe = await stripePromise;
  if (!stripe) throw new Error('Stripe failed to load');

  const { error } = await stripe.redirectToCheckout({
    lineItems: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${window.location.origin}/cancel`,
    customerEmail,
    allowPromotionCodes: true,
    billingAddressCollection: 'required',
  });

  if (error) throw error;
};
```

### 3. Checkout Component (`components/StripeCheckout.tsx`)
Key features:
- Plan selection toggle (monthly/yearly)
- Savings calculation display
- Loading states
- Error handling
- Demo activation for testing

### 4. Subscription Management
```typescript
// Check subscription status
const checkSubscriptionStatus = () => {
  const subscription = localStorage.getItem('subscription_dietwise_user');
  if (subscription) {
    const sub = JSON.parse(subscription);
    return sub.isActive && new Date(sub.currentPeriodEnd) > new Date();
  }
  return false;
};

// Activate subscription (after successful payment)
export const activateSubscription = (userId: string, plan: 'monthly' | 'yearly') => {
  const endDate = plan === 'monthly' 
    ? addMonths(new Date(), 1) 
    : addYears(new Date(), 1);

  const subscription = {
    userId,
    plan,
    isActive: true,
    startDate: new Date().toISOString(),
    currentPeriodEnd: endDate.toISOString(),
    cancelAtPeriodEnd: false,
  };

  localStorage.setItem(`subscription_${userId}`, JSON.stringify(subscription));
  localStorage.setItem('dietwise_subscription', 'active');
};
```

## Testing

### Test Mode
- Use Stripe test API keys
- Test card: 4242 4242 4242 4242
- Any future expiry date
- Any 3-digit CVC
- Any billing ZIP code

### Demo Mode
The app includes a demo activation button for testing premium features without payment:
```typescript
<button onClick={() => activateSubscription('dietwise_user', 'monthly')}>
  Demo: Activate Premium
</button>
```

## Webhook Integration (Future)

### Required Webhooks
1. `checkout.session.completed` - Activate subscription
2. `invoice.payment_succeeded` - Renewal confirmation
3. `customer.subscription.deleted` - Handle cancellation
4. `invoice.payment_failed` - Payment failure handling

### Webhook Handler Example
```typescript
app.post('/webhook/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await activateUserSubscription(session.customer_email, session.subscription);
      break;
    // Handle other events...
  }

  res.json({ received: true });
});
```

## Security Considerations

1. **API Keys**
   - Never expose secret keys in frontend
   - Use environment variables
   - Rotate keys regularly

2. **Customer Data**
   - Don't store card details
   - Use Stripe Customer Portal for updates
   - Implement proper authentication

3. **Subscription Verification**
   - Always verify server-side in production
   - Don't trust client-side subscription status
   - Implement grace periods for failed payments

## Production Checklist

- [ ] Switch to live API keys
- [ ] Configure production success/cancel URLs
- [ ] Set up webhook endpoints
- [ ] Implement server-side subscription verification
- [ ] Set up Customer Portal
- [ ] Configure tax settings
- [ ] Set up email receipts
- [ ] Implement subscription analytics
- [ ] Create cancellation flow
- [ ] Add payment method update flow

## Support & Troubleshooting

### Common Issues
1. **"Stripe is not defined"** - Check API key configuration
2. **Checkout redirect fails** - Verify price IDs match
3. **Subscription not activating** - Check webhook configuration

### Debug Mode
```typescript
// Enable Stripe debug logging
if (process.env.NODE_ENV === 'development') {
  window.__STRIPE_LOG_LEVEL__ = 'debug';
}
```

### Customer Support Queries
Provide customer service with:
- Stripe Customer ID
- Subscription ID
- Last 4 digits of card
- Error messages/codes