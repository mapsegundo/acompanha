-- Create body_measurements table
create table if not exists body_measurements (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid references patients(id) not null,
  data date not null,
  foto_url text,
  peso_corporal numeric,
  cintura numeric,
  gordura_corporal numeric,
  massa_magra numeric,
  pescoco numeric,
  ombro numeric,
  peito numeric,
  biceps_esquerdo numeric,
  biceps_direito numeric,
  antebraco_esquerdo numeric,
  antebraco_direito numeric,
  abdomen numeric,
  quadris numeric,
  coxa_esquerda numeric,
  coxa_direita numeric,
  panturrilha_esquerda numeric,
  panturrilha_direita numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table body_measurements enable row level security;

-- Patients can view own measurements
create policy "Patients can view own measurements"
  on body_measurements for select
  using (
    exists (
      select 1 from patients
      where patients.id = body_measurements.patient_id
      and patients.user_id = auth.uid()
    )
  );

-- Patients can insert own measurements
create policy "Patients can insert own measurements"
  on body_measurements for insert
  with check (
    exists (
      select 1 from patients
      where patients.id = body_measurements.patient_id
      and patients.user_id = auth.uid()
    )
  );

-- Patients can update own measurements
create policy "Patients can update own measurements"
  on body_measurements for update
  using (
    exists (
      select 1 from patients
      where patients.id = body_measurements.patient_id
      and patients.user_id = auth.uid()
    )
  );

-- Patients can delete own measurements
create policy "Patients can delete own measurements"
  on body_measurements for delete
  using (
    exists (
      select 1 from patients
      where patients.id = body_measurements.patient_id
      and patients.user_id = auth.uid()
    )
  );

-- Doctors can view all measurements
create policy "Doctors can view all measurements"
  on body_measurements for select
  using (
    exists (
      select 1 from doctors
      where doctors.user_id = auth.uid()
    )
  );

-- Create storage bucket for measurement photos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('measurements', 'measurements', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

-- Storage policies: patients can upload their own photos
create policy "Patients can upload measurement photos"
  on storage.objects for insert
  with check (
    bucket_id = 'measurements'
    and auth.role() = 'authenticated'
  );

-- Patients can view their own photos
create policy "Patients can view measurement photos"
  on storage.objects for select
  using (
    bucket_id = 'measurements'
    and auth.role() = 'authenticated'
  );

-- Patients can update their own photos
create policy "Patients can update measurement photos"
  on storage.objects for update
  using (
    bucket_id = 'measurements'
    and auth.role() = 'authenticated'
  );

-- Patients can delete their own photos
create policy "Patients can delete measurement photos"
  on storage.objects for delete
  using (
    bucket_id = 'measurements'
    and auth.role() = 'authenticated'
  );
