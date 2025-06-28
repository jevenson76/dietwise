import { Request, Response } from 'express';
import Stripe from 'stripe';
import { stripeService } from '../services/stripe.service';
import { logger } from '../utils/logger';

export class StripeController {
  /**
   * Create a checkout session
   */
  async createCheckoutSession(req: Request, res: Response): Promise<void> {
    try {
      const { priceId, successUrl, cancelUrl } = req.body;
      const userId = req.user?.id;
      const email = req.user?.email;

      if (!userId || !email) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!priceId || !successUrl || !cancelUrl) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }

      const session = await stripeService.createCheckoutSession({
        userId,
        email,
        priceId,
        successUrl,
        cancelUrl,
      });

      res.json({ 
        sessionId: session.id,
        url: session.url,
      });
    } catch (error) {
      logger.error('Error creating checkout session', { error });
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  }

  /**
   * Create a customer portal session
   */
  async createPortalSession(req: Request, res: Response): Promise<void> {
    try {
      const { returnUrl } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Get user's Stripe customer ID from database
      // For now, we'll assume it's stored in req.user
      const customerId = req.user?.stripeCustomerId;

      if (!customerId) {
        res.status(400).json({ error: 'No subscription found' });
        return;
      }

      const session = await stripeService.createPortalSession({
        customerId,
        returnUrl: returnUrl || process.env.FRONTEND_URL || 'http://localhost:3000',
      });

      res.json({ url: session.url });
    } catch (error) {
      logger.error('Error creating portal session', { error });
      res.status(500).json({ error: 'Failed to create portal session' });
    }
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Get subscription from database
      // For now, return mock data
      const subscription = {
        active: false,
        plan: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };

      res.json({ subscription });
    } catch (error) {
      logger.error('Error getting subscription status', { error });
      res.status(500).json({ error: 'Failed to get subscription status' });
    }
  }

  /**
   * Handle Stripe webhooks
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      res.status(400).json({ error: 'Missing stripe-signature header' });
      return;
    }

    try {
      // Verify webhook signature
      const event = stripeService.verifyWebhookSignature(
        req.body,
        signature
      );

      // Handle the event
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await stripeService.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await stripeService.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_succeeded':
          await stripeService.handlePaymentSuccess(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await stripeService.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        case 'checkout.session.completed':
          // Handle successful checkout
          const session = event.data.object as Stripe.Checkout.Session;
          logger.info('Checkout session completed', { 
            sessionId: session.id,
            customerId: session.customer,
            subscriptionId: session.subscription,
          });
          break;

        default:
          logger.info('Unhandled webhook event type', { type: event.type });
      }

      // Return a 200 response to acknowledge receipt of the event
      res.json({ received: true });
    } catch (error) {
      logger.error('Webhook error', { error });
      res.status(400).json({ error: 'Webhook error' });
    }
  }
}

export const stripeController = new StripeController();