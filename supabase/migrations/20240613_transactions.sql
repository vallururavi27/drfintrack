-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  icon_name VARCHAR(100),
  color VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policy for selecting categories
CREATE POLICY select_categories ON categories
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for inserting categories
CREATE POLICY insert_categories ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for updating categories
CREATE POLICY update_categories ON categories
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for deleting categories
CREATE POLICY delete_categories ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount DECIMAL(15, 2) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  description TEXT,
  transaction_date DATE NOT NULL,
  payee VARCHAR(255),
  notes TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency VARCHAR(50),
  recurring_end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy for selecting transactions
CREATE POLICY select_transactions ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for inserting transactions
CREATE POLICY insert_transactions ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for updating transactions
CREATE POLICY update_transactions ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for deleting transactions
CREATE POLICY delete_transactions ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);

-- Create function to update bank account balance after transaction changes
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
DECLARE
  amount_change DECIMAL(15, 2);
BEGIN
  -- For new transactions (INSERT)
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'income' THEN
      UPDATE bank_accounts SET current_balance = current_balance + NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'expense' THEN
      UPDATE bank_accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.account_id;
    END IF;
  
  -- For updated transactions (UPDATE)
  ELSIF TG_OP = 'UPDATE' THEN
    -- Revert old transaction effect
    IF OLD.type = 'income' THEN
      UPDATE bank_accounts SET current_balance = current_balance - OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'expense' THEN
      UPDATE bank_accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.account_id;
    END IF;
    
    -- Apply new transaction effect
    IF NEW.type = 'income' THEN
      UPDATE bank_accounts SET current_balance = current_balance + NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'expense' THEN
      UPDATE bank_accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.account_id;
    END IF;
  
  -- For deleted transactions (DELETE)
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type = 'income' THEN
      UPDATE bank_accounts SET current_balance = current_balance - OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'expense' THEN
      UPDATE bank_accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.account_id;
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update account balance
CREATE TRIGGER after_transaction_insert
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_account_balance();

CREATE TRIGGER after_transaction_update
AFTER UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_account_balance();

CREATE TRIGGER after_transaction_delete
AFTER DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_account_balance();
