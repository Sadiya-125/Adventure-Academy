-- Fix RLS policies for profiles table to prevent infinite recursion
-- First, disable RLS temporarily to clean up
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;

-- Create simple, non-recursive RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for admins to read all profiles (optional)
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for admins to update all profiles (optional)
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create RPC function to create user profiles (bypasses RLS)
CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_user_id uuid,
  p_email text,
  p_full_name text,
  p_role public.user_role DEFAULT 'student',
  p_class_level integer DEFAULT 2,
  p_daily_time_limit integer DEFAULT 60,
  p_weekly_time_limit integer DEFAULT 420
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_profile public.profiles;
BEGIN
  INSERT INTO public.profiles (
    user_id,
    email,
    full_name,
    role,
    class_level,
    daily_time_limit,
    weekly_time_limit
  ) VALUES (
    p_user_id,
    p_email,
    p_full_name,
    p_role,
    p_class_level,
    p_daily_time_limit,
    p_weekly_time_limit
  ) RETURNING * INTO new_profile;
  
  RETURN row_to_json(new_profile);
END;
$$; 