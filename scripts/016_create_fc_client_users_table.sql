-- Create fc_client_users table for fulfillment client user accounts
CREATE TABLE IF NOT EXISTS fc_client_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES fc_clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    position TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'medewerker' CHECK (role IN ('beheerder', 'medewerker')),
    password_hash TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint: email must be unique per client
    CONSTRAINT unique_email_per_client UNIQUE (client_id, email)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fc_client_users_tenant_id ON fc_client_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fc_client_users_client_id ON fc_client_users(client_id);
CREATE INDEX IF NOT EXISTS idx_fc_client_users_email ON fc_client_users(email);
CREATE INDEX IF NOT EXISTS idx_fc_client_users_role ON fc_client_users(role);
CREATE INDEX IF NOT EXISTS idx_fc_client_users_status ON fc_client_users(status);

-- Add comments
COMMENT ON TABLE fc_client_users IS 'User accounts for fulfillment clients';
COMMENT ON COLUMN fc_client_users.tenant_id IS 'Reference to the tenant managing this client';
COMMENT ON COLUMN fc_client_users.client_id IS 'Reference to the fulfillment client';
COMMENT ON COLUMN fc_client_users.role IS 'User role: beheerder or medewerker';
COMMENT ON COLUMN fc_client_users.password_hash IS 'Hashed password for authentication';
COMMENT ON CONSTRAINT unique_email_per_client ON fc_client_users IS 'Email must be unique per client';
