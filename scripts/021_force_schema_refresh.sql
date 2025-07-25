-- Force complete schema cache refresh for Supabase
DO $$
BEGIN
    -- Analyze all relevant tables to refresh schema cache
    ANALYZE fc_clients;
    ANALYZE fc_client_users;
    
    -- Update table statistics
    VACUUM ANALYZE fc_clients;
    VACUUM ANALYZE fc_client_users;
    
    -- Display final table structure for verification
    RAISE NOTICE '=== FC_CLIENTS TABLE STRUCTURE ===';
    FOR rec IN 
        SELECT 
            column_name, 
            data_type, 
            is_nullable, 
            column_default,
            character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = 'fc_clients'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'Column: % | Type: % | Nullable: % | Default: % | Max Length: %', 
            rec.column_name, 
            rec.data_type, 
            rec.is_nullable, 
            COALESCE(rec.column_default, 'NULL'), 
            COALESCE(rec.character_maximum_length::TEXT, 'N/A');
    END LOOP;
    
    -- Display constraints
    RAISE NOTICE '=== FC_CLIENTS TABLE CONSTRAINTS ===';
    FOR rec IN 
        SELECT 
            constraint_name, 
            constraint_type
        FROM information_schema.table_constraints 
        WHERE table_name = 'fc_clients'
    LOOP
        RAISE NOTICE 'Constraint: % | Type: %', rec.constraint_name, rec.constraint_type;
    END LOOP;
    
    -- Display indexes
    RAISE NOTICE '=== FC_CLIENTS TABLE INDEXES ===';
    FOR rec IN 
        SELECT 
            indexname, 
            indexdef
        FROM pg_indexes 
        WHERE tablename = 'fc_clients'
    LOOP
        RAISE NOTICE 'Index: % | Definition: %', rec.indexname, rec.indexdef;
    END LOOP;
    
    RAISE NOTICE 'Schema refresh completed successfully';
END $$;
