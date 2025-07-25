-- Create tenants table with all required columns
CREATE TABLE IF NOT EXISTS tenants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('FC', 'WS')),
    email text,
    phone text,
    kvk_number text,
    vat_number text,
    return_company text,
    return_street text,
    return_house_number text,
    return_postal_code text,
    return_city text,
    return_country text,
    logo_url text,
    created_at timestamptz DEFAULT now()
);

-- Create domains table
CREATE TABLE IF NOT EXISTS domains (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    domain text NOT NULL,
    type text NOT NULL DEFAULT 'primary',
    verified boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

-- Policies: Super-admins can manage all tenants and domains
CREATE POLICY "Super-admins can manage tenants" ON tenants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM super_admins sa 
            WHERE sa.id = auth.uid()
        )
    );

CREATE POLICY "Super-admins can manage domains" ON domains
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM super_admins sa 
            WHERE sa.id = auth.uid()
        )
    );

-- Insert indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_type ON tenants(type);
CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON tenants(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_domains_tenant_id ON domains(tenant_id);
CREATE INDEX IF NOT EXISTS idx_domains_domain ON domains(domain);
CREATE INDEX IF NOT EXISTS idx_domains_verified ON domains(verified);
