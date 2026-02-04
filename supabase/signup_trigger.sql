-- 1. Create a function that handles the creation of a patient profile
-- This function reads the metadata passed during signUp
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.patients (
    user_id, 
    email, 
    nome, 
    idade, 
    sexo, 
    peso, 
    sport_modalities_id, 
    season_phases_id
  )
  values (
    new.id,
    new.email,
    (new.raw_user_meta_data->>'nome')::text,
    (new.raw_user_meta_data->>'idade')::integer,
    (new.raw_user_meta_data->>'sexo')::text,
    (new.raw_user_meta_data->>'peso')::numeric,
    (new.raw_user_meta_data->>'sport_modalities_id')::uuid,
    (new.raw_user_meta_data->>'season_phases_id')::uuid
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. Create the trigger on the auth.users table
-- Dropping first to avoid conflicts if re-running
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
