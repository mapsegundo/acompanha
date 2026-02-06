-- Add recovery score columns to weekly_checkins
ALTER TABLE weekly_checkins ADD COLUMN IF NOT EXISTS recovery_score integer CHECK (recovery_score BETWEEN 0 AND 100);
ALTER TABLE weekly_checkins ADD COLUMN IF NOT EXISTS recovery_status text CHECK (recovery_status IN ('Seguro', 'Atenção', 'Crítico'));

-- Create function to calculate recovery score based on Hooper Index
CREATE OR REPLACE FUNCTION calculate_recovery_score()
RETURNS TRIGGER AS $$
DECLARE
    hooper_index numeric;
    recovery_base numeric;
    adjustment numeric;
    final_score numeric;
    final_status text;
BEGIN
    -- Hooper Index: HI = fadiga + estresse + dor_muscular + (10 - sono)
    hooper_index := COALESCE(NEW.cansaco, 5) 
                  + COALESCE(NEW.estresse, 5)
                  + COALESCE(NEW.dor_muscular, 5)
                  + (10 - COALESCE(NEW.qualidade_sono, 5));
    
    -- Convert to Recovery Score (0-100)
    -- HI ranges 0-40, so: RecoveryBase = 100 - (HI * 2.5)
    recovery_base := 100 - (hooper_index * 2.5);
    
    -- Adjustment based on humor and libido
    -- Adjustment = ((humor - 5) * 2) + ((libido - 5) * 1)
    adjustment := ((COALESCE(NEW.humor, 5) - 5) * 2) 
                + ((COALESCE(NEW.libido, 5) - 5) * 1);
    
    final_score := recovery_base + adjustment;
    
    -- Penalty for injury
    IF NEW.lesao = true THEN
        final_score := final_score - 12;
        -- Cap at 70 max when injured
        IF final_score > 70 THEN
            final_score := 70;
        END IF;
    END IF;
    
    -- Clamp to 0-100
    IF final_score < 0 THEN
        final_score := 0;
    ELSIF final_score > 100 THEN
        final_score := 100;
    END IF;
    
    -- Determine status
    IF final_score >= 80 THEN
        final_status := 'Seguro';
    ELSIF final_score >= 60 THEN
        final_status := 'Atenção';
    ELSE
        final_status := 'Crítico';
    END IF;
    
    -- Set the calculated values
    NEW.recovery_score := ROUND(final_score);
    NEW.recovery_status := final_status;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that runs before insert or update
DROP TRIGGER IF EXISTS trigger_calculate_recovery_score ON weekly_checkins;
CREATE TRIGGER trigger_calculate_recovery_score
    BEFORE INSERT OR UPDATE ON weekly_checkins
    FOR EACH ROW
    EXECUTE FUNCTION calculate_recovery_score();

-- Update existing records
UPDATE weekly_checkins SET recovery_score = recovery_score WHERE recovery_score IS NULL;
