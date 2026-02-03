-- Create doctors table
create table if not exists doctors (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  email text,
  nome text,
  crm text,
  especialidade text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Enable RLS
alter table doctors enable row level security;

-- Doctors policies
create policy "Doctors can view own profile"
  on doctors for select
  using (auth.uid() = user_id);

-- Update Patients policies so Doctors can view them
-- (We need a way to say "If user is in doctors table, they can view all patients")

create policy "Doctors can view all patients"
  on patients for select
  using (
    exists (
      select 1 from doctors
      where doctors.user_id = auth.uid()
    )
  );

create policy "Doctors can view all checkins"
  on weekly_checkins for select
  using (
    exists (
      select 1 from doctors
      where doctors.user_id = auth.uid()
    )
  );

-- Helper to quickly promote a user to doctor (run this in SQL Editor with specific email)
-- insert into doctors (user_id, email, nome)
-- select id, email, 'Admin Doctor' from auth.users where email = 'seu_email@admin.com';
