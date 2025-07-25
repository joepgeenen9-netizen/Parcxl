-- Fix fc_clients table schema - ensure status column exists with proper constraints
DO $$
BEGIN
    -- Check if status column exists in fc_clients table
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'fc_clients' 
        AND column_name = 'status'
    ) THEN
        -- Add status column if it doesn't exist
        ALTER TABLE fc_clients 
        ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));
        
        -- Create index for status column
        CREATE INDEX IF NOT EXISTS idx_fc_clients_status ON fc_clients(status);
        
        -- Update existing records to have 'active' status
        UPDATE fc_clients SET status = 'active' WHERE status IS NULL;
        
        RAISE NOTICE 'Added status column to fc_clients table';
    ELSE
        -- Column exists, check if it has proper constraints
        -- Drop existing constraint if it exists
        ALTER TABLE fc_clients DROP CONSTRAINT IF EXISTS fc_clients_status_check;
        
        -- Add proper constraint
        ALTER TABLE fc_clients 
        ADD CONSTRAINT fc_clients_status_check 
        CHECK (status IN ('active', 'inactive', 'suspended'));
        
        -- Ensure default value is set
        ALTER TABLE fc_clients ALTER COLUMN status SET DEFAULT 'active';
        
        -- Create index if it doesn't exist
        CREATE INDEX IF NOT EXISTS idx_fc_clients_status ON fc_clients(status);
        
        RAISE NOTICE 'Updated status column constraints in fc_clients table';
    END IF;
    
    -- Verify the column exists and has correct properties
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'fc_clients' 
        AND column_name = 'status'
    ) THEN
        RAISE NOTICE 'Status column verified in fc_clients table';
    ELSE
        RAISE EXCEPTION 'Failed to create or verify status column in fc_clients table';
    END IF;
END $$;
