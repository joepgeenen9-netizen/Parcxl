-- Insert sample admin and customer accounts
-- Note: In production, passwords should be properly hashed using bcrypt or similar

-- Insert admin accounts
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
    'admin', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlG.', -- password: admin123
    'admin@parcxl.com',
    'Hoofdstraat',
    '1',
    '1000AA',
    'Amsterdam',
    'actief',
    'Admin Beheerder',
    'Parcxl B.V.',
    'admin'
),
(
    'superadmin', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlG.', -- password: admin123
    'superadmin@parcxl.com',
    'Kantoorpark',
    '25',
    '1000BB',
    'Amsterdam',
    'actief',
    'Super Admin',
    'Parcxl B.V.',
    'admin'
);

-- Insert customer accounts
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
) VALUES 
(
    'janjanssen', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlG.', -- password: klant123
    'jan@janssen.nl',
    'Kerkstraat',
    '15',
    'A',
    '2000CC',
    'Rotterdam',
    'actief',
    'Jan Janssen',
    'Janssen B.V.',
    'klant'
),
(
    'mariabakker', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlG.', -- password: klant123
    'maria@bakkerij.nl',
    'Marktplein',
    '8',
    NULL,
    '3000DD',
    'Utrecht',
    'actief',
    'Maria Bakker',
    'Bakkerij Bakker',
    'klant'
),
(
    'pietklaassen', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlG.', -- password: klant123
    'piet@klaassen.com',
    'Industrieweg',
    '42',
    'B',
    '4000EE',
    'Den Haag',
    'actief',
    'Piet Klaassen',
    'Klaassen Transport',
    'klant'
),
(
    'annavries', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlG.', -- password: klant123
    'anna@vries.nl',
    'Dorpsstraat',
    '123',
    NULL,
    '5000FF',
    'Eindhoven',
    'pending',
    'Anna de Vries',
    'De Vries Handel',
    'klant'
),
(
    'testklant', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlG.', -- password: klant123
    'test@example.com',
    'Teststraat',
    '99',
    NULL,
    '9999ZZ',
    'Teststad',
    'inactief',
    'Test Gebruiker',
    'Test B.V.',
    'klant'
);

-- Display inserted data
SELECT 
    id,
    gebruikersnaam,
    email,
    CONCAT(straatnaam, ' ', huisnummer, COALESCE(huisnummer_toevoeging, '')) as adres,
    CONCAT(postcode, ' ', plaats) as postcode_plaats,
    status,
    contactpersoon,
    bedrijfsnaam,
    rol,
    created_at
FROM accounts 
ORDER BY rol DESC, created_at ASC;
