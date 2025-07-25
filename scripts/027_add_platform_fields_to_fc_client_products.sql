-- Add platform and platform_product_id columns to fc_client_products table
ALTER TABLE fc_client_products 
ADD COLUMN IF NOT EXISTS platform VARCHAR(50) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS platform_product_id VARCHAR(100);

-- Add index for better performance on platform queries
CREATE INDEX IF NOT EXISTS idx_fc_client_products_platform 
ON fc_client_products(platform, platform_product_id);

-- Add index for SKU lookups
CREATE INDEX IF NOT EXISTS idx_fc_client_products_sku_client 
ON fc_client_products(sku, client_id, tenant_id);

-- Add index for platform product lookups
CREATE INDEX IF NOT EXISTS idx_fc_client_products_platform_product 
ON fc_client_products(platform_product_id, client_id, tenant_id);
