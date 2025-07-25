-- Create the fc_client_users table for client user accounts
CREATE TABLE IF NOT EXISTS fc_client_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES fc_clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique email per tenant
    UNIQUE(tenant_id, email)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fc_client_users_tenant_id ON fc_client_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fc_client_users_client_id ON fc_client_users(client_id);
CREATE INDEX IF NOT EXISTS idx_fc_client_users_email ON fc_client_users(email);
CREATE INDEX IF NOT EXISTS idx_fc_client_users_created_at ON fc_client_users(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE fc_client_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view client users from their tenant" ON fc_client_users
    FOR SELECT USING (tenant_id IN (
        SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert client users for their tenant" ON fc_client_users
    FOR INSERT WITH CHECK (tenant_id IN (
        SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update client users from their tenant" ON fc_client_users
    FOR UPDATE USING (tenant_id IN (
        SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can delete client users from their tenant" ON fc_client_users
    FOR DELETE USING (tenant_id IN (
        SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    ));

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_fc_client_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fc_client_users_updated_at
    BEFORE UPDATE ON fc_client_users
    FOR EACH ROW
    EXECUTE FUNCTION update_fc_client_users_updated_at();
