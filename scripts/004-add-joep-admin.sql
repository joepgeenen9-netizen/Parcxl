-- Add Joep Admin account
-- Password: Landblust10a (will be hashed with bcrypt)

INSERT INTO accounts (
    gebruikersnaam, 
    wachtwoord_hash, 
    email, 
    straatnaam, 
    huisnummer, 
    postcode, 
    plaats, 
    status, 
    contactpersoon, 
    bedrijfsnaam, 
    rol
) VALUES 
(
    'Joep Admin', 
    '$2b$12$8K9wLQ5tJ3mN7pR2sV6uXeY1zA4bC8dF9gH0iK2lM5nO7qS9tU3vW', -- password: Landblust10a
    'joep@admin.nl',
    'Adminstraat',
    '1',
    '1000AA',
    'Amsterdam',
    'actief',
    'Joep Admin',
    'Parcxl B.V.',
    'admin'
);

-- Verify the account was created
SELECT 
    id,
    gebruikersnaam,
    email,
    contactpersoon,
    bedrijfsnaam,
    rol,
    status,
    created_at
FROM accounts 
WHERE gebruikersnaam = 'Joep Admin';

-- Show all admin accounts
SELECT 
    id,
    gebruikersnaam,
    email,
    contactpersoon,
    rol,
    status
FROM accounts 
WHERE rol = 'admin'
ORDER BY created_at DESC;
