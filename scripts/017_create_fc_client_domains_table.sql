-- Create fc_client_domains table for client subdomains
CREATE TABLE IF NOT EXISTS fc_client_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES fc_clients(id) ON DELETE CASCADE,
    subdomain TEXT NOT NULL,
    full_domain TEXT NOT NULL,
    vercel_project_id TEXT,
    dns_configured BOOLEAN DEFAULT FALSE,
    ssl_configured BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'failed', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint: subdomain must be unique per tenant
    CONSTRAINT unique_subdomain_per_tenant UNIQUE (tenant_id, subdomain)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fc_client_domains_tenant_id ON fc_client_domains(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fc_client_domains_client_id ON fc_client_domains(client_id);
CREATE INDEX IF NOT EXISTS idx_fc_client_domains_subdomain ON fc_client_domains(subdomain);
CREATE INDEX IF NOT EXISTS idx_fc_client_domains_full_domain ON fc_client_domains(full_domain);
CREATE INDEX IF NOT EXISTS idx_fc_client_domains_status ON fc_client_domains(status);

-- Add comments
COMMENT ON TABLE fc_client_domains IS 'Subdomains for fulfillment clients';
COMMENT ON COLUMN fc_client_domains.tenant_id IS 'Reference to the tenant managing this client';
COMMENT ON COLUMN fc_client_domains.client_id IS 'Reference to the fulfillment client';
COMMENT ON COLUMN fc_client_domains.subdomain IS 'Subdomain part (e.g., "client1")';
COMMENT ON COLUMN fc_client_domains.full_domain IS 'Full domain (e.g., "client1.tenant.com")';
COMMENT ON COLUMN fc_client_domains.vercel_project_id IS 'Vercel project ID for domain management';
COMMENT ON CONSTRAINT unique_subdomain_per_tenant ON fc_client_domains IS 'Subdomain must be unique per tenant';
