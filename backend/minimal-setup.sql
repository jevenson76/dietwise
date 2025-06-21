-- MINIMAL SETUP - Copy and paste this entire script into Supabase SQL Editor
-- Project: ozuuombybpfluztjvzdc

-- Create users table
CREATE TABLE IF NOT EXISTS public.dietwise_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.dietwise_users ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view own profile" ON public.dietwise_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.dietwise_users FOR INSERT WITH CHECK (auth.uid() = id);

-- Create trigger function
CREATE OR REPLACE FUNCTION public.dietwise_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.dietwise_users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'User'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS dietwise_on_auth_user_created ON auth.users;
CREATE TRIGGER dietwise_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.dietwise_handle_new_user();

-- Grant permissions
GRANT ALL ON public.dietwise_users TO anon, authenticated;

SELECT 'DietWise minimal setup complete!' as status;