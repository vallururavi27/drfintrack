-- Add RLS policies for bank_accounts_duplicate table
CREATE POLICY "Users can view their own duplicate bank accounts" 
ON public.bank_accounts_duplicate FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own duplicate bank accounts" 
ON public.bank_accounts_duplicate FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own duplicate bank accounts" 
ON public.bank_accounts_duplicate FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own duplicate bank accounts" 
ON public.bank_accounts_duplicate FOR DELETE 
USING (auth.uid() = user_id);

-- Add RLS policies for default_categories table
-- This is a special case since default_categories is a template table
-- We'll allow authenticated users to view it, but only allow system/admin to modify it

-- Allow all authenticated users to view default categories
CREATE POLICY "All users can view default categories" 
ON public.default_categories FOR SELECT 
TO authenticated
USING (true);

-- Only allow service_role to insert/update/delete default categories
CREATE POLICY "Only service_role can insert default categories" 
ON public.default_categories FOR INSERT 
TO service_role
WITH CHECK (true);

CREATE POLICY "Only service_role can update default categories" 
ON public.default_categories FOR UPDATE 
TO service_role
USING (true);

CREATE POLICY "Only service_role can delete default categories" 
ON public.default_categories FOR DELETE 
TO service_role
USING (true);
