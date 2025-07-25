-- Ensure all required columns exist in the tenants table
-- This script will add missing columns if they don't exist

-- Add email column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'email') THEN
        ALTER TABLE tenants ADD COLUMN email text;
    END IF;
END $$;

-- Add phone column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'phone') THEN
        ALTER TABLE tenants ADD COLUMN phone text;
    END IF;
END $$;

-- Add kvk_number column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'kvk_number') THEN
        ALTER TABLE tenants ADD COLUMN kvk_number text;
    END IF;
END $$;

-- Add vat_number column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'vat_number') THEN
        ALTER TABLE tenants ADD COLUMN vat_number text;
    END IF;
END $$;

-- Add return address columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'return_company') THEN
        ALTER TABLE tenants ADD COLUMN return_company text;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'return_street') THEN
        ALTER TABLE tenants ADD COLUMN return_street text;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'return_house_number') THEN
        ALTER TABLE tenants ADD COLUMN return_house_number text;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'return_postal_code') THEN
        ALTER TABLE tenants ADD COLUMN return_postal_code text;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'return_city') THEN
        ALTER TABLE tenants ADD COLUMN return_city text;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'return_country') THEN
        ALTER TABLE tenants ADD COLUMN return_country text;
    END IF;
END $$;

-- Add logo_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tenants' AND column_name = 'logo_url') THEN
        ALTER TABLE tenants ADD COLUMN logo_url text;
    END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tenants' 
ORDER BY ordinal_position;
