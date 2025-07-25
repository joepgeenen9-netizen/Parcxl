-- Create roles table
CREATE TABLE IF NOT EXISTS tenant_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role_id UUID NOT NULL REFERENCES tenant_roles(id) ON DELETE CASCADE,
    permission_key VARCHAR(100) NOT NULL,
    permission_name VARCHAR(200) NOT NULL,
    enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role_id, permission_key)
);

-- Update tenant_users table to include role
ALTER TABLE tenant_users 
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES tenant_roles(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tenant_roles_tenant_id ON tenant_roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_role_id ON tenant_users(role_id);

-- Insert default permissions for new roles
CREATE OR REPLACE FUNCTION create_default_permissions(role_id_param UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO role_permissions (role_id, permission_key, permission_name, enabled) VALUES
    (role_id_param, 'view_dashboard', 'Dashboard bekijken', true),
    (role_id_param, 'view_orders', 'Bestellingen bekijken', false),
    (role_id_param, 'create_orders', 'Bestellingen aanmaken', false),
    (role_id_param, 'edit_orders', 'Bestellingen bewerken', false),
    (role_id_param, 'delete_orders', 'Bestellingen verwijderen', false),
    (role_id_param, 'view_inventory', 'Voorraad bekijken', false),
    (role_id_param, 'edit_inventory', 'Voorraad bewerken', false),
    (role_id_param, 'view_returns', 'Retouren bekijken', false),
    (role_id_param, 'process_returns', 'Retouren verwerken', false),
    (role_id_param, 'view_picklists', 'Picklijsten bekijken', false),
    (role_id_param, 'create_picklists', 'Picklijsten aanmaken', false),
    (role_id_param, 'view_batches', 'Batches bekijken', false),
    (role_id_param, 'create_batches', 'Batches aanmaken', false),
    (role_id_param, 'view_products', 'Producten bekijken', false),
    (role_id_param, 'edit_products', 'Producten bewerken', false),
    (role_id_param, 'view_customers', 'Klanten bekijken', false),
    (role_id_param, 'edit_customers', 'Klanten bewerken', false),
    (role_id_param, 'view_reports', 'Rapporten bekijken', false),
    (role_id_param, 'manage_users', 'Gebruikers beheren', false),
    (role_id_param, 'manage_settings', 'Instellingen beheren', false)
    ON CONFLICT (role_id, permission_key) DO NOTHING;
END;
$$ LANGUAGE plpgsql;
