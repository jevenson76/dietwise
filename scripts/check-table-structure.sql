-- Check the actual column names in your tables
-- Run this in Supabase SQL Editor to see the structure

-- Check users table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Check health_profiles table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'health_profiles'
ORDER BY ordinal_position;

-- Check dietary_preferences table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'dietary_preferences'
ORDER BY ordinal_position;

-- Check meal_plans table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'meal_plans'
ORDER BY ordinal_position;

-- Check food_logging table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'food_logging'
ORDER BY ordinal_position;

-- Check user_analytics table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'user_analytics'
ORDER BY ordinal_position;

-- Check dietwise_users table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'dietwise_users'
ORDER BY ordinal_position;

-- Check dietwise_health_profiles table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'dietwise_health_profiles'
ORDER BY ordinal_position;

-- Check dietwise_dietary_preferences table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'dietwise_dietary_preferences'
ORDER BY ordinal_position;

-- Check dietwise_meal_plans table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'dietwise_meal_plans'
ORDER BY ordinal_position;

-- Check dietwise_food_logging table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'dietwise_food_logging'
ORDER BY ordinal_position;

-- Check dietwise_user_analytics table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'dietwise_user_analytics'
ORDER BY ordinal_position;

-- Also check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;