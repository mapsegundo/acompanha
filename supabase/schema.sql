-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create patients table
create table if not exists patients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  email text,
  nome text,
  idade integer,
  sexo text,
  peso numeric,
  sport_modalities_id uuid references sport_modalities(id),
  season_phases_id uuid references season_phases(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Lookup tables
create table if not exists sport_modalities (
  id uuid primary key default uuid_generate_v4(),
  nome text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists season_phases (
  id uuid primary key default uuid_generate_v4(),
  nome text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed sport_modalities
insert into sport_modalities (nome) values 
('Judô/BJJ'), 
('Musculação'), 
('Hyrox'), 
('Crossfit'), 
('Endurance (Corrida, Ciclismo, Natação)')
on conflict (nome) do nothing;

-- Seed season_phases
insert into season_phases (nome) values 
('Pré-temporada/Preparatório'), 
('Competitiva'), 
('Transição'), 
('Off season')
on conflict (nome) do nothing;

-- Create weekly_checkins table
create table if not exists weekly_checkins (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid references patients(id) not null,
  data date not null,
  peso numeric,
  cansaco integer check (cansaco between 0 and 10),
  horas_treino_7d numeric,
  qualidade_sono integer check (qualidade_sono between 0 and 10),
  dor_muscular integer check (dor_muscular between 0 and 10),
  estresse integer check (estresse between 0 and 10),
  humor integer check (humor between 0 and 10),
  duracao_treino numeric,
  peso_variacao_30d numeric,
  ciclo_menstrual_alterado boolean default false,
  libido integer check (libido between 0 and 10),
  erecao_matinal boolean,
  lesao boolean,
  local_lesao text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table patients enable row level security;
alter table weekly_checkins enable row level security;

-- Policies for Patients
create policy "Patients can view own profile"
  on patients for select
  using (auth.uid() = user_id);

create policy "Patients can update own profile"
  on patients for update
  using (auth.uid() = user_id);

create policy "Patients can insert own profile"
  on patients for insert
  with check (auth.uid() = user_id);

create policy "Patients can view own checkins"
  on weekly_checkins for select
  using (
    exists (
      select 1 from patients
      where patients.id = weekly_checkins.patient_id
      and patients.user_id = auth.uid()
    )
  );

create policy "Patients can insert own checkins"
  on weekly_checkins for insert
  with check (
    exists (
      select 1 from patients
      where patients.id = weekly_checkins.patient_id
      and patients.user_id = auth.uid()
    )
  );

create policy "Patients can update own checkins"
  on weekly_checkins for update
  using (
    exists (
      select 1 from patients
      where patients.id = weekly_checkins.patient_id
      and patients.user_id = auth.uid()
    )
  );

-- Policies for lookup tables
alter table sport_modalities enable row level security;
alter table season_phases enable row level security;

create policy "Anyone can view sport_modalities" on sport_modalities for select using (true);
create policy "Anyone can view season_phases" on season_phases for select using (true);
