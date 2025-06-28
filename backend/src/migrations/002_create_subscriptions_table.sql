-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255) NOT NULL,
  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing', 'incomplete')),
  plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE
  ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add stripe_customer_id to users table if not exists
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

-- Create index on stripe_customer_id in users table
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON auth.users(stripe_customer_id);

-- RLS Policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update/delete subscriptions
CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');