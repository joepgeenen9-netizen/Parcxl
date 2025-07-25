-- Create tenant_users table for storing tenant-specific user accounts
CREATE TABLE IF NOT EXISTS tenant_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    username text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    is_admin boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    
    -- Ensure unique username per tenant
    UNIQUE(tenant_id, username),
    -- Ensure unique email per tenant
    UNIQUE(tenant_id, email)
);

-- Enable RLS
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;

-- Policy: Super-admins can manage tenant users
CREATE POLICY "Super-admins can manage tenant users" ON tenant_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM super_admins sa 
            WHERE sa.id = auth.uid()
        )
    );

-- Insert indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_email ON tenant_users(email);
CREATE INDEX IF NOT EXISTS idx_tenant_users_username ON tenant_users(username);
CREATE INDEX IF NOT EXISTS idx_tenant_users_created_at ON tenant_users(created_at DESC);
