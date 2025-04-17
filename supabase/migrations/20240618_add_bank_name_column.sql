-- Add bank_name column to bank_accounts table if it doesn't exist
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- Check if bank_name column exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'bank_accounts'
        AND column_name = 'bank_name'
    ) INTO column_exists;

    -- If bank_name doesn't exist, add it
    IF NOT column_exists THEN
        RAISE NOTICE 'Adding bank_name column to bank_accounts table...';
        ALTER TABLE bank_accounts ADD COLUMN bank_name VARCHAR(255);
        RAISE NOTICE 'bank_name column added successfully.';
    ELSE
        RAISE NOTICE 'bank_name column already exists, no action needed.';
    END IF;
END $$;
