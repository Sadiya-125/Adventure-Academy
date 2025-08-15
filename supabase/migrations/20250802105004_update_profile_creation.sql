-- Update profile creation trigger to handle class_level
-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create or replace the function to handle profile creation with class_level
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
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
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student'),
    CASE 
      WHEN (NEW.raw_user_meta_data->>'role')::public.user_role = 'student' 
      THEN COALESCE((NEW.raw_user_meta_data->>'class_level')::integer, 2)
      ELSE NULL
    END,
    60,
    420
  );
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 