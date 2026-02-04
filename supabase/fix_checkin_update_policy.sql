-- Add missing update policy for weekly_checkins
create policy "Patients can update own checkins"
  on weekly_checkins for update
  using (
    exists (
      select 1 from patients
      where patients.id = weekly_checkins.patient_id
      and patients.user_id = auth.uid()
    )
  );
