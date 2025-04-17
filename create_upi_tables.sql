-- Create UPI transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS upi_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
  transaction_ref_id VARCHAR(255),
  upi_id VARCHAR(255) NOT NULL,
  counterparty_upi_id VARCHAR(255),
  counterparty_name VARCHAR(255),
  amount DECIMAL(15, 2) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('sent', 'received', 'failed')),
  status VARCHAR(20) NOT NULL DEFAULT 'completed',
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS if not already enabled
ALTER TABLE upi_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS select_upi_transactions ON upi_transactions;
DROP POLICY IF EXISTS insert_upi_transactions ON upi_transactions;
DROP POLICY IF EXISTS update_upi_transactions ON upi_transactions;
DROP POLICY IF EXISTS delete_upi_transactions ON upi_transactions;

-- Create policies
CREATE POLICY select_upi_transactions ON upi_transactions
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY insert_upi_transactions ON upi_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY update_upi_transactions ON upi_transactions
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY delete_upi_transactions ON upi_transactions
  FOR DELETE USING (auth.uid() = user_id);
  
-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_upi_transactions_user_id ON upi_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_upi_transactions_date ON upi_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_upi_transactions_account_id ON upi_transactions(account_id);

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_account_balance_from_upi()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS update_balance_on_upi_transaction ON upi_transactions;

CREATE TRIGGER update_balance_on_upi_transaction
AFTER INSERT ON upi_transactions
FOR EACH ROW
EXECUTE FUNCTION update_account_balance_from_upi();

-- Create API keys table if it doesn't exist
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key VARCHAR(255) NOT NULL UNIQUE,
  permissions JSONB DEFAULT '["upi_sync"]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS select_api_keys ON api_keys;
DROP POLICY IF EXISTS insert_api_keys ON api_keys;
DROP POLICY IF EXISTS update_api_keys ON api_keys;
DROP POLICY IF EXISTS delete_api_keys ON api_keys;

-- Create policies
CREATE POLICY select_api_keys ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY insert_api_keys ON api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY update_api_keys ON api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY delete_api_keys ON api_keys
  FOR DELETE USING (auth.uid() = user_id);
