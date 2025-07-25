-- Complete schema fix for fc_clients table - ensure all required columns exist
DO $$
DECLARE
    missing_columns TEXT[] := ARRAY[]::TEXT[];
    col_exists BOOLEAN;
BEGIN
    RAISE NOTICE 'Starting complete schema verification and fix for fc_clients table';
    
    -- Check if table exists at all
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'fc_clients') THEN
        RAISE NOTICE 'fc_clients table does not exist, creating it...';
        
        CREATE TABLE fc_clients (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id UUID NOT NULL,
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
            status TEXT DEFAULT 'active',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            
            -- Constraints
            CONSTRAINT fc_clients_status_check CHECK (status IN ('active', 'inactive', 'suspended'))
        );
        
        RAISE NOTICE 'fc_clients table created successfully';
    ELSE
        RAISE NOTICE 'fc_clients table exists, checking for missing columns...';
    END IF;
    
    -- Check each required column individually and add if missing
    
    -- Check id column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fc_clients' AND column_name = 'id'
    ) INTO col_exists;
    IF NOT col_exists THEN
        ALTER TABLE fc_clients ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();
        missing_columns := array_append(missing_columns, 'id');
    END IF;
    
    -- Check tenant_id column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fc_clients' AND column_name = 'tenant_id'
    ) INTO col_exists;
    IF NOT col_exists THEN
        ALTER TABLE fc_clients ADD COLUMN tenant_id UUID NOT NULL;
        missing_columns := array_append(missing_columns, 'tenant_id');
    END IF;
    
    -- Check company_name column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fc_clients' AND column_name = 'company_name'
    ) INTO col_exists;
    IF NOT col_exists THEN
        ALTER TABLE fc_clients ADD COLUMN company_name TEXT NOT NULL;
        missing_columns := array_append(missing_columns, 'company_name');
    END IF;
    
    -- Check logo_url column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fc_clients' AND column_name = 'logo_url'
    ) INTO col_exists;
    IF NOT col_exists THEN
        ALTER TABLE fc_clients ADD COLUMN logo_url TEXT;
        missing_columns := array_append(missing_columns, 'logo_url');
    END IF;
    
    -- Check contact_person column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fc_clients' AND column_name = 'contact_person'
    ) INTO col_exists;
    IF NOT col_exists THEN
        ALTER TABLE fc_clients ADD COLUMN contact_person TEXT;
        missing_columns := array_append(missing_columns, 'contact_person');
    END IF;
    
    -- Check email column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fc_clients' AND column_name = 'email'
    ) INTO col_exists;
    IF NOT col_exists THEN
        ALTER TABLE fc_clients ADD COLUMN email TEXT;
        missing_columns := array_append(missing_columns, 'email');
    END IF;
    
    -- Check phone column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fc_clients' AND column_name = 'phone'
    ) INTO col_exists;
    IF NOT col_exists THEN
        ALTER TABLE fc_clients ADD COLUMN phone TEXT;
        missing_columns := array_append(missing_columns, 'phone');
    END IF;
    
    -- Check address column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fc_clients' AND column_name = 'address'
    ) INTO col_exists;
    IF NOT col_exists THEN
        ALTER TABLE fc_clients ADD COLUMN address TEXT;
        missing_columns := array_append(missing_columns, 'address');
    END IF;
    
    -- Check address_company_name column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fc_clients' AND column_name = 'address_company_name'
    ) INTO col_exists;
    IF NOT col_exists THEN
        ALTER TABLE fc_clients ADD COLUMN address_company_name TEXT;
        missing_columns := array_append(missing_columns, 'address_company_name');
    END IF;
    
    -- Check address_contact_person column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fc_clients' AND column_name = 'address_contact_person'
    ) INTO col_exists;
    IF NOT col_exists THEN
        ALTER TABLE fc_clients ADD COLUMN address_contact_person TEXT;
        missing_columns := array_append(missing_columns, 'address_contact_person');
    END IF;
    
    -- Check address_street column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fc_clients' AND column_name = 'address_street'
    ) INTO col_exists;
    IF NOT col_exists THEN
        ALTER TABLE fc_clients ADD COLUMN address_street TEXT;
        missing_columns := array_append(missing_columns, 'address_street');
    END IF;
    
    -- Check address_number column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fc_clients' AND column_name = 'address_number'
    ) INTO col_exists;
    IF NOT col_exists THEN
        ALTER TABLE fc_clients ADD COLUMN address_number TEXT;
        missing_columns := array_append(missing_columns, 'address_number');
    END IF;
    
    -- Check address_postal_code column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fc_clients' AND column_name = 'address_postal_code'
    ) INTO col_exists;
    IF NOT col_exists THEN
        ALTER TABLE fc_clients ADD COLUMN address_postal_code TEXT;
        missing_columns := array_append(missing_columns, 'address_postal_code');
    END IF;
    
    -- Check address_city column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fc_clients' AND column_name = 'address_city'
    ) INTO col_exists;
    IF NOT col_exists THEN
        ALTER TABLE fc_clients ADD COLUMN address_city TEXT;
        missing_columns := array_append(missing_columns, 'address_city');
    END IF;
    
    -- Check address_country column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fc_clients' AND column_name = 'address_country'
    ) INTO col_exists;
    IF NOT col_exists THEN
        ALTER TABLE fc_clients ADD COLUMN address_country TEXT DEFAULT 'Nederland';
        missing_columns := array_append(missing_columns, 'address_country');
    END IF;
    
    -- Check status column (this was the original issue)
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fc_clients' AND column_name = 'status'
    ) INTO col_exists;
    IF NOT col_exists THEN
        ALTER TABLE fc_clients ADD COLUMN status TEXT DEFAULT 'active';
        missing_columns := array_append(missing_columns, 'status');
    END IF;
    
    -- Check created_at column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fc_clients' AND column_name = 'created_at'
    ) INTO col_exists;
    IF NOT col_exists THEN
        ALTER TABLE fc_clients ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        missing_columns := array_append(missing_columns, 'created_at');
    END IF;
    
    -- Check updated_at column (this is the current issue)
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fc_clients' AND column_name = 'updated_at'
    ) INTO col_exists;
    IF NOT col_exists THEN
        ALTER TABLE fc_clients ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        missing_columns := array_append(missing_columns, 'updated_at');
    END IF;
    
    -- Add constraints if they don't exist
    ALTER TABLE fc_clients DROP CONSTRAINT IF EXISTS fc_clients_status_check;
    ALTER TABLE fc_clients ADD CONSTRAINT fc_clients_status_check 
        CHECK (status IN ('active', 'inactive', 'suspended'));
    
    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_fc_clients_tenant_id ON fc_clients(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_fc_clients_company_name ON fc_clients(company_name);
    CREATE INDEX IF NOT EXISTS idx_fc_clients_email ON fc_clients(email);
    CREATE INDEX IF NOT EXISTS idx_fc_clients_status ON fc_clients(status);
    CREATE INDEX IF NOT EXISTS idx_fc_clients_created_at ON fc_clients(created_at);
    CREATE INDEX IF NOT EXISTS idx_fc_clients_updated_at ON fc_clients(updated_at);
    
    -- Add foreign key constraint if tenants table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tenants') THEN
        ALTER TABLE fc_clients DROP CONSTRAINT IF EXISTS fc_clients_tenant_id_fkey;
        ALTER TABLE fc_clients ADD CONSTRAINT fc_clients_tenant_id_fkey 
            FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint to tenants table';
    END IF;
    
    -- Report results
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE NOTICE 'Added missing columns: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE 'All required columns were already present';
    END IF;
    
    RAISE NOTICE 'fc_clients table schema fix completed successfully';
END $$;
