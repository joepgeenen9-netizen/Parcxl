-- Add multi-platform support columns to fc_client_products table
ALTER TABLE fc_client_products
ADD COLUMN IF NOT EXISTS platform_2 VARCHAR(50),
ADD COLUMN IF NOT EXISTS product_id_2 VARCHAR(100),
ADD COLUMN IF NOT EXISTS platform_3 VARCHAR(50),
ADD COLUMN IF NOT EXISTS product_id_3 VARCHAR(100),
ADD COLUMN IF NOT EXISTS platform_4 VARCHAR(50),
ADD COLUMN IF NOT EXISTS product_id_4 VARCHAR(100),
ADD COLUMN IF NOT EXISTS platform_5 VARCHAR(50),
ADD COLUMN IF NOT EXISTS product_id_5 VARCHAR(100),
ADD COLUMN IF NOT EXISTS platform_6 VARCHAR(50),
ADD COLUMN IF NOT EXISTS product_id_6 VARCHAR(100);

-- Add indexes for better performance on platform columns
CREATE INDEX IF NOT EXISTS idx_fc_client_products_platform_2 ON fc_client_products(platform_2);
CREATE INDEX IF NOT EXISTS idx_fc_client_products_platform_3 ON fc_client_products(platform_3);
CREATE INDEX IF NOT EXISTS idx_fc_client_products_platform_4 ON fc_client_products(platform_4);
CREATE INDEX IF NOT EXISTS idx_fc_client_products_platform_5 ON fc_client_products(platform_5);
CREATE INDEX IF NOT EXISTS idx_fc_client_products_platform_6 ON fc_client_products(platform_6);

-- Ensure existing records have proper platform values
UPDATE fc_client_products 
SET platform = 'woocommerce' 
WHERE platform IS NULL AND platform_product_id IS NOT NULL;
