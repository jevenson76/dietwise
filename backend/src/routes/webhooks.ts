import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-05-28.basil',
});

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Stripe webhook endpoint
router.post('/stripe', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    logger.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  logger.info('Received Stripe webhook:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
        break;
    }

    return res.json({ received: true });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  logger.info('Processing checkout completed:', session.id);
  
  try {
    // Get customer email from the session
    const customerEmail = session.customer_email || session.customer_details?.email;
    
    if (!customerEmail) {
      logger.error('No customer email found in checkout session');
      return;
    }

    // Update or create subscription record
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        customer_email: customerEmail,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'stripe_customer_id'
      });

    if (error) {
      logger.error('Error updating subscription:', error);
    } else {
      logger.info('Subscription updated successfully:', data);
    }

    // Send welcome email or trigger other actions
    await sendWelcomeEmail(customerEmail);
    
  } catch (error) {
    logger.error('Error in handleCheckoutCompleted:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  logger.info('Processing subscription created:', subscription.id);
  
  try {
    const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
    
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({
        stripe_customer_id: subscription.customer as string,
        stripe_subscription_id: subscription.id,
        customer_email: customer.email,
        status: subscription.status,
        current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'stripe_subscription_id'
      });

    if (error) {
      logger.error('Error creating subscription record:', error);
    } else {
      logger.info('Subscription created successfully:', data);
    }
  } catch (error) {
    logger.error('Error in handleSubscriptionCreated:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  logger.info('Processing subscription updated:', subscription.id);
  
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      logger.error('Error updating subscription:', error);
    } else {
      logger.info('Subscription updated successfully:', data);
    }
  } catch (error) {
    logger.error('Error in handleSubscriptionUpdated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  logger.info('Processing subscription deleted:', subscription.id);
  
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      logger.error('Error marking subscription as canceled:', error);
    } else {
      logger.info('Subscription marked as canceled:', data);
    }
  } catch (error) {
    logger.error('Error in handleSubscriptionDeleted:', error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  logger.info('Processing payment succeeded:', invoice.id);
  
  try {
    // Update subscription status to active if it was past due
    if ((invoice as any).subscription) {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', (invoice as any).subscription as string);

      if (error) {
        logger.error('Error updating subscription after payment:', error);
      } else {
        logger.info('Subscription reactivated after payment:', data);
      }
    }
  } catch (error) {
    logger.error('Error in handlePaymentSucceeded:', error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  logger.info('Processing payment failed:', invoice.id);
  
  try {
    // Update subscription status to past_due
    if ((invoice as any).subscription) {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', (invoice as any).subscription as string);

      if (error) {
        logger.error('Error updating subscription after failed payment:', error);
      } else {
        logger.info('Subscription marked as past due:', data);
      }
    }

    // Send payment failed notification
    const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer;
    if (customer.email) {
      await sendPaymentFailedEmail(customer.email, invoice);
    }
    
  } catch (error) {
    logger.error('Error in handlePaymentFailed:', error);
  }
}

async function sendWelcomeEmail(email: string) {
  // Implement welcome email logic here
  // This could use services like SendGrid, AWS SES, etc.
  logger.info(`Should send welcome email to: ${email}`);
}

async function sendPaymentFailedEmail(email: string, invoice: Stripe.Invoice) {
  // Implement payment failed email logic here
  logger.info(`Should send payment failed email to: ${email} for invoice: ${invoice.id}`);
}

export default router;