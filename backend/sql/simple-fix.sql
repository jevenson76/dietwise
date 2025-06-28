-- Simple fix for users table - no test data
-- Run this in Supabase SQL Editor

-- Drop the problematic trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop and recreate the users table
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table without foreign key constraint initially
CREATE TABLE public.users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  locale TEXT DEFAULT 'en-US',
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint after table creation
ALTER TABLE public.users 
ADD CONSTRAINT users_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Create a simple trigger function that handles errors gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to insert user profile, ignore errors
  BEGIN
    INSERT INTO public.users (id, email, name, email_verified)
    VALUES (
      NEW.id,
      COALESCE(NEW.email, ''),
      COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
      COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log warning but don't fail authentication
      RAISE WARNING 'Could not create user profile: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions
GRANT ALL ON public.users TO anon, authenticated;

SELECT 'Users table setup complete!' as status;