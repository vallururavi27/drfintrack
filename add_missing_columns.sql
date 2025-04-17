-- Add missing columns to bank_accounts table

-- Add bank_name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'bank_accounts'
        AND column_name = 'bank_name'
    ) THEN
        ALTER TABLE bank_accounts ADD COLUMN bank_name VARCHAR(255);
        RAISE NOTICE 'bank_name column added successfully.';
    ELSE
        RAISE NOTICE 'bank_name column already exists, no action needed.';
    END IF;
END $$;

-- Add color column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'bank_accounts'
        AND column_name = 'color'
    ) THEN
        ALTER TABLE bank_accounts ADD COLUMN color VARCHAR(50);
        RAISE NOTICE 'color column added successfully.';
    ELSE
        RAISE NOTICE 'color column already exists, no action needed.';
    END IF;
END $$;

-- Add icon_name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'bank_accounts'
        AND column_name = 'icon_name'
    ) THEN
        ALTER TABLE bank_accounts ADD COLUMN icon_name VARCHAR(100);
        RAISE NOTICE 'icon_name column added successfully.';
    ELSE
        RAISE NOTICE 'icon_name column already exists, no action needed.';
    END IF;
END $$;
