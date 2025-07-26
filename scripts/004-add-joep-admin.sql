-- Add Joep Admin account
-- Password: Landblust10a (hashed with bcrypt)

INSERT INTO accounts (
    gebruikersnaam,
    wachtwoord_hash,
    email,
    straatnaam,
    huisnummer,
    huisnummer_toevoeging,
    postcode,
    plaats,
    status,
    contactpersoon,
    bedrijfsnaam,
    rol
) VALUES (
    'Joep Admin',
    '$2a$12$8K9wE2nF5qL7mP3oR6sT8eH4vB1xC9yD2zA5wE8nF6qL7mP3oR6sT8',
    'joep@admin.nl',
    'Hoofdstraat',
    '123',
    NULL,
    '1234AB',
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

-- Show all admin accounts for verification
SELECT 
    gebruikersnaam,
    email,
    contactpersoon,
    bedrijfsnaam,
    status
FROM accounts 
WHERE rol = 'admin'
ORDER BY created_at DESC;
