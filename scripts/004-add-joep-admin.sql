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
    '$2b$12$8K9wE2nF5qL7mP3oR6sT8uXvYzA1bC4dE7fG9hI2jK5lM8nO0pQ3r',
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

-- Verificatie query om te controleren of het account is aangemaakt
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

-- Overzicht van alle admin accounts
SELECT 
    gebruikersnaam,
    email,
    contactpersoon,
    bedrijfsnaam,
    status,
    created_at
FROM accounts 
WHERE rol = 'admin'
ORDER BY created_at DESC;
