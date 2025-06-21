-- DietWise Safe Fresh Project Setup
-- Run this in your NEW Supabase project: ozuuombybpfluztjvzdc
-- This avoids conflicts with existing objects

-- Enable Row Level Security globally
ALTER DATABASE postgres SET row_security = on;

-- Create DietWise-specific updated_at function (separate from existing one)
CREATE OR REPLACE FUNCTION dietwise_update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.dietwise_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  locale TEXT DEFAULT 'en-US',
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create health_profiles table for encrypted health data
CREATE TABLE IF NOT EXISTS public.dietwise_health_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.dietwise_users(id) ON DELETE CASCADE NOT NULL,
  encrypted_data TEXT NOT NULL,
  data_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dietary_preferences table
CREATE TABLE IF NOT EXISTS public.dietwise_dietary_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.dietwise_users(id) ON DELETE CASCADE NOT NULL,
  dietary_restrictions JSONB DEFAULT '[]',
  food_preferences JSONB DEFAULT '{}',
  nutrition_goals JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meal_plans table
CREATE TABLE IF NOT EXISTS public.dietwise_meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.dietwise_users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  meals JSONB NOT NULL,
  nutrition_summary JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create food_logging table
CREATE TABLE IF NOT EXISTS public.dietwise_food_logging (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.dietwise_users(id) ON DELETE CASCADE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_items JSONB NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL,
  nutrition_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_analytics table
CREATE TABLE IF NOT EXISTS public.dietwise_user_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.dietwise_users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  metrics JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Drop existing DietWise triggers if they exist
DROP TRIGGER IF EXISTS dietwise_update_users_updated_at ON public.dietwise_users;
DROP TRIGGER IF EXISTS dietwise_update_health_profiles_updated_at ON public.dietwise_health_profiles;
DROP TRIGGER IF EXISTS dietwise_update_dietary_preferences_updated_at ON public.dietwise_dietary_preferences;
DROP TRIGGER IF EXISTS dietwise_update_meal_plans_updated_at ON public.dietwise_meal_plans;

-- Add updated_at triggers with DietWise prefix
CREATE TRIGGER dietwise_update_users_updated_at 
  BEFORE UPDATE ON public.dietwise_users 
  FOR EACH ROW EXECUTE FUNCTION dietwise_update_updated_at_column();

CREATE TRIGGER dietwise_update_health_profiles_updated_at 
  BEFORE UPDATE ON public.dietwise_health_profiles 
  FOR EACH ROW EXECUTE FUNCTION dietwise_update_updated_at_column();

CREATE TRIGGER dietwise_update_dietary_preferences_updated_at 
  BEFORE UPDATE ON public.dietwise_dietary_preferences 
  FOR EACH ROW EXECUTE FUNCTION dietwise_update_updated_at_column();

CREATE TRIGGER dietwise_update_meal_plans_updated_at 
  BEFORE UPDATE ON public.dietwise_meal_plans 
  FOR EACH ROW EXECUTE FUNCTION dietwise_update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.dietwise_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dietwise_health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dietwise_dietary_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dietwise_meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dietwise_food_logging ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dietwise_user_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "DietWise users can view own profile" ON public.dietwise_users;
DROP POLICY IF EXISTS "DietWise users can update own profile" ON public.dietwise_users;
DROP POLICY IF EXISTS "DietWise users can insert own profile" ON public.dietwise_users;
DROP POLICY IF EXISTS "DietWise users can view own health data" ON public.dietwise_health_profiles;
DROP POLICY IF EXISTS "DietWise users can insert own health data" ON public.dietwise_health_profiles;
DROP POLICY IF EXISTS "DietWise users can update own health data" ON public.dietwise_health_profiles;
DROP POLICY IF EXISTS "DietWise users can delete own health data" ON public.dietwise_health_profiles;
DROP POLICY IF EXISTS "DietWise users can view own dietary preferences" ON public.dietwise_dietary_preferences;
DROP POLICY IF EXISTS "DietWise users can insert own dietary preferences" ON public.dietwise_dietary_preferences;
DROP POLICY IF EXISTS "DietWise users can update own dietary preferences" ON public.dietwise_dietary_preferences;
DROP POLICY IF EXISTS "DietWise users can delete own dietary preferences" ON public.dietwise_dietary_preferences;
DROP POLICY IF EXISTS "DietWise users can view own meal plans" ON public.dietwise_meal_plans;
DROP POLICY IF EXISTS "DietWise users can insert own meal plans" ON public.dietwise_meal_plans;
DROP POLICY IF EXISTS "DietWise users can update own meal plans" ON public.dietwise_meal_plans;
DROP POLICY IF EXISTS "DietWise users can delete own meal plans" ON public.dietwise_meal_plans;
DROP POLICY IF EXISTS "DietWise users can view own food logs" ON public.dietwise_food_logging;
DROP POLICY IF EXISTS "DietWise users can insert own food logs" ON public.dietwise_food_logging;
DROP POLICY IF EXISTS "DietWise users can update own food logs" ON public.dietwise_food_logging;
DROP POLICY IF EXISTS "DietWise users can delete own food logs" ON public.dietwise_food_logging;
DROP POLICY IF EXISTS "DietWise users can view own analytics" ON public.dietwise_user_analytics;
DROP POLICY IF EXISTS "DietWise users can insert own analytics" ON public.dietwise_user_analytics;
DROP POLICY IF EXISTS "DietWise users can update own analytics" ON public.dietwise_user_analytics;
DROP POLICY IF EXISTS "DietWise users can delete own analytics" ON public.dietwise_user_analytics;

-- Create RLS Policies with DietWise prefix
CREATE POLICY "DietWise users can view own profile" ON public.dietwise_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "DietWise users can update own profile" ON public.dietwise_users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "DietWise users can insert own profile" ON public.dietwise_users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "DietWise users can view own health data" ON public.dietwise_health_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "DietWise users can insert own health data" ON public.dietwise_health_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "DietWise users can update own health data" ON public.dietwise_health_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "DietWise users can delete own health data" ON public.dietwise_health_profiles FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "DietWise users can view own dietary preferences" ON public.dietwise_dietary_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "DietWise users can insert own dietary preferences" ON public.dietwise_dietary_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "DietWise users can update own dietary preferences" ON public.dietwise_dietary_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "DietWise users can delete own dietary preferences" ON public.dietwise_dietary_preferences FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "DietWise users can view own meal plans" ON public.dietwise_meal_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "DietWise users can insert own meal plans" ON public.dietwise_meal_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "DietWise users can update own meal plans" ON public.dietwise_meal_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "DietWise users can delete own meal plans" ON public.dietwise_meal_plans FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "DietWise users can view own food logs" ON public.dietwise_food_logging FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "DietWise users can insert own food logs" ON public.dietwise_food_logging FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "DietWise users can update own food logs" ON public.dietwise_food_logging FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "DietWise users can delete own food logs" ON public.dietwise_food_logging FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "DietWise users can view own analytics" ON public.dietwise_user_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "DietWise users can insert own analytics" ON public.dietwise_user_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "DietWise users can update own analytics" ON public.dietwise_user_analytics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "DietWise users can delete own analytics" ON public.dietwise_user_analytics FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance with DietWise prefix
CREATE INDEX IF NOT EXISTS idx_dietwise_health_profiles_user_id ON public.dietwise_health_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_dietwise_dietary_preferences_user_id ON public.dietwise_dietary_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_dietwise_meal_plans_user_id ON public.dietwise_meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_dietwise_meal_plans_active ON public.dietwise_meal_plans(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_dietwise_food_logging_user_id ON public.dietwise_food_logging(user_id);
CREATE INDEX IF NOT EXISTS idx_dietwise_food_logging_date ON public.dietwise_food_logging(user_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_dietwise_user_analytics_user_date ON public.dietwise_user_analytics(user_id, date);

-- Drop existing DietWise trigger and function
DROP TRIGGER IF EXISTS dietwise_on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.dietwise_handle_new_user();

-- Create user profile trigger with DietWise prefix
CREATE OR REPLACE FUNCTION public.dietwise_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.dietwise_users (id, email, name, email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email_confirmed_at IS NOT NULL
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(NEW.raw_user_meta_data->>'name', dietwise_users.name),
    email_verified = NEW.email_confirmed_at IS NOT NULL,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user registration with DietWise prefix
CREATE TRIGGER dietwise_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.dietwise_handle_new_user();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.dietwise_users TO anon, authenticated;
GRANT ALL ON public.dietwise_health_profiles TO anon, authenticated;
GRANT ALL ON public.dietwise_dietary_preferences TO anon, authenticated;
GRANT ALL ON public.dietwise_meal_plans TO anon, authenticated;
GRANT ALL ON public.dietwise_food_logging TO anon, authenticated;
GRANT ALL ON public.dietwise_user_analytics TO anon, authenticated;

-- Success message
SELECT 'DietWise safe fresh project setup complete! 🚀' as status,
       'Tables: dietwise_users, dietwise_health_profiles, dietwise_dietary_preferences, dietwise_meal_plans, dietwise_food_logging, dietwise_user_analytics' as tables_created,
       'RLS enabled with user-specific policies' as security,
       'Auto user profile creation trigger installed (prefixed)' as automation,
       'No conflicts with existing project objects' as compatibility;