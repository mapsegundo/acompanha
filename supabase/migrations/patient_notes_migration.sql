-- Create patient_notes table for clinical observations
CREATE TABLE IF NOT EXISTS patient_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    visibility TEXT NOT NULL DEFAULT 'doctor_only' CHECK (visibility IN ('doctor_only', 'shared_with_patient')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE patient_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Doctors can insert notes for any patient
CREATE POLICY "Doctors can insert patient notes"
    ON patient_notes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM doctors
            WHERE doctors.id = patient_notes.doctor_id
            AND doctors.user_id = auth.uid()
        )
    );

-- Policy: Doctors can view all notes (from any doctor)
CREATE POLICY "Doctors can view all patient notes"
    ON patient_notes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM doctors
            WHERE doctors.user_id = auth.uid()
        )
    );

-- Policy: Patients can view only shared notes for themselves
CREATE POLICY "Patients can view shared notes"
    ON patient_notes FOR SELECT
    USING (
        visibility = 'shared_with_patient'
        AND EXISTS (
            SELECT 1 FROM patients
            WHERE patients.id = patient_notes.patient_id
            AND patients.user_id = auth.uid()
        )
    );

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_patient_notes_patient_id ON patient_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_notes_doctor_id ON patient_notes(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patient_notes_created_at ON patient_notes(created_at DESC);
