-- Refresh schema cache and verify table structure
DO $$
DECLARE
    col_count INTEGER;
BEGIN
    -- Force refresh of schema cache by analyzing the table
    ANALYZE fc_clients;
    
    -- Verify all expected columns exist
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns 
    WHERE table_name = 'fc_clients' 
    AND column_name IN (
        'id', 'tenant_id', 'company_name', 'logo_url', 'contact_person', 
        'email', 'phone', 'address', 'address_company_name', 
        'address_contact_person', 'address_street', 'address_number', 
        'address_postal_code', 'address_city', 'address_country', 
        'status', 'created_at', 'updated_at'
    );
    
    RAISE NOTICE 'fc_clients table has % expected columns', col_count;
    
    -- Display current table structure
    RAISE NOTICE 'Current fc_clients table structure:';
    
    -- This will show all columns and their types
    FOR rec IN 
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'fc_clients'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'Column: % | Type: % | Nullable: % | Default: %', 
            rec.column_name, rec.data_type, rec.is_nullable, rec.column_default;
    END LOOP;
END $$;
