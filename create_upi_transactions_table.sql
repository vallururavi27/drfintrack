-- Create UPI transactions table
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

-- Create RLS policies for upi_transactions
ALTER TABLE upi_transactions ENABLE ROW LEVEL SECURITY;

-- Policy for selecting upi_transactions (users can only see their own transactions)
CREATE POLICY select_upi_transactions ON upi_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for inserting upi_transactions
CREATE POLICY insert_upi_transactions ON upi_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for updating upi_transactions
CREATE POLICY update_upi_transactions ON upi_transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for deleting upi_transactions
CREATE POLICY delete_upi_transactions ON upi_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create index on user_id and transaction_date for faster queries
CREATE INDEX IF NOT EXISTS idx_upi_transactions_user_id ON upi_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_upi_transactions_date ON upi_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_upi_transactions_account_id ON upi_transactions(account_id);

-- Add function to update bank account balance when UPI transaction is added
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

-- Create trigger to update account balance on UPI transaction insert
CREATE TRIGGER update_balance_on_upi_transaction
AFTER INSERT ON upi_transactions
FOR EACH ROW
EXECUTE FUNCTION update_account_balance_from_upi();
