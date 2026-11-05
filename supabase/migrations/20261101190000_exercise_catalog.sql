-- Replaces the jsonb-based init tables (pushed, empty) with the relational model from
-- .claude/context/supabase-schema-plan.md. Catalog: muscles, movement patterns, exercises, images, standards.

drop table if exists public.plans cascade;
drop table if exists public.workouts cascade;
drop table if exists public.exercise_images cascade;

revoke execute on function public.set_updated_at() from public, anon, authenticated;

create table public.muscle_groups (
  id   text primary key,
  sort smallint not null default 0
);

create table public.muscles (
  id             text primary key,
  group_id       text not null references public.muscle_groups (id),
  recovery_hours smallint not null check (recovery_hours between 12 and 168),
  sort           smallint not null default 0
);
create index muscles_group_id_idx on public.muscles (group_id);

insert into public.muscle_groups (id, sort) values
  ('chest', 1), ('shoulders', 2), ('back', 3), ('biceps', 4), ('triceps', 5), ('forearms', 6),
  ('core', 7), ('glutes', 8), ('quads', 9), ('hamstrings', 10), ('calves', 11);

insert into public.muscles (id, group_id, recovery_hours, sort) values
  ('upper_chest', 'chest', 60, 1),
  ('lower_chest', 'chest', 60, 2),
  ('front_delts', 'shoulders', 48, 3),
  ('side_delts', 'shoulders', 48, 4),
  ('rear_delts', 'shoulders', 48, 5),
  ('lats', 'back', 72, 6),
  ('upper_back', 'back', 60, 7),
  ('lower_back', 'back', 72, 8),
  ('biceps', 'biceps', 48, 9),
  ('triceps', 'triceps', 48, 10),
  ('forearms', 'forearms', 36, 11),
  ('abs', 'core', 36, 12),
  ('obliques', 'core', 36, 13),
  ('glutes', 'glutes', 72, 14),
  ('quads', 'quads', 72, 15),
  ('hamstrings', 'hamstrings', 72, 16),
  ('adductors', 'quads', 60, 17),
  ('abductors', 'glutes', 48, 18),
  ('calves', 'calves', 36, 19);

create table public.exercise_images (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid references public.profiles (id) on delete cascade,
  storage_path text not null check (char_length(storage_path) <= 300),
  file_name    text not null default '' check (char_length(file_name) <= 200),
  filter       text not null default 'gym' check (filter in ('home', 'gym', 'street')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (storage_path)
);
create index exercise_images_owner_id_idx on public.exercise_images (owner_id);

create table public.movement_patterns (
  id                    text primary key,
  reference_exercise_id uuid
);

insert into public.movement_patterns (id) values
  ('horizontal_press'), ('vertical_press'), ('horizontal_pull'), ('vertical_pull'),
  ('squat'), ('hinge'), ('lunge'), ('chest_fly'), ('lateral_raise'), ('elbow_flexion'),
  ('elbow_extension'), ('calf_raise'), ('core_flexion'), ('core_stability'), ('carry');

create table public.exercises (
  id                   uuid primary key default gen_random_uuid(),
  owner_id             uuid references public.profiles (id) on delete cascade,
  name                 text not null check (char_length(name) between 1 and 120),
  image_id             uuid references public.exercise_images (id) on delete set null,
  metric               text not null default 'weight_reps' check (metric in ('weight_reps', 'reps', 'time')),
  is_per_hand          boolean not null default false,
  complexity           smallint check (complexity between 1 and 5),
  pattern_id           text references public.movement_patterns (id),
  pattern_load_ratio   numeric(4, 2) check (pattern_load_ratio > 0),
  based_on_exercise_id uuid references public.exercises (id) on delete set null,
  archived_at          timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index exercises_owner_id_idx on public.exercises (owner_id);
create index exercises_pattern_id_idx on public.exercises (pattern_id);
create index exercises_image_id_idx on public.exercises (image_id);
create index exercises_based_on_idx on public.exercises (based_on_exercise_id);

alter table public.movement_patterns
  add constraint movement_patterns_reference_exercise_fk
  foreign key (reference_exercise_id) references public.exercises (id) on delete set null;

create table public.exercise_muscles (
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  muscle_id   text not null references public.muscles (id),
  weight      numeric(3, 2) not null check (weight between 0.2 and 1.0),
  primary key (exercise_id, muscle_id)
);
create index exercise_muscles_muscle_id_idx on public.exercise_muscles (muscle_id);

create table public.strength_standards (
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  sex         text not null check (sex in ('male', 'female')),
  level       text not null check (level in ('beginner', 'novice', 'intermediate', 'advanced')),
  metric      text not null check (metric in ('bw_ratio', 'reps', 'hold_sec')),
  value       numeric(6, 2) not null check (value > 0),
  primary key (exercise_id, sex, level)
);

create trigger exercise_images_updated_at before update on public.exercise_images
  for each row execute function public.set_updated_at();
create trigger exercises_updated_at before update on public.exercises
  for each row execute function public.set_updated_at();

-- Reference tables: readable by signed-in users, written only by service role (admin Edge Function).
alter table public.muscle_groups enable row level security;
alter table public.muscles enable row level security;
alter table public.movement_patterns enable row level security;
alter table public.strength_standards enable row level security;

create policy muscle_groups_select on public.muscle_groups for select to authenticated using (true);
create policy muscles_select on public.muscles for select to authenticated using (true);
create policy movement_patterns_select on public.movement_patterns for select to authenticated using (true);
create policy strength_standards_select on public.strength_standards for select to authenticated using (true);

revoke insert, update, delete, truncate on public.muscle_groups, public.muscles, public.movement_patterns,
  public.strength_standards from anon, authenticated;

-- Images and exercises: global rows (owner_id null) readable, own rows fully owned.
alter table public.exercise_images enable row level security;
create policy exercise_images_select on public.exercise_images for select to authenticated
  using (owner_id is null or owner_id = (select auth.uid()));
create policy exercise_images_insert_own on public.exercise_images for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy exercise_images_update_own on public.exercise_images for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy exercise_images_delete_own on public.exercise_images for delete to authenticated
  using (owner_id = (select auth.uid()));

alter table public.exercises enable row level security;
create policy exercises_select on public.exercises for select to authenticated
  using (owner_id is null or owner_id = (select auth.uid()));
create policy exercises_insert_own on public.exercises for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy exercises_update_own on public.exercises for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy exercises_delete_own on public.exercises for delete to authenticated
  using (owner_id = (select auth.uid()));

-- Catalog-only fields are not client-writable on custom exercises.
revoke insert, update on public.exercises from anon, authenticated;
grant insert (id, owner_id, name, image_id, metric, is_per_hand, based_on_exercise_id, archived_at)
  on public.exercises to authenticated;
grant update (name, image_id, metric, is_per_hand, archived_at) on public.exercises to authenticated;
alter table public.exercises alter column owner_id set default auth.uid();
alter table public.exercise_images alter column owner_id set default auth.uid();

alter table public.exercise_muscles enable row level security;
create policy exercise_muscles_select on public.exercise_muscles for select to authenticated
  using (exists (
    select 1 from public.exercises e
    where e.id = exercise_id and (e.owner_id is null or e.owner_id = (select auth.uid()))
  ));
create policy exercise_muscles_insert_own on public.exercise_muscles for insert to authenticated
  with check (exists (select 1 from public.exercises e where e.id = exercise_id and e.owner_id = (select auth.uid())));
create policy exercise_muscles_update_own on public.exercise_muscles for update to authenticated
  using (exists (select 1 from public.exercises e where e.id = exercise_id and e.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.exercises e where e.id = exercise_id and e.owner_id = (select auth.uid())));
create policy exercise_muscles_delete_own on public.exercise_muscles for delete to authenticated
  using (exists (select 1 from public.exercises e where e.id = exercise_id and e.owner_id = (select auth.uid())));

-- Storage: catalog images readable by signed-in users (written by admin via service role);
-- custom images under <user_id>/ are owner-only.
insert into storage.buckets (id, name, public) values ('exercise-images', 'exercise-images', false)
  on conflict (id) do nothing;

create policy exercise_images_catalog_read on storage.objects for select to authenticated
  using (bucket_id = 'exercise-images' and (storage.foldername(name))[1] = 'catalog');
create policy exercise_images_own_select on storage.objects for select to authenticated
  using (bucket_id = 'exercise-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy exercise_images_own_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'exercise-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy exercise_images_own_update on storage.objects for update to authenticated
  using (bucket_id = 'exercise-images' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'exercise-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy exercise_images_own_delete on storage.objects for delete to authenticated
  using (bucket_id = 'exercise-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
