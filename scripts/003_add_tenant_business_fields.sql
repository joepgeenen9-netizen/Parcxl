-- Add business and return address fields to tenants table
ALTER TABLE public.tenants
  ADD COLUMN kvk_number text,
  ADD COLUMN vat_number text,
  ADD COLUMN return_company text,
  ADD COLUMN return_street text,
  ADD COLUMN return_house_number text,
  ADD COLUMN return_postal_code text,
  ADD COLUMN return_city text,
  ADD COLUMN return_country text;

-- Add indexes for business fields
CREATE INDEX IF NOT EXISTS idx_tenants_kvk_number ON tenants(kvk_number);
CREATE INDEX IF NOT EXISTS idx_tenants_vat_number ON tenants(vat_number);
