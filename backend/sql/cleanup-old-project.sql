-- Cleanup script for OLD Supabase project
-- Run this in the OLD project to remove DietWise tables
-- This is optional - you can skip this if you want to keep the old project

-- Drop all DietWise-related objects safely

-- Drop triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_health_profiles_updated_at ON public.health_profiles;
DROP TRIGGER IF EXISTS update_dietary_preferences_updated_at ON public.dietary_preferences;
DROP TRIGGER IF EXISTS update_meal_plans_updated_at ON public.meal_plans;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop policies (RLS)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
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

-- Drop tables (in order to handle dependencies)
DROP TABLE IF EXISTS public.user_analytics CASCADE;
DROP TABLE IF EXISTS public.food_logging CASCADE;
DROP TABLE IF EXISTS public.meal_plans CASCADE;
DROP TABLE IF EXISTS public.dietary_preferences CASCADE;
DROP TABLE IF EXISTS public.health_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Success message
SELECT 'DietWise tables cleaned up from old project!' as status;