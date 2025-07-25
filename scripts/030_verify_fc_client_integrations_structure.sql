-- Comprehensive verification of fc_client_integrations table structure and issues
-- This script will help identify the exact problem with the CCV integration save process

-- Step 1: Check if the table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'fc_client_integrations') THEN
        RAISE NOTICE '✅ Table fc_client_integrations exists';
    ELSE
        RAISE NOTICE '❌ Table fc_client_integrations does NOT exist';
    END IF;
END $$;

-- Step 2: Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'fc_client_integrations' 
ORDER BY ordinal_position;

-- Step 3: Check constraints
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'fc_client_integrations'::regclass;

-- Step 4: Check foreign key relationships
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'fc_client_integrations';

-- Step 5: Show existing data count
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN platform = 'ccv' THEN 1 END) as ccv_integrations,
    COUNT(CASE WHEN active = true THEN 1 END) as active_integrations
FROM fc_client_integrations;

-- Step 6: Check if referenced tables exist and have data
SELECT 
    'tenants' as table_name,
    COUNT(*) as record_count
FROM tenants
UNION ALL
SELECT 
    'fc_clients' as table_name,
    COUNT(*) as record_count
FROM fc_clients;

-- Step 7: Test insert permissions (this will rollback)
BEGIN;
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
        'https://test.ccvshop.nl',
        'test-api-key',
        'test-api-secret',
        true,
        NOW(),
        NOW()
    );
    -- This will show if the insert would work (ignoring foreign key violations for now)
    RAISE NOTICE '✅ INSERT permissions are OK (rolling back test)';
ROLLBACK;

-- Step 8: Check for potential duplicate issues with specific tenant/client
-- Note: Replace these IDs with actual ones from your error
SELECT 
    id,
    tenant_id,
    client_id,
    platform,
    active,
    created_at
FROM fc_client_integrations 
WHERE tenant_id LIKE '65736047%' 
   OR client_id LIKE 'b65e988d%';

-- Step 9: Verify specific tenant and client exist
SELECT 
    'tenant' as type,
    id,
    name,
    status
FROM tenants 
WHERE id LIKE '65736047%'
UNION ALL
SELECT 
    'client' as type,
    id::text,
    name,
    status::text
FROM fc_clients 
WHERE id LIKE 'b65e988d%';

-- Step 10: Check table permissions for current user
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'fc_client_integrations';
