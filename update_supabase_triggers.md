# Instructions for Updating Supabase Triggers

Follow these steps to update the database triggers in Supabase to use the correct column names:

1. Log in to your Supabase dashboard at https://bqurvqysmwsropdaqwot.supabase.co
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the following SQL code:

```sql
-- Update the function to use 'balance' instead of 'current_balance'
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
DECLARE
  amount_change DECIMAL(15, 2);
BEGIN
  -- For new transactions (INSERT)
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'income' THEN
      UPDATE bank_accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'expense' THEN
      UPDATE bank_accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
    END IF;
    
  -- For updated transactions (UPDATE)
  ELSIF TG_OP = 'UPDATE' THEN
    -- Calculate the change in amount
    IF NEW.type = OLD.type THEN
      -- Same transaction type, just amount changed
      IF NEW.type = 'income' THEN
        amount_change := NEW.amount - OLD.amount;
        UPDATE bank_accounts SET balance = balance + amount_change WHERE id = NEW.account_id;
      ELSIF NEW.type = 'expense' THEN
        amount_change := OLD.amount - NEW.amount;
        UPDATE bank_accounts SET balance = balance + amount_change WHERE id = NEW.account_id;
      END IF;
    ELSE
      -- Transaction type changed
      IF OLD.type = 'income' THEN
        -- Was income, now expense
        UPDATE bank_accounts SET balance = balance - OLD.amount - NEW.amount WHERE id = NEW.account_id;
      ELSIF OLD.type = 'expense' THEN
        -- Was expense, now income
        UPDATE bank_accounts SET balance = balance + OLD.amount + NEW.amount WHERE id = NEW.account_id;
      END IF;
    END IF;
    
  -- For deleted transactions (DELETE)
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type = 'income' THEN
      UPDATE bank_accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'expense' THEN
      UPDATE bank_accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Update the function to get account balances
CREATE OR REPLACE FUNCTION get_account_balances(
  p_user_id UUID
)
RETURNS TABLE (
  name TEXT,
  bank_name VARCHAR(255),
  account_type TEXT,
  balance DECIMAL(12, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ba.name,
    ba.bank_name,
    ba.account_type,
    ba.balance
  FROM bank_accounts ba
  WHERE ba.user_id = p_user_id
  ORDER BY ba.balance DESC;
END;
$$ LANGUAGE plpgsql;
```

5. Click "Run" to execute the SQL
6. Verify that the functions have been updated by checking the "Functions" section in the Supabase dashboard

## Testing the Changes

After updating the triggers, you should test that they work correctly:

1. Add a new bank account
2. Add a transaction (income or expense) to that account
3. Verify that the account balance is updated correctly
4. Update the transaction amount and verify the balance updates
5. Delete the transaction and verify the balance is restored

If you encounter any issues, check the Supabase logs for error messages.
