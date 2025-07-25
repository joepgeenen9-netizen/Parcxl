-- Check if fc_clients table exists and create if it doesn't
DO $$
BEGIN
    -- Check if fc_clients table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'fc_clients') THEN
        -- Create fc_clients table
        CREATE TABLE fc_clients (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            company_name TEXT NOT NULL,
            logo_url TEXT,
            contact_person TEXT,
            email TEXT,
            phone TEXT,
            address TEXT,
            address_company_name TEXT,
            address_contact_person TEXT,
            address_street TEXT,
            address_number TEXT,
            address_postal_code TEXT,
            address_city TEXT,
            address_country TEXT DEFAULT 'Nederland',
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create indexes for performance
        CREATE INDEX idx_fc_clients_tenant_id ON fc_clients(tenant_id);
        CREATE INDEX idx_fc_clients_company_name ON fc_clients(company_name);
        CREATE INDEX idx_fc_clients_email ON fc_clients(email);
        CREATE INDEX idx_fc_clients_status ON fc_clients(status);
        CREATE INDEX idx_fc_clients_created_at ON fc_clients(created_at);

        -- Add comments
        COMMENT ON TABLE fc_clients IS 'Fulfillment clients managed by tenants';
        COMMENT ON COLUMN fc_clients.tenant_id IS 'Reference to the tenant managing this client';
        COMMENT ON COLUMN fc_clients.status IS 'Client status: active, inactive, or suspended';
        
        RAISE NOTICE 'fc_clients table created successfully';
    ELSE
        RAISE NOTICE 'fc_clients table already exists, skipping creation';
    END IF;
END $$;
