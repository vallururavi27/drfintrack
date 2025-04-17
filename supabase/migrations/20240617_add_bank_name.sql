-- Add bank_name column if it doesn't exist
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
    ELSE
        RAISE NOTICE 'bank_name column already exists, no action needed.';
    END IF;

    -- Check if ifsc_code column exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'bank_accounts'
        AND column_name = 'ifsc_code'
    ) INTO column_exists;

    -- If ifsc_code doesn't exist, add it
    IF NOT column_exists THEN
        RAISE NOTICE 'Adding ifsc_code column to bank_accounts table...';
        ALTER TABLE bank_accounts ADD COLUMN ifsc_code VARCHAR(11);
    ELSE
        RAISE NOTICE 'ifsc_code column already exists, no action needed.';
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
    ELSE
        RAISE NOTICE 'icon_name column already exists, no action needed.';
    END IF;

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
    ELSE
        RAISE NOTICE 'color column already exists, no action needed.';
    END IF;

    RAISE NOTICE 'Schema check and fix completed.';
END $$;
