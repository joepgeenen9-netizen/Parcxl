-- Add updated_at column to fc_client_products table
ALTER TABLE fc_client_products 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT now();

-- Create trigger to automatically update updated_at when row is modified
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists and create new one
DROP TRIGGER IF EXISTS update_fc_client_products_updated_at ON fc_client_products;
CREATE TRIGGER update_fc_client_products_updated_at
    BEFORE UPDATE ON fc_client_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
