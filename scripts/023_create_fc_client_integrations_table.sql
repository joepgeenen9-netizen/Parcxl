-- Create fc_client_integrations table for Packway fulfillment platform
CREATE TABLE IF NOT EXISTS fc_client_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES fc_clients(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    domain TEXT,
    api_key TEXT,
    api_secret TEXT,
    access_token TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
);

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_fc_client_integrations_tenant_id ON fc_client_integrations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fc_client_integrations_client_id ON fc_client_integrations(client_id);
CREATE INDEX IF NOT EXISTS idx_fc_client_integrations_platform ON fc_client_integrations(platform);

-- Add RLS (Row Level Security) policies
ALTER TABLE fc_client_integrations ENABLE ROW LEVEL SECURITY;

-- Policy for tenant isolation
CREATE POLICY IF NOT EXISTS "fc_client_integrations_tenant_isolation" ON fc_client_integrations
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
