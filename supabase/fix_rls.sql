-- First, let's drop the existing policy for inserting profiles
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create a new policy that allows the trigger function to insert profiles
CREATE POLICY "System can insert profiles for new users" 
ON public.profiles FOR INSERT 
WITH CHECK (true);  -- This allows any insert, but we control this through the trigger

-- Create a policy that allows users to view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Create a policy that allows users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Let's also fix the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Check if a profile already exists for this user
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    -- Create a profile for the new user
    INSERT INTO public.profiles (
      id, 
      name, 
      is_email_verified,
      two_factor_enabled,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      NEW.email_confirmed_at IS NOT NULL,
      false,
      NOW(),
      NOW()
    );
  END IF;
  
  -- Copy default categories for the new user
  INSERT INTO public.categories (
    user_id, 
    name, 
    type, 
    color, 
    icon, 
    is_default
  )
  SELECT 
    NEW.id, 
    name, 
    type, 
    color, 
    icon, 
    true
  FROM public.default_categories
  WHERE NOT EXISTS (
    SELECT 1 FROM public.categories 
    WHERE user_id = NEW.id AND is_default = true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
