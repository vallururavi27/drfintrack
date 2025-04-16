-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_name VARCHAR(255) NOT NULL,
  investment_type VARCHAR(50) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  current_value DECIMAL(15, 2),
  purchase_date DATE NOT NULL,
  maturity_date DATE,
  interest_rate DECIMAL(5, 2),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for investments
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Policy for selecting investments
CREATE POLICY select_investments ON investments
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for inserting investments
CREATE POLICY insert_investments ON investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for updating investments
CREATE POLICY update_investments ON investments
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for deleting investments
CREATE POLICY delete_investments ON investments
  FOR DELETE USING (auth.uid() = user_id);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);

-- Create investment_transactions table to track value changes
CREATE TABLE IF NOT EXISTS investment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investment_id UUID NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  transaction_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for investment_transactions
ALTER TABLE investment_transactions ENABLE ROW LEVEL SECURITY;

-- Policy for selecting investment_transactions
CREATE POLICY select_investment_transactions ON investment_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM investments
      WHERE investments.id = investment_transactions.investment_id
      AND investments.user_id = auth.uid()
    )
  );

-- Policy for inserting investment_transactions
CREATE POLICY insert_investment_transactions ON investment_transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM investments
      WHERE investments.id = investment_transactions.investment_id
      AND investments.user_id = auth.uid()
    )
  );

-- Policy for updating investment_transactions
CREATE POLICY update_investment_transactions ON investment_transactions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM investments
      WHERE investments.id = investment_transactions.investment_id
      AND investments.user_id = auth.uid()
    )
  );

-- Policy for deleting investment_transactions
CREATE POLICY delete_investment_transactions ON investment_transactions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM investments
      WHERE investments.id = investment_transactions.investment_id
      AND investments.user_id = auth.uid()
    )
  );

-- Create index on investment_id for faster queries
CREATE INDEX IF NOT EXISTS idx_investment_transactions_investment_id ON investment_transactions(investment_id);
