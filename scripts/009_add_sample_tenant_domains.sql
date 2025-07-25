-- Add sample tenant domains for testing
-- Make sure we have some test tenants first

-- Insert sample tenant domains (only if tenants exist)
INSERT INTO tenant_domains (tenant_id, domain, www_enabled, nameserver_verified, created_at)
SELECT 
    t.id,
    CASE 
        WHEN t.name ILIKE '%joep%' THEN 'joepsfulfilment.nl'
        WHEN t.name ILIKE '%bb%' THEN 'bbshop.nl'
        ELSE LOWER(REPLACE(t.name, ' ', '')) || '.nl'
    END as domain,
    true,
    true,
    now()
FROM tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM tenant_domains td WHERE td.tenant_id = t.id
)
LIMIT 5; -- Only add domains for first 5 tenants

-- Add localhost domains for development testing
INSERT INTO tenant_domains (tenant_id, domain, www_enabled, nameserver_verified, created_at)
SELECT 
    t.id,
    'tenant' || ROW_NUMBER() OVER (ORDER BY t.created_at) || '.localhost:3000',
    true,
    true,
    now()
FROM tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM tenant_domains td WHERE td.domain LIKE '%.localhost:3000' AND td.tenant_id = t.id
)
LIMIT 3; -- Add 3 localhost test domains
