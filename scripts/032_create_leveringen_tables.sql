-- Create leveranciers table
CREATE TABLE IF NOT EXISTS leveranciers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    naam TEXT NOT NULL,
    contactpersoon TEXT,
    email TEXT,
    telefoon TEXT,
    adres TEXT,
    postcode TEXT,
    stad TEXT,
    land TEXT DEFAULT 'Nederland',
    btw_nummer TEXT,
    kvk_nummer TEXT,
    actief BOOLEAN DEFAULT true,
    aangemaakt_op TIMESTAMP WITH TIME ZONE DEFAULT now(),
    bijgewerkt_op TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create locaties table
CREATE TABLE IF NOT EXISTS locaties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    naam TEXT NOT NULL,
    type TEXT CHECK (type IN ('rek', 'vak', 'zone', 'magazijn')) DEFAULT 'vak',
    barcode TEXT UNIQUE,
    capaciteit INTEGER,
    beschrijving TEXT,
    actief BOOLEAN DEFAULT true,
    aangemaakt_op TIMESTAMP WITH TIME ZONE DEFAULT now(),
    bijgewerkt_op TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create leveringen table
CREATE TABLE IF NOT EXISTS leveringen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referentie TEXT NOT NULL UNIQUE,
    klant_id UUID REFERENCES fc_clients(id) ON DELETE CASCADE,
    leverancier_id UUID REFERENCES leveranciers(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('verwacht', 'onderweg', 'aangekomen', 'gecontroleerd', 'opgeslagen', 'geannuleerd')) DEFAULT 'verwacht',
    verwachte_aankomst TIMESTAMP WITH TIME ZONE NOT NULL,
    daadwerkelijke_aankomst TIMESTAMP WITH TIME ZONE,
    vervoerder TEXT,
    tracking_link TEXT,
    aangemaakt_op TIMESTAMP WITH TIME ZONE DEFAULT now(),
    aangemaakt_door_id UUID,
    externe_referentie TEXT,
    opmerkingen TEXT,
    bijgewerkt_op TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create levering_items table
CREATE TABLE IF NOT EXISTS levering_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    levering_id UUID REFERENCES leveringen(id) ON DELETE CASCADE,
    product_id UUID REFERENCES fc_client_products(id) ON DELETE CASCADE,
    verwacht_aantal INTEGER NOT NULL CHECK (verwacht_aantal > 0),
    ontvangen_aantal INTEGER CHECK (ontvangen_aantal >= 0),
    opslag_locatie_id UUID REFERENCES locaties(id) ON DELETE SET NULL,
    tht_datum DATE,
    lotnummer TEXT,
    conditie TEXT CHECK (conditie IN ('Goed', 'Beschadigd', 'Verpakking gescheurd', 'Overig')),
    opmerkingen TEXT,
    aangemaakt_op TIMESTAMP WITH TIME ZONE DEFAULT now(),
    bijgewerkt_op TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert sample leveranciers
INSERT INTO leveranciers (naam, contactpersoon, email, telefoon, adres, postcode, stad) VALUES
('Leverancier A', 'Jan Jansen', 'jan@leveranciera.nl', '+31 20 1234567', 'Industrieweg 1', '1000 AA', 'Amsterdam'),
('Leverancier B', 'Marie de Vries', 'marie@leverancierb.nl', '+31 30 2345678', 'Logistiekstraat 25', '3500 BB', 'Utrecht'),
('Leverancier C', 'Piet Bakker', 'piet@leverancierc.nl', '+31 10 3456789', 'Havenweg 50', '3000 CC', 'Rotterdam')
ON CONFLICT DO NOTHING;

-- Insert sample locaties
INSERT INTO locaties (naam, type, barcode, capaciteit, beschrijving) VALUES
('Locatie A-01', 'vak', 'LOC-A-01', 100, 'Vak A01 in magazijn A'),
('Locatie A-02', 'vak', 'LOC-A-02', 150, 'Vak A02 in magazijn A'),
('Locatie B-01', 'vak', 'LOC-B-01', 200, 'Vak B01 in magazijn B'),
('Locatie B-02', 'vak', 'LOC-B-02', 120, 'Vak B02 in magazijn B'),
('Zone A', 'zone', 'ZONE-A', 1000, 'Gehele zone A'),
('Zone B', 'zone', 'ZONE-B', 800, 'Gehele zone B')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leveringen_klant_id ON leveringen(klant_id);
CREATE INDEX IF NOT EXISTS idx_leveringen_leverancier_id ON leveringen(leverancier_id);
CREATE INDEX IF NOT EXISTS idx_leveringen_status ON leveringen(status);
CREATE INDEX IF NOT EXISTS idx_leveringen_verwachte_aankomst ON leveringen(verwachte_aankomst);
CREATE INDEX IF NOT EXISTS idx_levering_items_levering_id ON levering_items(levering_id);
CREATE INDEX IF NOT EXISTS idx_levering_items_product_id ON levering_items(product_id);
CREATE INDEX IF NOT EXISTS idx_locaties_barcode ON locaties(barcode);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.bijgewerkt_op = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leveranciers_updated_at BEFORE UPDATE ON leveranciers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locaties_updated_at BEFORE UPDATE ON locaties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leveringen_updated_at BEFORE UPDATE ON leveringen FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_levering_items_updated_at BEFORE UPDATE ON levering_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
