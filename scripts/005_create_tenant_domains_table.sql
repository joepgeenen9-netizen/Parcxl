-- Create tenant_domains table for storing domain configurations
CREATE TABLE IF NOT EXISTS tenant_domains (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    domain text NOT NULL,
    www_enabled boolean DEFAULT true,
    nameserver_verified boolean DEFAULT false,
    vercel_project_id text,
    vercel_team_id text,
    vercel_domain_verified boolean DEFAULT false,
    connected_at timestamptz,
    created_at timestamptz DEFAULT now(),
    
    -- Ensure no duplicate domains per tenant
    UNIQUE(tenant_id, domain),
    -- Ensure no domain is used by multiple tenants
    UNIQUE(domain)
);

-- Enable RLS
ALTER TABLE tenant_domains ENABLE ROW LEVEL SECURITY;

-- Policy: Super-admins can manage tenant domains
CREATE POLICY "Super-admins can manage tenant domains" ON tenant_domains
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM super_admins sa 
            WHERE sa.id = auth.uid()
        )
    );

-- Insert indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_domains_tenant_id ON tenant_domains(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_domains_domain ON tenant_domains(domain);
CREATE INDEX IF NOT EXISTS idx_tenant_domains_verified ON tenant_domains(nameserver_verified);
CREATE INDEX IF NOT EXISTS idx_tenant_domains_connected_at ON tenant_domains(connected_at DESC);
