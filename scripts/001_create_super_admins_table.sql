-- Create super_admins table
CREATE TABLE IF NOT EXISTS super_admins (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

-- Policy: Super-admins can manage other super-admins
CREATE POLICY "Super-admins can manage super-admins" ON super_admins
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM super_admins sa 
            WHERE sa.id = auth.uid()
        )
    );

-- Insert indexes for performance
CREATE INDEX IF NOT EXISTS idx_super_admins_created_at ON super_admins(created_at DESC);
