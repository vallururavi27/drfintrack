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
