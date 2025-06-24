const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Stripe webhook endpoint
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Received Stripe webhook:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

async function handleCheckoutCompleted(session) {
  console.log('Processing checkout completed:', session.id);
  
  try {
    // Get customer email from the session
    const customerEmail = session.customer_email || session.customer_details?.email;
    
    if (!customerEmail) {
      console.error('No customer email found in checkout session');
      return;
    }

    // Update or create subscription record
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        customer_email: customerEmail,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'stripe_customer_id'
      });

    if (error) {
      console.error('Error updating subscription:', error);
    } else {
      console.log('Subscription updated successfully:', data);
    }

    // Send welcome email or trigger other actions
    await sendWelcomeEmail(customerEmail);
    
  } catch (error) {
    console.error('Error in handleCheckoutCompleted:', error);
  }
}

async function handleSubscriptionCreated(subscription) {
  console.log('Processing subscription created:', subscription.id);
  
  try {
    const customer = await stripe.customers.retrieve(subscription.customer);
    
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({
        stripe_customer_id: subscription.customer,
        stripe_subscription_id: subscription.id,
        customer_email: customer.email,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'stripe_subscription_id'
      });

    if (error) {
      console.error('Error creating subscription record:', error);
    } else {
      console.log('Subscription created successfully:', data);
    }
  } catch (error) {
    console.error('Error in handleSubscriptionCreated:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  console.log('Processing subscription updated:', subscription.id);
  
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Error updating subscription:', error);
    } else {
      console.log('Subscription updated successfully:', data);
    }
  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  console.log('Processing subscription deleted:', subscription.id);
  
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Error marking subscription as canceled:', error);
    } else {
      console.log('Subscription marked as canceled:', data);
    }
  } catch (error) {
    console.error('Error in handleSubscriptionDeleted:', error);
  }
}

async function handlePaymentSucceeded(invoice) {
  console.log('Processing payment succeeded:', invoice.id);
  
  try {
    // Update subscription status to active if it was past due
    if (invoice.subscription) {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', invoice.subscription);

      if (error) {
        console.error('Error updating subscription after payment:', error);
      } else {
        console.log('Subscription reactivated after payment:', data);
      }
    }
  } catch (error) {
    console.error('Error in handlePaymentSucceeded:', error);
  }
}

async function handlePaymentFailed(invoice) {
  console.log('Processing payment failed:', invoice.id);
  
  try {
    // Update subscription status to past_due
    if (invoice.subscription) {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', invoice.subscription);

      if (error) {
        console.error('Error updating subscription after failed payment:', error);
      } else {
        console.log('Subscription marked as past due:', data);
      }
    }

    // Send payment failed notification
    const customer = await stripe.customers.retrieve(invoice.customer);
    await sendPaymentFailedEmail(customer.email, invoice);
    
  } catch (error) {
    console.error('Error in handlePaymentFailed:', error);
  }
}

async function sendWelcomeEmail(email) {
  // Implement welcome email logic here
  // This could use services like SendGrid, AWS SES, etc.
  console.log(`Should send welcome email to: ${email}`);
}

async function sendPaymentFailedEmail(email, invoice) {
  // Implement payment failed email logic here
  console.log(`Should send payment failed email to: ${email} for invoice: ${invoice.id}`);
}

module.exports = router;