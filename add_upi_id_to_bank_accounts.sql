-- Add UPI ID field to bank_accounts table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'bank_accounts'
        AND column_name = 'upi_id'
    ) THEN
        ALTER TABLE bank_accounts ADD COLUMN upi_id VARCHAR(255);
        
        -- Create an index on the UPI ID field for faster lookups
        CREATE INDEX IF NOT EXISTS idx_bank_accounts_upi_id ON bank_accounts(upi_id);
    END IF;
END
$$;
