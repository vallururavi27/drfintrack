# Supabase Security Fixes

This document provides instructions for fixing the security warnings and suggestions identified in your Supabase project.

## 1. Fix Function Search Path Mutable Warnings

Two functions in your database have a security vulnerability related to search paths:
- `public.update_account_balance_from_upi`
- `public.handle_new_user`

### How to Fix:

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `fix_function_search_path.sql`
3. Run the SQL to update both functions with proper search path settings

This fix adds the `SET search_path = public` parameter to both functions, which prevents potential SQL injection attacks by ensuring the search path cannot be changed by the caller.

## 2. Enable Leaked Password Protection

Your Supabase Auth configuration isn't checking passwords against known leaked password databases.

### How to Fix:

1. Go to Authentication > Settings in your Supabase dashboard
2. Scroll down to "Password Security"
3. Enable the "Leaked Password Protection" option
4. Click "Save"

This will check new passwords against the HaveIBeenPwned.org database to prevent users from using compromised passwords.

## 3. Add RLS Policies for Tables with Missing Policies

You have Row Level Security enabled on these tables, but no policies defined:
- `public.bank_accounts_duplicate`
- `public.default_categories`

### How to Fix:

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `add_missing_rls_policies.sql`
3. Run the SQL to add appropriate RLS policies for both tables

This adds policies that:
- Allow users to access only their own data in `bank_accounts_duplicate`
- Allow all authenticated users to view default categories, but only service_role to modify them

## Verification

After applying these fixes:

1. Go to the "Database Health" section in your Supabase dashboard
2. Verify that the warnings and suggestions have been resolved
3. Test your application to ensure everything still works correctly

## Additional Security Recommendations

1. **Review All RLS Policies**: Ensure all tables have appropriate RLS policies
2. **Enable Two-Factor Authentication**: For your Supabase dashboard access
3. **Regularly Audit API Keys**: Rotate your API keys periodically
4. **Monitor Auth Logs**: Check for suspicious login attempts
