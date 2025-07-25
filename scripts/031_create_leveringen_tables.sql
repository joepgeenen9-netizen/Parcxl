-- Create leveringen (deliveries) table
CREATE TABLE IF NOT EXISTS leveringen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referentie TEXT NOT NULL,
    klant_id UUID NOT NULL,
    leverancier_id UUID NOT NULL,
    status TEXT NOT NULL,
    verwachte_aankomst TIMESTAMP WITH TIME ZONE NOT NULL,
    daadwerkelijke_aankomst TIMESTAMP WITH TIME ZONE,
    vervoerder TEXT,
    tracking_link TEXT,
    aangemaakt_op TIMESTAMP WITH TIME ZONE DEFAULT now(),
    aangemaakt_door_id UUID NOT NULL,
    externe_referentie TEXT,
    opmerkingen TEXT,
    
    -- Foreign key constraints
    CONSTRAINT fk_leveringen_klant FOREIGN KEY (klant_id) REFERENCES fc_clients(id) ON DELETE CASCADE,
    CONSTRAINT fk_leveringen_leverancier FOREIGN KEY (leverancier_id) REFERENCES fc_clients(id) ON DELETE CASCADE,
    CONSTRAINT fk_leveringen_aangemaakt_door FOREIGN KEY (aangemaakt_door_id) REFERENCES fc_client_users(id) ON DELETE CASCADE
);

-- Create levering_items (delivery items) table
CREATE TABLE IF NOT EXISTS levering_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    levering_id UUID NOT NULL,
    product_id UUID NOT NULL,
    verwacht_aantal INTEGER NOT NULL,
    ontvangen_aantal INTEGER,
    opslag_locatie_id UUID,
    tht_datum DATE,
    lotnummer TEXT,
    conditie TEXT,
    
    -- Foreign key constraints
    CONSTRAINT fk_levering_items_levering FOREIGN KEY (levering_id) REFERENCES leveringen(id) ON DELETE CASCADE,
    CONSTRAINT fk_levering_items_product FOREIGN KEY (product_id) REFERENCES fc_client_products(id) ON DELETE CASCADE,
    CONSTRAINT fk_levering_items_opslag_locatie FOREIGN KEY (opslag_locatie_id) REFERENCES fc_client_products(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leveringen_klant_id ON leveringen(klant_id);
CREATE INDEX IF NOT EXISTS idx_leveringen_leverancier_id ON leveringen(leverancier_id);
CREATE INDEX IF NOT EXISTS idx_leveringen_status ON leveringen(status);
CREATE INDEX IF NOT EXISTS idx_leveringen_verwachte_aankomst ON leveringen(verwachte_aankomst);
CREATE INDEX IF NOT EXISTS idx_leveringen_aangemaakt_op ON leveringen(aangemaakt_op);

CREATE INDEX IF NOT EXISTS idx_levering_items_levering_id ON levering_items(levering_id);
CREATE INDEX IF NOT EXISTS idx_levering_items_product_id ON levering_items(product_id);
CREATE INDEX IF NOT EXISTS idx_levering_items_tht_datum ON levering_items(tht_datum);

-- Add comments for documentation
COMMENT ON TABLE leveringen IS 'Table for managing incoming stock deliveries';
COMMENT ON COLUMN leveringen.referentie IS 'Internal reference number for the delivery';
COMMENT ON COLUMN leveringen.klant_id IS 'Client who is receiving the delivery';
COMMENT ON COLUMN leveringen.leverancier_id IS 'Supplier who is sending the delivery';
COMMENT ON COLUMN leveringen.status IS 'Current status of the delivery (e.g., pending, in_transit, delivered)';
COMMENT ON COLUMN leveringen.verwachte_aankomst IS 'Expected arrival date and time';
COMMENT ON COLUMN leveringen.daadwerkelijke_aankomst IS 'Actual arrival date and time';
COMMENT ON COLUMN leveringen.vervoerder IS 'Carrier/shipping company';
COMMENT ON COLUMN leveringen.tracking_link IS 'URL for tracking the delivery';
COMMENT ON COLUMN leveringen.aangemaakt_door_id IS 'User who created this delivery record';
COMMENT ON COLUMN leveringen.externe_referentie IS 'External reference number from supplier';

COMMENT ON TABLE levering_items IS 'Individual items within a delivery';
COMMENT ON COLUMN levering_items.verwacht_aantal IS 'Expected quantity to be delivered';
COMMENT ON COLUMN levering_items.ontvangen_aantal IS 'Actual quantity received';
COMMENT ON COLUMN levering_items.opslag_locatie_id IS 'Storage location where item will be placed';
COMMENT ON COLUMN levering_items.tht_datum IS 'Best before date (THT = Tenminste Houdbaar Tot)';
COMMENT ON COLUMN levering_items.lotnummer IS 'Batch/lot number from supplier';
COMMENT ON COLUMN levering_items.conditie IS 'Condition of the received items';
