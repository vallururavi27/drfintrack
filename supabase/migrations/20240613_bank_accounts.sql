-- Create bank_accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(255) NOT NULL,
  bank_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(50) NOT NULL,
  current_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  icon_name VARCHAR(100),
  color VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for bank_accounts
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Policy for selecting bank accounts (users can only see their own accounts)
CREATE POLICY select_bank_accounts ON bank_accounts
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for inserting bank accounts
CREATE POLICY insert_bank_accounts ON bank_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for updating bank accounts
CREATE POLICY update_bank_accounts ON bank_accounts
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for deleting bank accounts
CREATE POLICY delete_bank_accounts ON bank_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
