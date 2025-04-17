-- Add UPI-related columns to bank_accounts table

-- Add upi_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'bank_accounts'
        AND column_name = 'upi_id'
    ) THEN
        ALTER TABLE bank_accounts ADD COLUMN upi_id VARCHAR(255);
        RAISE NOTICE 'upi_id column added successfully.';
    ELSE
        RAISE NOTICE 'upi_id column already exists, no action needed.';
    END IF;
END $$;

-- Add upi_linked column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'bank_accounts'
        AND column_name = 'upi_linked'
    ) THEN
        ALTER TABLE bank_accounts ADD COLUMN upi_linked BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'upi_linked column added successfully.';
    ELSE
        RAISE NOTICE 'upi_linked column already exists, no action needed.';
    END IF;
END $$;

-- Add upi_app column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'bank_accounts'
        AND column_name = 'upi_app'
    ) THEN
        ALTER TABLE bank_accounts ADD COLUMN upi_app VARCHAR(50);
        RAISE NOTICE 'upi_app column added successfully.';
    ELSE
        RAISE NOTICE 'upi_app column already exists, no action needed.';
    END IF;
END $$;
