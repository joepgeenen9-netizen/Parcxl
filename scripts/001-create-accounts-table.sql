-- Create accounts table for both admin and customer accounts
CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    gebruikersnaam VARCHAR(50) UNIQUE NOT NULL,
    wachtwoord_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    straatnaam VARCHAR(100),
    huisnummer VARCHAR(10),
    huisnummer_toevoeging VARCHAR(10),
    postcode VARCHAR(10),
    plaats VARCHAR(100),
    status VARCHAR(20) DEFAULT 'actief' CHECK (status IN ('actief', 'inactief', 'geblokkeerd', 'pending')),
    contactpersoon VARCHAR(100),
    bedrijfsnaam VARCHAR(100),
    rol VARCHAR(20) NOT NULL DEFAULT 'klant' CHECK (rol IN ('admin', 'klant')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts(email);
CREATE INDEX IF NOT EXISTS idx_accounts_gebruikersnaam ON accounts(gebruikersnaam);
CREATE INDEX IF NOT EXISTS idx_accounts_rol ON accounts(rol);
CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_accounts_updated_at 
    BEFORE UPDATE ON accounts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments to describe the table and columns
COMMENT ON TABLE accounts IS 'Accounts table for both admin and customer users';
COMMENT ON COLUMN accounts.id IS 'Primary key, auto-incrementing';
COMMENT ON COLUMN accounts.gebruikersnaam IS 'Unique username for login';
COMMENT ON COLUMN accounts.wachtwoord_hash IS 'Hashed password for security';
COMMENT ON COLUMN accounts.email IS 'Unique email address';
COMMENT ON COLUMN accounts.straatnaam IS 'Street name for address';
COMMENT ON COLUMN accounts.huisnummer IS 'House number';
COMMENT ON COLUMN accounts.huisnummer_toevoeging IS 'House number addition (e.g., A, B, bis)';
COMMENT ON COLUMN accounts.postcode IS 'Postal code';
COMMENT ON COLUMN accounts.plaats IS 'City/town name';
COMMENT ON COLUMN accounts.status IS 'Account status: actief, inactief, geblokkeerd, pending';
COMMENT ON COLUMN accounts.contactpersoon IS 'Contact person name';
COMMENT ON COLUMN accounts.bedrijfsnaam IS 'Company name';
COMMENT ON COLUMN accounts.rol IS 'User role: admin or klant';
COMMENT ON COLUMN accounts.created_at IS 'Account creation timestamp';
COMMENT ON COLUMN accounts.updated_at IS 'Last update timestamp';
