-- DietWise Database Schema for Supabase (Safe Version)
-- This file handles existing objects and won't error if they already exist

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET row_security = on;

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
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
CREATE TABLE IF NOT EXISTS public.health_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  encrypted_data TEXT NOT NULL, -- JSON data encrypted with AES-256-GCM
  data_key TEXT NOT NULL, -- Encrypted key for the data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dietary_preferences table
CREATE TABLE IF NOT EXISTS public.dietary_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  dietary_restrictions JSONB DEFAULT '[]', -- allergies, intolerances
  food_preferences JSONB DEFAULT '{}', -- likes, dislikes
  nutrition_goals JSONB DEFAULT '{}', -- calories, macros
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meal_plans table
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  meals JSONB NOT NULL, -- structured meal data
  nutrition_summary JSONB, -- calculated nutrition
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create food_logging table
CREATE TABLE IF NOT EXISTS public.food_logging (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_items JSONB NOT NULL, -- array of food items with quantities
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL,
  nutrition_data JSONB, -- calculated nutrition for this meal
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_analytics table
CREATE TABLE IF NOT EXISTS public.user_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  metrics JSONB NOT NULL, -- daily metrics like calories, steps, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create updated_at trigger function (safe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist and recreate them
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_health_profiles_updated_at ON public.health_profiles;
DROP TRIGGER IF EXISTS update_dietary_preferences_updated_at ON public.dietary_preferences;
DROP TRIGGER IF EXISTS update_meal_plans_updated_at ON public.meal_plans;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_profiles_updated_at 
  BEFORE UPDATE ON public.health_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dietary_preferences_updated_at 
  BEFORE UPDATE ON public.dietary_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at 
  BEFORE UPDATE ON public.meal_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) safely
DO $$ 
BEGIN
  ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ignore if already enabled
END $$;

DO $$ 
BEGIN
  ALTER TABLE public.health_profiles ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$ 
BEGIN
  ALTER TABLE public.dietary_preferences ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$ 
BEGIN
  ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$ 
BEGIN
  ALTER TABLE public.food_logging ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$ 
BEGIN
  ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own health data" ON public.health_profiles;
DROP POLICY IF EXISTS "Users can insert own health data" ON public.health_profiles;
DROP POLICY IF EXISTS "Users can update own health data" ON public.health_profiles;
DROP POLICY IF EXISTS "Users can delete own health data" ON public.health_profiles;
DROP POLICY IF EXISTS "Users can view own dietary preferences" ON public.dietary_preferences;
DROP POLICY IF EXISTS "Users can insert own dietary preferences" ON public.dietary_preferences;
DROP POLICY IF EXISTS "Users can update own dietary preferences" ON public.dietary_preferences;
DROP POLICY IF EXISTS "Users can delete own dietary preferences" ON public.dietary_preferences;
DROP POLICY IF EXISTS "Users can view own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can insert own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can update own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can delete own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can view own food logs" ON public.food_logging;
DROP POLICY IF EXISTS "Users can insert own food logs" ON public.food_logging;
DROP POLICY IF EXISTS "Users can update own food logs" ON public.food_logging;
DROP POLICY IF EXISTS "Users can delete own food logs" ON public.food_logging;
DROP POLICY IF EXISTS "Users can view own analytics" ON public.user_analytics;
DROP POLICY IF EXISTS "Users can insert own analytics" ON public.user_analytics;
DROP POLICY IF EXISTS "Users can update own analytics" ON public.user_analytics;
DROP POLICY IF EXISTS "Users can delete own analytics" ON public.user_analytics;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own health data" ON public.health_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health data" ON public.health_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own health data" ON public.health_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own health data" ON public.health_profiles FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own dietary preferences" ON public.dietary_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own dietary preferences" ON public.dietary_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own dietary preferences" ON public.dietary_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own dietary preferences" ON public.dietary_preferences FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own meal plans" ON public.meal_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meal plans" ON public.meal_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meal plans" ON public.meal_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meal plans" ON public.meal_plans FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own food logs" ON public.food_logging FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own food logs" ON public.food_logging FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own food logs" ON public.food_logging FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own food logs" ON public.food_logging FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own analytics" ON public.user_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics" ON public.user_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own analytics" ON public.user_analytics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own analytics" ON public.user_analytics FOR DELETE USING (auth.uid() = user_id);

-- Indexes for better performance (create if not exists)
DO $$ 
BEGIN
  CREATE INDEX IF NOT EXISTS idx_health_profiles_user_id ON public.health_profiles(user_id);
  CREATE INDEX IF NOT EXISTS idx_dietary_preferences_user_id ON public.dietary_preferences(user_id);
  CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON public.meal_plans(user_id);
  CREATE INDEX IF NOT EXISTS idx_meal_plans_active ON public.meal_plans(user_id, is_active) WHERE is_active = true;
  CREATE INDEX IF NOT EXISTS idx_food_logging_user_id ON public.food_logging(user_id);
  CREATE INDEX IF NOT EXISTS idx_food_logging_date ON public.food_logging(user_id, logged_at);
  CREATE INDEX IF NOT EXISTS idx_user_analytics_user_date ON public.user_analytics(user_id, date);
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ignore if indexes already exist
END $$;

-- Functions for user registration (called by trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email_confirmed_at IS NOT NULL
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(NEW.raw_user_meta_data->>'name', users.name),
    email_verified = NEW.email_confirmed_at IS NOT NULL,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'DietWise database schema created successfully!';
END $$;