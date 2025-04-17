-- Check and fix the bank_accounts table schema
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- Check if account_name column exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'bank_accounts'
        AND column_name = 'account_name'
    ) INTO column_exists;

    -- If account_name exists but name doesn't, rename it
    IF column_exists THEN
        RAISE NOTICE 'Found account_name column, checking if name column exists...';
        
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'bank_accounts'
            AND column_name = 'name'
        ) INTO column_exists;
        
        IF NOT column_exists THEN
            RAISE NOTICE 'Renaming account_name to name...';
            ALTER TABLE bank_accounts RENAME COLUMN account_name TO name;
        ELSE
            RAISE NOTICE 'Both account_name and name columns exist. Migrating data...';
            -- Copy data from account_name to name if name is empty
            UPDATE bank_accounts
            SET name = account_name
            WHERE name IS NULL OR name = '';
            
            -- Drop the account_name column
            ALTER TABLE bank_accounts DROP COLUMN account_name;
        END IF;
    ELSE
        RAISE NOTICE 'account_name column does not exist, checking for name column...';
        
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'bank_accounts'
            AND column_name = 'name'
        ) INTO column_exists;
        
        IF NOT column_exists THEN
            RAISE NOTICE 'name column does not exist, adding it...';
            ALTER TABLE bank_accounts ADD COLUMN name TEXT NOT NULL DEFAULT '';
        ELSE
            RAISE NOTICE 'name column exists, no action needed.';
        END IF;
    END IF;

    -- Check if current_balance column exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'bank_accounts'
        AND column_name = 'current_balance'
    ) INTO column_exists;

    -- If current_balance exists but balance doesn't, rename it
    IF column_exists THEN
        RAISE NOTICE 'Found current_balance column, checking if balance column exists...';
        
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'bank_accounts'
            AND column_name = 'balance'
        ) INTO column_exists;
        
        IF NOT column_exists THEN
            RAISE NOTICE 'Renaming current_balance to balance...';
            ALTER TABLE bank_accounts RENAME COLUMN current_balance TO balance;
        ELSE
            RAISE NOTICE 'Both current_balance and balance columns exist. Migrating data...';
            -- Copy data from current_balance to balance if balance is empty or 0
            UPDATE bank_accounts
            SET balance = current_balance
            WHERE balance = 0;
            
            -- Drop the current_balance column
            ALTER TABLE bank_accounts DROP COLUMN current_balance;
        END IF;
    ELSE
        RAISE NOTICE 'current_balance column does not exist, checking for balance column...';
        
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'bank_accounts'
            AND column_name = 'balance'
        ) INTO column_exists;
        
        IF NOT column_exists THEN
            RAISE NOTICE 'balance column does not exist, adding it...';
            ALTER TABLE bank_accounts ADD COLUMN balance DECIMAL(12,2) DEFAULT 0;
        ELSE
            RAISE NOTICE 'balance column exists, no action needed.';
        END IF;
    END IF;

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

    RAISE NOTICE 'Schema check and fix completed.';
END $$;
