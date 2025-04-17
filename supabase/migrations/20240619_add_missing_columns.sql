-- Add missing columns to bank_accounts table
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- Check if color column exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'bank_accounts'
        AND column_name = 'color'
    ) INTO column_exists;

    -- If color doesn't exist, add it
    IF NOT column_exists THEN
        RAISE NOTICE 'Adding color column to bank_accounts table...';
        ALTER TABLE bank_accounts ADD COLUMN color VARCHAR(50);
        RAISE NOTICE 'color column added successfully.';
    ELSE
        RAISE NOTICE 'color column already exists, no action needed.';
    END IF;

    -- Check if icon_name column exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'bank_accounts'
        AND column_name = 'icon_name'
    ) INTO column_exists;

    -- If icon_name doesn't exist, add it
    IF NOT column_exists THEN
        RAISE NOTICE 'Adding icon_name column to bank_accounts table...';
        ALTER TABLE bank_accounts ADD COLUMN icon_name VARCHAR(100);
        RAISE NOTICE 'icon_name column added successfully.';
    ELSE
        RAISE NOTICE 'icon_name column already exists, no action needed.';
    END IF;
END $$;
