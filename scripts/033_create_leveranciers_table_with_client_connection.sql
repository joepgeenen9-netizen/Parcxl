-- Drop existing leveranciers table if it exists to recreate with proper structure
DROP TABLE IF EXISTS leveranciers CASCADE;

-- Create leveranciers table connected to clients and tenants
CREATE TABLE leveranciers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    client_id UUID NOT NULL REFERENCES fc_clients(id) ON DELETE CASCADE,
    naam TEXT NOT NULL,
    contactpersoon TEXT,
    email TEXT,
    telefoon TEXT,
    adres TEXT,
    postcode TEXT,
    stad TEXT,
    land TEXT DEFAULT 'Nederland',
    btw_nummer TEXT,
    kvk_nummer TEXT,
    website TEXT,
    opmerkingen TEXT,
    actief BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_leveranciers_tenant_id ON leveranciers(tenant_id);
CREATE INDEX idx_leveranciers_client_id ON leveranciers(client_id);
CREATE INDEX idx_leveranciers_actief ON leveranciers(actief);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_leveranciers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leveranciers_updated_at 
    BEFORE UPDATE ON leveranciers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_leveranciers_updated_at();

-- Insert sample leveranciers for existing clients (you may need to adjust client_id values)
-- This is just sample data - in production, these would be added through the UI
INSERT INTO leveranciers (tenant_id, client_id, naam, contactpersoon, email, telefoon, adres, postcode, stad) 
SELECT 
    '00000000-0000-0000-0000-000000000001' as tenant_id,
    fc.id as client_id,
    'Leverancier A' as naam,
    'Jan Jansen' as contactpersoon,
    'jan@leveranciera.nl' as email,
    '+31 20 1234567' as telefoon,
    'Industrieweg 1' as adres,
    '1000 AA' as postcode,
    'Amsterdam' as stad
FROM fc_clients fc 
WHERE fc.tenant_id = '00000000-0000-0000-0000-000000000001'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO leveranciers (tenant_id, client_id, naam, contactpersoon, email, telefoon, adres, postcode, stad) 
SELECT 
    '00000000-0000-0000-0000-000000000001' as tenant_id,
    fc.id as client_id,
    'Leverancier B' as naam,
    'Marie de Vries' as contactpersoon,
    'marie@leverancierb.nl' as email,
    '+31 30 2345678' as telefoon,
    'Logistiekstraat 25' as adres,
    '3500 BB' as postcode,
    'Utrecht' as stad
FROM fc_clients fc 
WHERE fc.tenant_id = '00000000-0000-0000-0000-000000000001'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO leveranciers (tenant_id, client_id, naam, contactpersoon, email, telefoon, adres, postcode, stad) 
SELECT 
    '00000000-0000-0000-0000-000000000001' as tenant_id,
    fc.id as client_id,
    'Leverancier C' as naam,
    'Piet Bakker' as contactpersoon,
    'piet@leverancierc.nl' as email,
    '+31 10 3456789' as telefoon,
    'Havenweg 50' as adres,
    '3000 CC' as postcode,
    'Rotterdam' as stad
FROM fc_clients fc 
WHERE fc.tenant_id = '00000000-0000-0000-0000-000000000001'
LIMIT 1
ON CONFLICT DO NOTHING;
