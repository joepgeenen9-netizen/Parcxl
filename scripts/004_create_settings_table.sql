-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
    key text PRIMARY KEY,
    value text,
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Policy: Super-admins can read/write settings
CREATE POLICY "super_admin_rw"
    ON public.settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.super_admins 
            WHERE id = auth.uid()
        )
    );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_updated_at ON settings(updated_at DESC);
