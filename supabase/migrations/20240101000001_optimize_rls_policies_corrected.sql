-- Optimize RLS policies to prevent auth functions from being re-evaluated for each row
-- CORRECTED VERSION: Using proper column names

-- Drop and recreate policies for users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (id = (SELECT auth.uid()));

-- Drop and recreate policies for health_profiles table
DROP POLICY IF EXISTS "Users can view own health data" ON public.health_profiles;
DROP POLICY IF EXISTS "Users can insert own health data" ON public.health_profiles;
DROP POLICY IF EXISTS "Users can update own health data" ON public.health_profiles;
DROP POLICY IF EXISTS "Users can delete own health data" ON public.health_profiles;

CREATE POLICY "Users can view own health data" ON public.health_profiles
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own health data" ON public.health_profiles
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own health data" ON public.health_profiles
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own health data" ON public.health_profiles
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- Drop and recreate policies for dietary_preferences table
DROP POLICY IF EXISTS "Users can view own dietary preferences" ON public.dietary_preferences;
DROP POLICY IF EXISTS "Users can insert own dietary preferences" ON public.dietary_preferences;
DROP POLICY IF EXISTS "Users can update own dietary preferences" ON public.dietary_preferences;
DROP POLICY IF EXISTS "Users can delete own dietary preferences" ON public.dietary_preferences;

CREATE POLICY "Users can view own dietary preferences" ON public.dietary_preferences
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own dietary preferences" ON public.dietary_preferences
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own dietary preferences" ON public.dietary_preferences
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own dietary preferences" ON public.dietary_preferences
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- Drop and recreate policies for meal_plans table
DROP POLICY IF EXISTS "Users can view own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can insert own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can update own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can delete own meal plans" ON public.meal_plans;

CREATE POLICY "Users can view own meal plans" ON public.meal_plans
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own meal plans" ON public.meal_plans
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own meal plans" ON public.meal_plans
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own meal plans" ON public.meal_plans
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- Drop and recreate policies for food_logging table
DROP POLICY IF EXISTS "Users can view own food logs" ON public.food_logging;
DROP POLICY IF EXISTS "Users can insert own food logs" ON public.food_logging;
DROP POLICY IF EXISTS "Users can update own food logs" ON public.food_logging;
DROP POLICY IF EXISTS "Users can delete own food logs" ON public.food_logging;

CREATE POLICY "Users can view own food logs" ON public.food_logging
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own food logs" ON public.food_logging
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own food logs" ON public.food_logging
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own food logs" ON public.food_logging
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- Drop and recreate policies for user_analytics table
DROP POLICY IF EXISTS "Users can view own analytics" ON public.user_analytics;
DROP POLICY IF EXISTS "Users can insert own analytics" ON public.user_analytics;
DROP POLICY IF EXISTS "Users can update own analytics" ON public.user_analytics;
DROP POLICY IF EXISTS "Users can delete own analytics" ON public.user_analytics;

CREATE POLICY "Users can view own analytics" ON public.user_analytics
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own analytics" ON public.user_analytics
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own analytics" ON public.user_analytics
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own analytics" ON public.user_analytics
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- Drop and recreate policies for dietwise_users table
DROP POLICY IF EXISTS "DietWise users can view own profile" ON public.dietwise_users;
DROP POLICY IF EXISTS "DietWise users can update own profile" ON public.dietwise_users;
DROP POLICY IF EXISTS "DietWise users can insert own profile" ON public.dietwise_users;

CREATE POLICY "DietWise users can view own profile" ON public.dietwise_users
  FOR SELECT USING (id = (SELECT auth.uid()));

CREATE POLICY "DietWise users can update own profile" ON public.dietwise_users
  FOR UPDATE USING (id = (SELECT auth.uid()));

CREATE POLICY "DietWise users can insert own profile" ON public.dietwise_users
  FOR INSERT WITH CHECK (id = (SELECT auth.uid()));

-- Drop and recreate policies for dietwise_health_profiles table
DROP POLICY IF EXISTS "DietWise users can view own health data" ON public.dietwise_health_profiles;
DROP POLICY IF EXISTS "DietWise users can insert own health data" ON public.dietwise_health_profiles;
DROP POLICY IF EXISTS "DietWise users can update own health data" ON public.dietwise_health_profiles;
DROP POLICY IF EXISTS "DietWise users can delete own health data" ON public.dietwise_health_profiles;

CREATE POLICY "DietWise users can view own health data" ON public.dietwise_health_profiles
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "DietWise users can insert own health data" ON public.dietwise_health_profiles
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "DietWise users can update own health data" ON public.dietwise_health_profiles
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "DietWise users can delete own health data" ON public.dietwise_health_profiles
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- Drop and recreate policies for dietwise_dietary_preferences table
DROP POLICY IF EXISTS "DietWise users can view own dietary preferences" ON public.dietwise_dietary_preferences;
DROP POLICY IF EXISTS "DietWise users can insert own dietary preferences" ON public.dietwise_dietary_preferences;
DROP POLICY IF EXISTS "DietWise users can update own dietary preferences" ON public.dietwise_dietary_preferences;
DROP POLICY IF EXISTS "DietWise users can delete own dietary preferences" ON public.dietwise_dietary_preferences;

CREATE POLICY "DietWise users can view own dietary preferences" ON public.dietwise_dietary_preferences
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "DietWise users can insert own dietary preferences" ON public.dietwise_dietary_preferences
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "DietWise users can update own dietary preferences" ON public.dietwise_dietary_preferences
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "DietWise users can delete own dietary preferences" ON public.dietwise_dietary_preferences
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- Drop and recreate policies for dietwise_meal_plans table
DROP POLICY IF EXISTS "DietWise users can view own meal plans" ON public.dietwise_meal_plans;
DROP POLICY IF EXISTS "DietWise users can insert own meal plans" ON public.dietwise_meal_plans;
DROP POLICY IF EXISTS "DietWise users can update own meal plans" ON public.dietwise_meal_plans;
DROP POLICY IF EXISTS "DietWise users can delete own meal plans" ON public.dietwise_meal_plans;

CREATE POLICY "DietWise users can view own meal plans" ON public.dietwise_meal_plans
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "DietWise users can insert own meal plans" ON public.dietwise_meal_plans
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "DietWise users can update own meal plans" ON public.dietwise_meal_plans
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "DietWise users can delete own meal plans" ON public.dietwise_meal_plans
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- Drop and recreate policies for dietwise_food_logging table
DROP POLICY IF EXISTS "DietWise users can view own food logs" ON public.dietwise_food_logging;
DROP POLICY IF EXISTS "DietWise users can insert own food logs" ON public.dietwise_food_logging;
DROP POLICY IF EXISTS "DietWise users can update own food logs" ON public.dietwise_food_logging;
DROP POLICY IF EXISTS "DietWise users can delete own food logs" ON public.dietwise_food_logging;

CREATE POLICY "DietWise users can view own food logs" ON public.dietwise_food_logging
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "DietWise users can insert own food logs" ON public.dietwise_food_logging
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "DietWise users can update own food logs" ON public.dietwise_food_logging
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "DietWise users can delete own food logs" ON public.dietwise_food_logging
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- Drop and recreate policies for dietwise_user_analytics table
DROP POLICY IF EXISTS "DietWise users can view own analytics" ON public.dietwise_user_analytics;
DROP POLICY IF EXISTS "DietWise users can insert own analytics" ON public.dietwise_user_analytics;
DROP POLICY IF EXISTS "DietWise users can update own analytics" ON public.dietwise_user_analytics;
DROP POLICY IF EXISTS "DietWise users can delete own analytics" ON public.dietwise_user_analytics;

CREATE POLICY "DietWise users can view own analytics" ON public.dietwise_user_analytics
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "DietWise users can insert own analytics" ON public.dietwise_user_analytics
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "DietWise users can update own analytics" ON public.dietwise_user_analytics
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "DietWise users can delete own analytics" ON public.dietwise_user_analytics
  FOR DELETE USING (user_id = (SELECT auth.uid()));