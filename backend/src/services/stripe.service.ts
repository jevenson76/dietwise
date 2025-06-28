import Stripe from 'stripe';
import { logger } from '../utils/logger';
import { SubscriptionModel } from '../models/subscription.model';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-05-28.basil',
});

export interface CreateCheckoutSessionParams {
  userId: string;
  email: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreatePortalSessionParams {
  customerId: string;
  returnUrl: string;
}

export interface WebhookEvent {
  type: string;
  data: {
    object: any;
  };
}

class StripeService {
  /**
   * Create a Stripe customer for a user
   */
  async createCustomer(email: string, userId: string): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId,
        },
      });
      
      logger.info('Created Stripe customer', { customerId: customer.id, userId });
      return customer;
    } catch (error) {
      logger.error('Error creating Stripe customer', { error, userId });
      throw error;
    }
  }

  /**
   * Create a checkout session for subscription
   */
  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<Stripe.Checkout.Session> {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: params.priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        customer_email: params.email,
        client_reference_id: params.userId,
        metadata: {
          userId: params.userId,
        },
        subscription_data: {
          trial_period_days: 7, // 7-day free trial
          metadata: {
            userId: params.userId,
          },
        },
      });

      logger.info('Created checkout session', { sessionId: session.id, userId: params.userId });
      return session;
    } catch (error) {
      logger.error('Error creating checkout session', { error, userId: params.userId });
      throw error;
    }
  }

  /**
   * Create a customer portal session
   */
  async createPortalSession(params: CreatePortalSessionParams): Promise<Stripe.BillingPortal.Session> {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: params.customerId,
        return_url: params.returnUrl,
      });

      logger.info('Created portal session', { sessionId: session.id, customerId: params.customerId });
      return session;
    } catch (error) {
      logger.error('Error creating portal session', { error, customerId: params.customerId });
      throw error;
    }
  }

  /**
   * Get subscription by ID
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      logger.error('Error retrieving subscription', { error, subscriptionId });
      return null;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
    try {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      logger.info('Cancelled subscription', { subscriptionId });
      return subscription;
    } catch (error) {
      logger.error('Error cancelling subscription', { error, subscriptionId });
      return null;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    try {
      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      return event;
    } catch (error) {
      logger.error('Webhook signature verification failed', { error });
      throw error;
    }
  }

  /**
   * Handle subscription created/updated
   */
  async handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata.userId;
    
    if (!userId) {
      logger.error('No userId in subscription metadata', { subscriptionId: subscription.id });
      return;
    }

    // Determine plan type based on price ID
    const priceId = subscription.items.data[0]?.price.id;
    const planType = priceId === process.env.STRIPE_PRICE_ID_YEARLY ? 'yearly' : 'monthly';

    const subscriptionData = {
      user_id: userId,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      status: subscription.status as any,
      plan_type: planType as any,
      current_period_start: new Date((subscription as any).current_period_start * 1000),
      current_period_end: new Date((subscription as any).current_period_end * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
    };

    // Update user subscription in database
    const result = await SubscriptionModel.upsert(subscriptionData);
    
    if (result) {
      logger.info('Subscription updated in database', { userId, subscriptionId: subscription.id });
    } else {
      logger.error('Failed to update subscription in database', { userId, subscriptionId: subscription.id });
    }
  }

  /**
   * Handle subscription deleted
   */
  async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata.userId;
    
    if (!userId) {
      logger.error('No userId in subscription metadata', { subscriptionId: subscription.id });
      return;
    }

    // Update subscription status to canceled
    const result = await SubscriptionModel.updateStatus(userId, 'canceled');
    
    if (result) {
      logger.info('Subscription marked as canceled in database', { userId, subscriptionId: subscription.id });
    } else {
      logger.error('Failed to update subscription status in database', { userId, subscriptionId: subscription.id });
    }
  }

  /**
   * Handle successful payment
   */
  async handlePaymentSuccess(invoice: Stripe.Invoice): Promise<void> {
    const subscription = (invoice as any).subscription;
    
    if (!subscription) {
      return;
    }

    logger.info('Payment successful', { 
      invoiceId: invoice.id, 
      subscriptionId: subscription,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
    });
  }

  /**
   * Handle failed payment
   */
  async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const subscription = (invoice as any).subscription;
    
    if (!subscription) {
      return;
    }

    logger.warn('Payment failed', { 
      invoiceId: invoice.id, 
      subscriptionId: subscription,
      attemptCount: invoice.attempt_count,
    });

    // You might want to send an email to the user here
  }
}

export const stripeService = new StripeService();