-- Migration to add admin RLS policies for doctors
-- Run this in your Supabase SQL Editor

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Doctors can insert sport_modalities" ON sport_modalities;
DROP POLICY IF EXISTS "Doctors can update sport_modalities" ON sport_modalities;
DROP POLICY IF EXISTS "Doctors can delete sport_modalities" ON sport_modalities;

DROP POLICY IF EXISTS "Doctors can insert season_phases" ON season_phases;
DROP POLICY IF EXISTS "Doctors can update season_phases" ON season_phases;
DROP POLICY IF EXISTS "Doctors can delete season_phases" ON season_phases;

DROP POLICY IF EXISTS "Doctors can view all doctors" ON doctors;
DROP POLICY IF EXISTS "Doctors can insert doctors" ON doctors;
DROP POLICY IF EXISTS "Doctors can update doctors" ON doctors;
DROP POLICY IF EXISTS "Doctors can delete doctors" ON doctors;

-- Doctors can manage sport_modalities
CREATE POLICY "Doctors can insert sport_modalities"
  ON sport_modalities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE doctors.user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can update sport_modalities"
  ON sport_modalities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE doctors.user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can delete sport_modalities"
  ON sport_modalities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE doctors.user_id = auth.uid()
    )
  );

-- Doctors can manage season_phases
CREATE POLICY "Doctors can insert season_phases"
  ON season_phases FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE doctors.user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can update season_phases"
  ON season_phases FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE doctors.user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can delete season_phases"
  ON season_phases FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE doctors.user_id = auth.uid()
    )
  );

-- Doctors can view all other doctors
CREATE POLICY "Doctors can view all doctors"
  ON doctors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE doctors.user_id = auth.uid()
    )
  );

-- Doctors can insert new doctors
CREATE POLICY "Doctors can insert doctors"
  ON doctors FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE doctors.user_id = auth.uid()
    )
  );

-- Doctors can update other doctors
CREATE POLICY "Doctors can update doctors"
  ON doctors FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE doctors.user_id = auth.uid()
    )
  );

-- Doctors can delete other doctors
CREATE POLICY "Doctors can delete doctors"
  ON doctors FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE doctors.user_id = auth.uid()
    )
  );

-- Update FK constraints to SET NULL on delete (if not already done)
ALTER TABLE patients 
  DROP CONSTRAINT IF EXISTS patients_sport_modalities_id_fkey,
  ADD CONSTRAINT patients_sport_modalities_id_fkey 
    FOREIGN KEY (sport_modalities_id) 
    REFERENCES sport_modalities(id) 
    ON DELETE SET NULL;

ALTER TABLE patients 
  DROP CONSTRAINT IF EXISTS patients_season_phases_id_fkey,
  ADD CONSTRAINT patients_season_phases_id_fkey 
    FOREIGN KEY (season_phases_id) 
    REFERENCES season_phases(id) 
    ON DELETE SET NULL;
