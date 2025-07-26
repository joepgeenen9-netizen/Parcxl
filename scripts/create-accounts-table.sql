-- Create accounts table with role-based authentication
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  rol VARCHAR(50) NOT NULL DEFAULT 'klant' CHECK (rol IN ('admin', 'klant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Create policy for accounts table
CREATE POLICY "Users can view their own account" ON accounts
  FOR SELECT USING (auth.uid()::text = id::text);

-- Insert sample accounts for testing
INSERT INTO accounts (email, password_hash, name, company, rol) VALUES
  ('admin@parcxl.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin Beheerder', 'Parcxl B.V.', 'admin'),
  ('jan@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jan Janssen', 'Janssen B.V.', 'klant'),
  ('maria@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Maria Bakker', 'Bakker & Co', 'klant')
ON CONFLICT (email) DO NOTHING;

-- Note: Password for all test accounts is 'password'
