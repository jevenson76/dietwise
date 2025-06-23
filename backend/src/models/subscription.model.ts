import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'incomplete';
  plan_type: 'monthly' | 'yearly';
  current_period_start: Date;
  current_period_end: Date;
  cancel_at_period_end: boolean;
  trial_end?: Date;
  created_at: Date;
  updated_at: Date;
}

export class SubscriptionModel {
  /**
   * Create or update a subscription
   */
  static async upsert(subscription: Partial<Subscription>): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert({
          ...subscription,
          updated_at: new Date(),
        })
        .select()
        .single();

      if (error) {
        logger.error('Error upserting subscription:', error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Error in subscription upsert:', error);
      return null;
    }
  }

  /**
   * Get subscription by user ID
   */
  static async getByUserId(userId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No subscription found
          return null;
        }
        logger.error('Error fetching subscription:', error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Error in getByUserId:', error);
      return null;
    }
  }

  /**
   * Get subscription by Stripe subscription ID
   */
  static async getByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('stripe_subscription_id', stripeSubscriptionId)
        .single();

      if (error) {
        logger.error('Error fetching subscription by stripe ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Error in getByStripeId:', error);
      return null;
    }
  }

  /**
   * Update subscription status
   */
  static async updateStatus(
    userId: string, 
    status: Subscription['status']
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          status,
          updated_at: new Date(),
        })
        .eq('user_id', userId);

      if (error) {
        logger.error('Error updating subscription status:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in updateStatus:', error);
      return false;
    }
  }

  /**
   * Delete subscription
   */
  static async delete(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', userId);

      if (error) {
        logger.error('Error deleting subscription:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in delete:', error);
      return false;
    }
  }

  /**
   * Check if user has active subscription
   */
  static async hasActiveSubscription(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getByUserId(userId);
      
      if (!subscription) {
        return false;
      }

      // Check if subscription is active and not expired
      const now = new Date();
      const isActive = subscription.status === 'active' || subscription.status === 'trialing';
      const notExpired = new Date(subscription.current_period_end) > now;

      return isActive && notExpired;
    } catch (error) {
      logger.error('Error checking active subscription:', error);
      return false;
    }
  }
}