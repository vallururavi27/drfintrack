-- Fix search path for update_account_balance_from_upi function
CREATE OR REPLACE FUNCTION public.update_account_balance_from_upi()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only update balance if account_id is provided
  IF NEW.account_id IS NOT NULL THEN
    IF NEW.transaction_type = 'received' THEN
      -- Add amount to account balance for received payments
      UPDATE bank_accounts 
      SET balance = balance + NEW.amount,
          updated_at = NOW()
      WHERE id = NEW.account_id;
    ELSIF NEW.transaction_type = 'sent' THEN
      -- Subtract amount from account balance for sent payments
      UPDATE bank_accounts 
      SET balance = balance - NEW.amount,
          updated_at = NOW()
      WHERE id = NEW.account_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix search path for handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create a profile for the new user
  INSERT INTO public.profiles (id, name, is_email_verified)
  VALUES (NEW.id, NEW.email, NEW.email_confirmed_at IS NOT NULL);
  
  -- Copy default categories for the new user
  INSERT INTO public.categories (user_id, name, type, color, icon, is_default)
  SELECT NEW.id, name, type, color, icon, true
  FROM public.default_categories;
  
  RETURN NEW;
END;
$$;
