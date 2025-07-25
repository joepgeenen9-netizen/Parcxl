-- Debug script for fc_client_integrations table issues
-- This script helps identify potential problems with the CCV integration save process

-- Step 1: Check if the table exists and show its structure
SELECT 
    'TABLE_EXISTS' as check_type,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'fc_client_integrations') 
        THEN 'YES' 
        ELSE 'NO' 
    END as result;

-- Step 2: Show table columns if it exists
SELECT 
    'COLUMN_STRUCTURE' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'fc_client_integrations'
ORDER BY ordinal_position;

-- Step 3: Check constraints
SELECT 
    'CONSTRAINTS' as check_type,
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint 
WHERE conrelid = (SELECT oid FROM pg_class WHERE relname = 'fc_client_integrations');

-- Step 4: Check current data
SELECT 
    'CURRENT_DATA' as check_type,
    COUNT(*) as total_records,
    COUNT(CASE WHEN platform = 'ccv' THEN 1 END) as ccv_records
FROM fc_client_integrations;

-- Step 5: Check if referenced tables exist
SELECT 
    'REFERENCED_TABLES' as check_type,
    'tenants' as table_name,
    COUNT(*) as record_count
FROM tenants
UNION ALL
SELECT 
    'REFERENCED_TABLES' as check_type,
    'fc_clients' as table_name,
    COUNT(*) as record_count
FROM fc_clients;

-- Step 6: Test basic insert (will be rolled back)
DO $$
BEGIN
    -- Try to insert a test record
    BEGIN
        INSERT INTO fc_client_integrations (
            tenant_id,
            client_id,
            platform,
            domain,
            api_key,
            api_secret,
            active,
            created_at,
            updated_at
        ) VALUES (
            'test-tenant-id',
            'test-client-id', 
            'ccv',
            'https://test.example.com',
            'test-key',
            'test-secret',
            true,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'INSERT_TEST: SUCCESS - Basic insert works';
        
        -- Rollback the test insert
        ROLLBACK;
    EXCEPTION 
        WHEN foreign_key_violation THEN
            RAISE NOTICE 'INSERT_TEST: FOREIGN_KEY_ERROR - Referenced tenant/client does not exist';
        WHEN unique_violation THEN
            RAISE NOTICE 'INSERT_TEST: UNIQUE_ERROR - Duplicate key constraint';
        WHEN OTHERS THEN
            RAISE NOTICE 'INSERT_TEST: OTHER_ERROR - %', SQLERRM;
    END;
END $$;
