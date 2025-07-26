-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'klant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert demo accounts (passwords are hashed version of 'password')
INSERT INTO accounts (email, password_hash, name, company, rol) VALUES
('admin@parcxl.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'Parcxl', 'admin'),
('jan@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jan Janssen', 'Example Corp', 'klant'),
('marie@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Marie de Vries', 'Test BV', 'klant');

-- Enable Row Level Security
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read their own data
CREATE POLICY "Users can read own account" ON accounts
  FOR SELECT USING (auth.uid()::text = id::text);
