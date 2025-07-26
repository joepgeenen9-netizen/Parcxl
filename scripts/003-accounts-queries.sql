-- Useful queries for the accounts table

-- Get all active customers
SELECT 
    id,
    gebruikersnaam,
    email,
    contactpersoon,
    bedrijfsnaam,
    CONCAT(straatnaam, ' ', huisnummer, COALESCE(huisnummer_toevoeging, '')) as volledig_adres,
    CONCAT(postcode, ' ', plaats) as postcode_plaats,
    status,
    created_at
FROM accounts 
WHERE rol = 'klant' AND status = 'actief'
ORDER BY bedrijfsnaam;

-- Get all admin accounts
SELECT 
    id,
    gebruikersnaam,
    email,
    contactpersoon,
    status,
    created_at
FROM accounts 
WHERE rol = 'admin'
ORDER BY created_at;

-- Get account statistics
SELECT 
    rol,
    status,
    COUNT(*) as aantal
FROM accounts 
GROUP BY rol, status
ORDER BY rol, status;

-- Get accounts that need attention (pending or blocked)
SELECT 
    id,
    gebruikersnaam,
    email,
    contactpersoon,
    bedrijfsnaam,
    status,
    rol,
    created_at
FROM accounts 
WHERE status IN ('pending', 'geblokkeerd')
ORDER BY created_at DESC;

-- Search accounts by company name or contact person
-- Example usage: Replace 'Janssen' with actual search term
SELECT 
    id,
    gebruikersnaam,
    email,
    contactpersoon,
    bedrijfsnaam,
    status,
    rol
FROM accounts 
WHERE 
    bedrijfsnaam ILIKE '%Janssen%' 
    OR contactpersoon ILIKE '%Janssen%'
    OR email ILIKE '%Janssen%'
ORDER BY bedrijfsnaam;
