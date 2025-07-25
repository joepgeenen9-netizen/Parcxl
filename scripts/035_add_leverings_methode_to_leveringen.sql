-- Add delivery method column to leveringen table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leveringen' 
        AND column_name = 'leverings_methode'
    ) THEN
        ALTER TABLE leveringen 
        ADD COLUMN leverings_methode VARCHAR(20) CHECK (leverings_methode IN ('dozen', 'pallets', 'rolcontainer', 'zeecontainer'));
        
        COMMENT ON COLUMN leveringen.leverings_methode IS 'Methode van levering: dozen, pallets, rolcontainer, zeecontainer';
    END IF;
END $$;

-- Update existing records to have a default value (optional)
UPDATE leveringen 
SET leverings_methode = 'dozen' 
WHERE leverings_methode IS NULL;
