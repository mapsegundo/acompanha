-- FINAL FIX: Doctors RLS policies (NO RECURSION)
-- This was applied directly to Supabase on 2026-02-04

-- The previous policies caused "infinite recursion detected in policy"
-- because they checked the doctors table to allow access to doctors table

-- SOLUTION: Use auth.role() = 'authenticated' which doesn't cause recursion

-- 1. Drop ALL existing problematic policies
DROP POLICY IF EXISTS "Doctors can view own profile" ON doctors;
DROP POLICY IF EXISTS "Users can view their own doctor record" ON doctors;
DROP POLICY IF EXISTS "Verified doctors can view all doctors" ON doctors;
DROP POLICY IF EXISTS "Doctors can view all doctors" ON doctors;
DROP POLICY IF EXISTS "Doctors can insert doctors" ON doctors;
DROP POLICY IF EXISTS "Doctors can update doctors" ON doctors;
DROP POLICY IF EXISTS "Doctors can delete doctors" ON doctors;

-- 2. Create SIMPLE non-recursive policies
CREATE POLICY "Users can view their own doctor record"
  ON doctors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view all doctors"
  ON doctors FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert doctors"
  ON doctors FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update doctors"
  ON doctors FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete doctors"
  ON doctors FOR DELETE
  USING (auth.role() = 'authenticated');
