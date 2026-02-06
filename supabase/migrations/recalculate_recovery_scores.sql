-- Recalculate recovery_score and recovery_status for all existing records
-- This ensures old data has the correct status based on the score formula

UPDATE weekly_checkins 
SET 
    recovery_score = recovery_score,  -- Trigger will recalculate
    recovery_status = recovery_status  -- Trigger will recalculate
WHERE recovery_score IS NOT NULL;

-- Optionally, you can also force recalculation for records without a score:
UPDATE weekly_checkins 
SET 
    recovery_score = COALESCE(recovery_score, 0)
WHERE recovery_score IS NULL;
