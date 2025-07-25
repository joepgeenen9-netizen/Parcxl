-- Add address fields to fc_clients table
ALTER TABLE fc_clients 
ADD COLUMN IF NOT EXISTS address_company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS address_contact_person VARCHAR(255),
ADD COLUMN IF NOT EXISTS address_street VARCHAR(255),
ADD COLUMN IF NOT EXISTS address_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS address_postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS address_city VARCHAR(255),
ADD COLUMN IF NOT EXISTS address_country VARCHAR(255) DEFAULT 'Nederland';

-- Create indexes for address fields
CREATE INDEX IF NOT EXISTS idx_fc_clients_address_city ON fc_clients(address_city);
CREATE INDEX IF NOT EXISTS idx_fc_clients_address_postal_code ON fc_clients(address_postal_code);
