-- Ensure the fc_client_domains table exists with proper schema and constraints
-- This script will create the table if it doesn't exist and add missing columns/constraints

-- First, create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS fc_client_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    client_id UUID NOT NULL,
    subdomain VARCHAR(63) NOT NULL,
    full_domain VARCHAR(253) NOT NULL,
    vercel_project_id VARCHAR(255),
    dns_configured BOOLEAN DEFAULT FALSE,
    ssl_configured BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
    -- Add foreign key to tenants table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_fc_client_domains_tenant'
    ) THEN
        ALTER TABLE fc_client_domains 
        ADD CONSTRAINT fk_fc_client_domains_tenant 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key to fc_clients table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_fc_client_domains_client'
    ) THEN
        ALTER TABLE fc_client_domains 
        ADD CONSTRAINT fk_fc_client_domains_client 
        FOREIGN KEY (client_id) REFERENCES fc_clients(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add unique constraints if they don't exist
DO $$
BEGIN
    -- Unique constraint for subdomain per tenant
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_subdomain_per_tenant'
    ) THEN
        ALTER TABLE fc_client_domains 
        ADD CONSTRAINT unique_subdomain_per_tenant 
        UNIQUE (tenant_id, subdomain);
    END IF;

    -- Unique constraint for full domain globally
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_full_domain'
    ) THEN
        ALTER TABLE fc_client_domains 
        ADD CONSTRAINT unique_full_domain 
        UNIQUE (full_domain);
    END IF;
END $$;

-- Add check constraints for data validation
DO $$
BEGIN
    -- Check constraint for valid subdomain format
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'valid_subdomain'
    ) THEN
        ALTER TABLE fc_client_domains 
        ADD CONSTRAINT valid_subdomain 
        CHECK (subdomain ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$' AND length(subdomain) >= 2 AND length(subdomain) <= 63);
    END IF;

    -- Check constraint for valid full domain format
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'valid_full_domain'
    ) THEN
        ALTER TABLE fc_client_domains 
        ADD CONSTRAINT valid_full_domain 
        CHECK (full_domain ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$' AND length(full_domain) >= 5 AND length(full_domain) <= 253);
    END IF;

    -- Check constraint for valid status values
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'valid_status'
    ) THEN
        ALTER TABLE fc_client_domains 
        ADD CONSTRAINT valid_status 
        CHECK (status IN ('active', 'inactive', 'pending', 'error'));
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fc_client_domains_tenant_id ON fc_client_domains(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fc_client_domains_client_id ON fc_client_domains(client_id);
CREATE INDEX IF NOT EXISTS idx_fc_client_domains_subdomain ON fc_client_domains(subdomain);
CREATE INDEX IF NOT EXISTS idx_fc_client_domains_full_domain ON fc_client_domains(full_domain);
CREATE INDEX IF NOT EXISTS idx_fc_client_domains_status ON fc_client_domains(status);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_fc_client_domains_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_fc_client_domains_updated_at ON fc_client_domains;
CREATE TRIGGER trigger_update_fc_client_domains_updated_at
    BEFORE UPDATE ON fc_client_domains
    FOR EACH ROW
    EXECUTE FUNCTION update_fc_client_domains_updated_at();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON fc_client_domains TO authenticated;
GRANT USAGE ON SEQUENCE fc_client_domains_id_seq TO authenticated;

-- Add RLS policies if they don't exist
ALTER TABLE fc_client_domains ENABLE ROW LEVEL SECURITY;

-- Policy for tenant isolation
DROP POLICY IF EXISTS "fc_client_domains_tenant_isolation" ON fc_client_domains;
CREATE POLICY "fc_client_domains_tenant_isolation" ON fc_client_domains
    FOR ALL USING (
        tenant_id IN (
            SELECT id FROM tenants 
            WHERE id = (current_setting('app.current_tenant_id', true))::uuid
        )
    );

-- Policy for service role (full access)
DROP POLICY IF EXISTS "fc_client_domains_service_role_access" ON fc_client_domains;
CREATE POLICY "fc_client_domains_service_role_access" ON fc_client_domains
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);
