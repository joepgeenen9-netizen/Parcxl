-- Add updated_at column to fc_client_integrations table
DO $$
BEGIN
    -- Check if updated_at column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fc_client_integrations' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE fc_client_integrations 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        -- Update existing records to have the current timestamp
        UPDATE fc_client_integrations 
        SET updated_at = NOW() 
        WHERE updated_at IS NULL;
    END IF;
END $$;
