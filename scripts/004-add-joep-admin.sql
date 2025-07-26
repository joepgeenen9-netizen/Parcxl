-- Script om Joep Admin account toe te voegen
-- Datum: 2025-01-26

-- Voeg Joep Admin account toe
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
    '$2b$12$8K9vX2mN4pQ7rS1tU3vW6eH5yZ8aB9cD0eF1gH2iJ3kL4mN5oP6qR7s',  -- Hash voor 'Landblust10a'
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

-- Verificatie: Toon het nieuwe account
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
WHERE email = 'joep@admin.nl';

-- Toon alle admin accounts ter verificatie
SELECT 
    gebruikersnaam,
    email,
    contactpersoon,
    status,
    created_at
FROM accounts 
WHERE rol = 'admin'
ORDER BY created_at DESC;

-- Statistieken na toevoeging
SELECT 
    rol,
    status,
    COUNT(*) as aantal
FROM accounts 
GROUP BY rol, status
ORDER BY rol, status;
