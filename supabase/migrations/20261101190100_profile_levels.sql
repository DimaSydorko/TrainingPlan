-- Profile data for strength standards and levels; level/role are server-owned.

alter table public.profiles
  add column role               text not null default 'user' check (role in ('user', 'admin')),
  add column sex                text check (sex in ('male', 'female')),
  add column training_experience text check (training_experience in ('never', 'lt_1y', '1_3y', '3y_plus')),
  add column overall_level      text check (overall_level in ('beginner', 'novice', 'intermediate', 'advanced')),
  add column level_updated_at   timestamptz,
  add column legacy_imported_at timestamptz;

drop policy if exists "profiles: owner insert" on public.profiles;
revoke insert, update, delete, truncate on public.profiles from anon, authenticated;
grant update (display_name, photo_url, sex, training_experience, legacy_imported_at)
  on public.profiles to authenticated;

create or replace function public.level_from_experience(p_experience text)
returns text language sql immutable set search_path = '' as $$
  select case p_experience
    when 'never' then 'beginner'
    when 'lt_1y' then 'novice'
    when '1_3y' then 'intermediate'
    when '3y_plus' then 'advanced'
  end
$$;

create or replace function public.profiles_set_onboarding_level()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.training_experience is distinct from old.training_experience and new.level_updated_at is null then
    new.overall_level = public.level_from_experience(new.training_experience);
  end if;
  return new;
end $$;
revoke execute on function public.profiles_set_onboarding_level() from public, anon, authenticated;

create trigger profiles_onboarding_level before update on public.profiles
  for each row execute function public.profiles_set_onboarding_level();

create table public.body_weights (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  measured_on date not null default current_date,
  weight_kg   numeric(5, 2) not null check (weight_kg between 20 and 400),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, measured_on)
);

alter table public.body_weights enable row level security;
create policy body_weights_select_own on public.body_weights for select to authenticated
  using (user_id = (select auth.uid()));
create policy body_weights_insert_own on public.body_weights for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy body_weights_update_own on public.body_weights for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy body_weights_delete_own on public.body_weights for delete to authenticated
  using (user_id = (select auth.uid()));
create trigger body_weights_updated_at before update on public.body_weights
  for each row execute function public.set_updated_at();

create table public.user_exercise_levels (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  level       text not null check (level in ('beginner', 'novice', 'intermediate', 'advanced')),
  source      text not null check (source in ('standards', 'muscles', 'overall', 'onboarding')),
  confidence  numeric(3, 2) not null check (confidence between 0 and 1),
  updated_at  timestamptz not null default now(),
  primary key (user_id, exercise_id)
);
create index user_exercise_levels_exercise_id_idx on public.user_exercise_levels (exercise_id);

alter table public.user_exercise_levels enable row level security;
create policy user_exercise_levels_select_own on public.user_exercise_levels for select to authenticated
  using (user_id = (select auth.uid()));
revoke insert, update, delete, truncate on public.user_exercise_levels from anon, authenticated;

revoke execute on function public.level_from_experience(text) from public, anon;
grant execute on function public.level_from_experience(text) to authenticated;
