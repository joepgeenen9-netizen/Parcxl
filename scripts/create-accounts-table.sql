-- Create accounts table with role-based access
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'klant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample accounts
INSERT INTO accounts (email, password_hash, name, company, rol) VALUES
('admin@parcxl.com', '$2b$10$rQZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9Q', 'Admin Beheerder', 'Parcxl B.V.', 'admin'),
('jan@example.com', '$2b$10$rQZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9Q', 'Jan Janssen', 'Janssen B.V.', 'klant'),
('maria@example.com', '$2b$10$rQZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9Q', 'Maria Bakker', 'Bakker & Co', 'klant'),
('piet@example.com', '$2b$10$rQZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9Q', 'Piet Klaassen', 'Klaassen Transport', 'klant');

-- Create RLS policies
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read their own account
CREATE POLICY "Users can read own account" ON accounts
  FOR SELECT USING (auth.uid()::text = id::text);

-- Policy for service role to manage all accounts
CREATE POLICY "Service role can manage accounts" ON accounts
  FOR ALL USING (auth.role() = 'service_role');
