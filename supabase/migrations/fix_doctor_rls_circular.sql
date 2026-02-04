-- Fix RLS for doctors table to properly allow role detection in middleware
-- The issue is that the current policies create a circular dependency
-- A doctor needs to read their record to verify they're a doctor, but the policy checks if they're a doctor first

-- Drop the problematic circular policy
DROP POLICY IF EXISTS "Doctors can view all doctors" ON doctors;

-- Create a proper self-lookup policy (no circular dependency)
CREATE POLICY "Users can view their own doctor record"
  ON doctors FOR SELECT
  USING (auth.uid() = user_id);

-- Create a separate policy for doctors to view OTHER doctors (after they're verified)
CREATE POLICY "Verified doctors can view all doctors"
  ON doctors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM doctors d
      WHERE d.user_id = auth.uid()
    )
  );

-- Note: The above two policies will work together:
-- 1. A user can always find their OWN doctor record (if it exists) via the first policy
-- 2. Once verified as a doctor, they can see all other doctors via the second policy
