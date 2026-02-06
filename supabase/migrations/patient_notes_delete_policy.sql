-- Policy: Doctors can delete their own notes
CREATE POLICY "Doctors can delete patient notes"
    ON patient_notes FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM doctors
            WHERE doctors.id = patient_notes.doctor_id
            AND doctors.user_id = auth.uid()
        )
    );
