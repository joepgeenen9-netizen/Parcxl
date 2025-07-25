-- Add missing columns to tenants table if they don't exist
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add other missing columns that might be needed
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS return_company VARCHAR(255),
ADD COLUMN IF NOT EXISTS return_street VARCHAR(255),
ADD COLUMN IF NOT EXISTS return_house_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS return_postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS return_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS return_country VARCHAR(100) DEFAULT 'Nederland',
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Update existing records to have updated_at = created_at if updated_at is null
UPDATE tenants 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Create or replace function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on row updates
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
