-- Create the user_role enum type that's missing
CREATE TYPE public.user_role AS ENUM ('student', 'parent', 'admin');

-- Update the profiles table to use the proper enum type
ALTER TABLE public.profiles ALTER COLUMN role TYPE user_role USING role::user_role;

-- Update the handle_new_user function to properly handle the role conversion
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.email),
    COALESCE((new.raw_user_meta_data ->> 'role')::public.user_role, 'student'::public.user_role)
  );
  RETURN new;
END;
$function$;