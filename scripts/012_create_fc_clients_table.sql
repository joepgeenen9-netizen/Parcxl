-- Create the fc_clients table for fulfillment center clients
CREATE TABLE IF NOT EXISTS fc_clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fc_clients_tenant_id ON fc_clients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fc_clients_created_at ON fc_clients(created_at);
CREATE INDEX IF NOT EXISTS idx_fc_clients_company_name ON fc_clients(company_name);

-- Enable RLS (Row Level Security)
ALTER TABLE fc_clients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view clients from their tenant" ON fc_clients
    FOR SELECT USING (tenant_id IN (
        SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert clients for their tenant" ON fc_clients
    FOR INSERT WITH CHECK (tenant_id IN (
        SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update clients from their tenant" ON fc_clients
    FOR UPDATE USING (tenant_id IN (
        SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can delete clients from their tenant" ON fc_clients
    FOR DELETE USING (tenant_id IN (
        SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    ));

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_fc_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fc_clients_updated_at
    BEFORE UPDATE ON fc_clients
    FOR EACH ROW
    EXECUTE FUNCTION update_fc_clients_updated_at();
