-- Create fc_client_products table for Packway fulfillment platform
CREATE TABLE IF NOT EXISTS fc_client_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES fc_clients(id) ON DELETE CASCADE,
    sku TEXT NOT NULL,
    article_number TEXT,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    weight_grams INTEGER,
    dimensions_cm JSON,
    barcode TEXT,
    stock INTEGER DEFAULT 0,
    location TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_fc_client_products_tenant_id ON fc_client_products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fc_client_products_client_id ON fc_client_products(client_id);
CREATE INDEX IF NOT EXISTS idx_fc_client_products_sku ON fc_client_products(sku);
CREATE INDEX IF NOT EXISTS idx_fc_client_products_barcode ON fc_client_products(barcode);

-- Add RLS (Row Level Security) policies
ALTER TABLE fc_client_products ENABLE ROW LEVEL SECURITY;

-- Policy for tenant isolation
CREATE POLICY IF NOT EXISTS "fc_client_products_tenant_isolation" ON fc_client_products
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
