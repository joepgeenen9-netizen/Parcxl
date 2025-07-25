-- Ensure the leveranciers table has all necessary columns
DO $$ BEGIN
    -- Check if the table exists and has the right structure
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'leveranciers') THEN
        CREATE TABLE leveranciers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            client_id UUID NOT NULL REFERENCES fc_clients(id) ON DELETE CASCADE,
            naam VARCHAR(255) NOT NULL,
            contactpersoon VARCHAR(255),
            email VARCHAR(255),
            telefoon VARCHAR(50),
            adres TEXT,
            postcode VARCHAR(20),
            stad VARCHAR(100),
            land VARCHAR(100) DEFAULT 'Nederland',
            btw_nummer VARCHAR(50),
            kvk_nummer VARCHAR(20),
            website VARCHAR(255),
            opmerkingen TEXT,
            actief BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add indexes for better performance
        CREATE INDEX idx_leveranciers_tenant_id ON leveranciers(tenant_id);
        CREATE INDEX idx_leveranciers_client_id ON leveranciers(client_id);
        CREATE INDEX idx_leveranciers_actief ON leveranciers(actief);
        
        -- Add trigger for updated_at
        CREATE OR REPLACE FUNCTION update_leveranciers_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        CREATE TRIGGER trigger_leveranciers_updated_at
            BEFORE UPDATE ON leveranciers
            FOR EACH ROW
            EXECUTE FUNCTION update_leveranciers_updated_at();
            
        RAISE NOTICE 'Created leveranciers table with all necessary columns and indexes';
    ELSE
        RAISE NOTICE 'leveranciers table already exists';
    END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE leveranciers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$ BEGIN
    -- Policy for tenant isolation
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'leveranciers' 
        AND policyname = 'tenant_isolation_leveranciers'
    ) THEN
        CREATE POLICY tenant_isolation_leveranciers ON leveranciers
        USING (tenant_id = (SELECT tenant_id FROM tenant_users WHERE id = auth.uid()));
        
        RAISE NOTICE 'Created tenant isolation policy for leveranciers';
    END IF;
END $$;
