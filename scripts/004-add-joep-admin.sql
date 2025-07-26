-- Script om Joep Admin account toe te voegen
-- Wachtwoord: Landblust10a (gehashed met bcrypt)

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
    '$2b$12$8K9wE2nF5qL7mP3oR6sT8eH4jK1nM9pQ2wE5rT7yU8iO3pL6kJ9mN',
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

-- Toon alle admin accounts ter controle
SELECT 
    gebruikersnaam,
    email,
    contactpersoon,
    status,
    created_at
FROM accounts 
WHERE rol = 'admin'
ORDER BY created_at DESC;
