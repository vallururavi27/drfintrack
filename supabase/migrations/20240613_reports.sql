-- Create reports table to store saved reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_name VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  parameters JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policy for selecting reports
CREATE POLICY select_reports ON reports
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for inserting reports
CREATE POLICY insert_reports ON reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for updating reports
CREATE POLICY update_reports ON reports
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for deleting reports
CREATE POLICY delete_reports ON reports
  FOR DELETE USING (auth.uid() = user_id);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);

-- Create functions for common reports

-- Function to get monthly income and expenses
CREATE OR REPLACE FUNCTION get_monthly_income_expenses(
  p_user_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  month TEXT,
  year INTEGER,
  total_income DECIMAL(15, 2),
  total_expenses DECIMAL(15, 2),
  net_savings DECIMAL(15, 2)
) AS $$
DECLARE
  v_start_date DATE;
  v_end_date DATE;
BEGIN
  -- Set default date range if not provided (last 12 months)
  v_start_date := COALESCE(p_start_date, date_trunc('month', current_date - interval '11 months')::DATE);
  v_end_date := COALESCE(p_end_date, date_trunc('month', current_date)::DATE + interval '1 month' - interval '1 day');
  
  RETURN QUERY
  WITH monthly_data AS (
    SELECT
      to_char(date_trunc('month', transaction_date), 'Mon') AS month,
      EXTRACT(YEAR FROM transaction_date) AS year,
      EXTRACT(MONTH FROM transaction_date) AS month_num,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expenses
    FROM transactions
    WHERE user_id = p_user_id
      AND transaction_date BETWEEN v_start_date AND v_end_date
    GROUP BY date_trunc('month', transaction_date), EXTRACT(YEAR FROM transaction_date), EXTRACT(MONTH FROM transaction_date)
    ORDER BY year, month_num
  )
  SELECT
    month,
    year::INTEGER,
    total_income,
    total_expenses,
    (total_income - total_expenses) AS net_savings
  FROM monthly_data;
END;
$$ LANGUAGE plpgsql;

-- Function to get category-wise expenses
CREATE OR REPLACE FUNCTION get_category_expenses(
  p_user_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  category VARCHAR(100),
  total_amount DECIMAL(15, 2),
  percentage DECIMAL(5, 2)
) AS $$
DECLARE
  v_start_date DATE;
  v_end_date DATE;
  v_total_expenses DECIMAL(15, 2);
BEGIN
  -- Set default date range if not provided (current month)
  v_start_date := COALESCE(p_start_date, date_trunc('month', current_date)::DATE);
  v_end_date := COALESCE(p_end_date, current_date);
  
  -- Calculate total expenses for the period
  SELECT COALESCE(SUM(amount), 0) INTO v_total_expenses
  FROM transactions
  WHERE user_id = p_user_id
    AND type = 'expense'
    AND transaction_date BETWEEN v_start_date AND v_end_date;
  
  RETURN QUERY
  WITH category_data AS (
    SELECT
      COALESCE(c.name, 'Uncategorized') AS category,
      SUM(t.amount) AS total_amount
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = p_user_id
      AND t.type = 'expense'
      AND t.transaction_date BETWEEN v_start_date AND v_end_date
    GROUP BY c.name
    ORDER BY total_amount DESC
  )
  SELECT
    category,
    total_amount,
    CASE
      WHEN v_total_expenses > 0 THEN (total_amount / v_total_expenses) * 100
      ELSE 0
    END AS percentage
  FROM category_data;
END;
$$ LANGUAGE plpgsql;

-- Function to get investment performance
CREATE OR REPLACE FUNCTION get_investment_performance(
  p_user_id UUID
)
RETURNS TABLE (
  investment_type VARCHAR(50),
  total_invested DECIMAL(15, 2),
  current_value DECIMAL(15, 2),
  gain_loss DECIMAL(15, 2),
  gain_percentage DECIMAL(5, 2)
) AS $$
BEGIN
  RETURN QUERY
  WITH investment_data AS (
    SELECT
      investment_type,
      SUM(amount) AS total_invested,
      SUM(COALESCE(current_value, amount)) AS current_value
    FROM investments
    WHERE user_id = p_user_id
    GROUP BY investment_type
    ORDER BY total_invested DESC
  )
  SELECT
    investment_type,
    total_invested,
    current_value,
    (current_value - total_invested) AS gain_loss,
    CASE
      WHEN total_invested > 0 THEN ((current_value - total_invested) / total_invested) * 100
      ELSE 0
    END AS gain_percentage
  FROM investment_data;
END;
$$ LANGUAGE plpgsql;

-- Function to get account balances
CREATE OR REPLACE FUNCTION get_account_balances(
  p_user_id UUID
)
RETURNS TABLE (
  account_name VARCHAR(255),
  bank_name VARCHAR(255),
  account_type VARCHAR(50),
  current_balance DECIMAL(15, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ba.account_name,
    ba.bank_name,
    ba.account_type,
    ba.current_balance
  FROM bank_accounts ba
  WHERE ba.user_id = p_user_id
  ORDER BY ba.current_balance DESC;
END;
$$ LANGUAGE plpgsql;
