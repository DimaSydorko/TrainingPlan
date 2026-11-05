-- Prescription layer: workouts, plans (copies of workouts, linked by source_workout_id), exercises inside workouts.

create table public.workouts (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name              text not null default '' check (char_length(name) <= 120),
  color_idx         smallint not null default 0,
  labels            text[] not null default '{}' check (cardinality(labels) <= 20),
  in_library        boolean not null default true,
  source_workout_id uuid references public.workouts (id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index workouts_owner_id_idx on public.workouts (owner_id);
create index workouts_source_workout_id_idx on public.workouts (source_workout_id);

create table public.plans (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name       text not null default '' check (char_length(name) <= 120),
  color_idx  smallint not null default 0,
  labels     text[] not null default '{}' check (cardinality(labels) <= 20),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index plans_owner_id_idx on public.plans (owner_id);

create table public.plan_workouts (
  plan_id    uuid not null references public.plans (id) on delete cascade,
  workout_id uuid not null references public.workouts (id) on delete cascade,
  position   smallint not null check (position >= 0),
  primary key (plan_id, workout_id)
);
create index plan_workouts_workout_id_idx on public.plan_workouts (workout_id);

create table public.workout_exercises (
  id          uuid primary key default gen_random_uuid(),
  workout_id  uuid not null references public.workouts (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  position    smallint not null check (position >= 0),
  laps        smallint not null default 1 check (laps between 1 and 50),
  rest_sec    integer not null default 0 check (rest_sec between 0 and 3600),
  is_visible  boolean not null default true,
  color_idx   smallint not null default 0,
  sets        jsonb not null default '[{}]'::jsonb
    check (jsonb_typeof(sets) = 'array' and jsonb_array_length(sets) = laps),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index workout_exercises_workout_id_idx on public.workout_exercises (workout_id, position);
create index workout_exercises_exercise_id_idx on public.workout_exercises (exercise_id);

create trigger workouts_updated_at before update on public.workouts
  for each row execute function public.set_updated_at();
create trigger plans_updated_at before update on public.plans
  for each row execute function public.set_updated_at();
create trigger workout_exercises_updated_at before update on public.workout_exercises
  for each row execute function public.set_updated_at();

alter table public.workouts enable row level security;
create policy workouts_select_own on public.workouts for select to authenticated
  using (owner_id = (select auth.uid()));
create policy workouts_insert_own on public.workouts for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy workouts_update_own on public.workouts for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy workouts_delete_own on public.workouts for delete to authenticated
  using (owner_id = (select auth.uid()));

alter table public.plans enable row level security;
create policy plans_select_own on public.plans for select to authenticated
  using (owner_id = (select auth.uid()));
create policy plans_insert_own on public.plans for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy plans_update_own on public.plans for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy plans_delete_own on public.plans for delete to authenticated
  using (owner_id = (select auth.uid()));

create or replace function public.is_own_workout(p_workout_id uuid)
returns boolean language sql stable set search_path = '' as $$
  select exists (select 1 from public.workouts w where w.id = p_workout_id and w.owner_id = (select auth.uid()))
$$;

create or replace function public.is_visible_exercise(p_exercise_id uuid)
returns boolean language sql stable set search_path = '' as $$
  select exists (
    select 1 from public.exercises e
    where e.id = p_exercise_id and (e.owner_id is null or e.owner_id = (select auth.uid()))
  )
$$;

alter table public.plan_workouts enable row level security;
create policy plan_workouts_select_own on public.plan_workouts for select to authenticated
  using (exists (select 1 from public.plans p where p.id = plan_id and p.owner_id = (select auth.uid())));
create policy plan_workouts_insert_own on public.plan_workouts for insert to authenticated
  with check (
    exists (select 1 from public.plans p where p.id = plan_id and p.owner_id = (select auth.uid()))
    and public.is_own_workout(workout_id)
  );
create policy plan_workouts_update_own on public.plan_workouts for update to authenticated
  using (exists (select 1 from public.plans p where p.id = plan_id and p.owner_id = (select auth.uid())))
  with check (
    exists (select 1 from public.plans p where p.id = plan_id and p.owner_id = (select auth.uid()))
    and public.is_own_workout(workout_id)
  );
create policy plan_workouts_delete_own on public.plan_workouts for delete to authenticated
  using (exists (select 1 from public.plans p where p.id = plan_id and p.owner_id = (select auth.uid())));

alter table public.workout_exercises enable row level security;
create policy workout_exercises_select_own on public.workout_exercises for select to authenticated
  using (public.is_own_workout(workout_id));
create policy workout_exercises_insert_own on public.workout_exercises for insert to authenticated
  with check (public.is_own_workout(workout_id) and public.is_visible_exercise(exercise_id));
create policy workout_exercises_update_own on public.workout_exercises for update to authenticated
  using (public.is_own_workout(workout_id))
  with check (public.is_own_workout(workout_id) and public.is_visible_exercise(exercise_id));
create policy workout_exercises_delete_own on public.workout_exercises for delete to authenticated
  using (public.is_own_workout(workout_id));

-- Atomic save of a workout with its exercises. Payload:
-- { id, name, color_idx, labels, in_library, source_workout_id,
--   exercises: [{ id, exercise_id, laps, rest_sec, is_visible, color_idx, sets }] } (array order = position)
create or replace function public.upsert_workout_tree(p_workout jsonb, p_in_library boolean)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  v_id uuid := (p_workout ->> 'id')::uuid;
begin
  insert into public.workouts (id, owner_id, name, color_idx, labels, in_library, source_workout_id)
  values (
    v_id,
    (select auth.uid()),
    coalesce(p_workout ->> 'name', ''),
    coalesce((p_workout ->> 'color_idx')::smallint, 0),
    coalesce(array(select jsonb_array_elements_text(p_workout -> 'labels')), '{}'),
    p_in_library,
    (p_workout ->> 'source_workout_id')::uuid
  )
  on conflict (id) do update set
    name = excluded.name,
    color_idx = excluded.color_idx,
    labels = excluded.labels,
    in_library = excluded.in_library,
    source_workout_id = excluded.source_workout_id;

  delete from public.workout_exercises we
  where we.workout_id = v_id
    and we.id not in (
      select (e ->> 'id')::uuid from jsonb_array_elements(coalesce(p_workout -> 'exercises', '[]')) e
    );

  insert into public.workout_exercises (id, workout_id, exercise_id, position, laps, rest_sec, is_visible, color_idx, sets)
  select
    (e ->> 'id')::uuid,
    v_id,
    (e ->> 'exercise_id')::uuid,
    (ord - 1)::smallint,
    coalesce((e ->> 'laps')::smallint, 1),
    coalesce((e ->> 'rest_sec')::integer, 0),
    coalesce((e ->> 'is_visible')::boolean, true),
    coalesce((e ->> 'color_idx')::smallint, 0),
    coalesce(e -> 'sets', '[{}]'::jsonb)
  from jsonb_array_elements(coalesce(p_workout -> 'exercises', '[]')) with ordinality as t (e, ord)
  on conflict (id) do update set
    exercise_id = excluded.exercise_id,
    position = excluded.position,
    laps = excluded.laps,
    rest_sec = excluded.rest_sec,
    is_visible = excluded.is_visible,
    color_idx = excluded.color_idx,
    sets = excluded.sets
  where public.workout_exercises.workout_id = v_id;

  return v_id;
end $$;
revoke execute on function public.upsert_workout_tree(jsonb, boolean) from public, anon;
grant execute on function public.upsert_workout_tree(jsonb, boolean) to authenticated;

create or replace function public.save_workout(p_workout jsonb)
returns uuid language plpgsql security invoker set search_path = '' as $$
begin
  return public.upsert_workout_tree(p_workout, coalesce((p_workout ->> 'in_library')::boolean, true));
end $$;

-- Payload: { id, name, color_idx, labels, workouts: [<workout payload>] } (array order = position).
-- Plan workouts are copies (in_library = false); copies dropped from the plan and used nowhere else are deleted.
create or replace function public.save_plan(p_plan jsonb)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  v_id uuid := (p_plan ->> 'id')::uuid;
  v_workout jsonb;
  v_position integer := 0;
  v_old_workout_ids uuid[];
  v_workout_id uuid;
begin
  insert into public.plans (id, owner_id, name, color_idx, labels)
  values (
    v_id,
    (select auth.uid()),
    coalesce(p_plan ->> 'name', ''),
    coalesce((p_plan ->> 'color_idx')::smallint, 0),
    coalesce(array(select jsonb_array_elements_text(p_plan -> 'labels')), '{}')
  )
  on conflict (id) do update set
    name = excluded.name,
    color_idx = excluded.color_idx,
    labels = excluded.labels;

  select coalesce(array_agg(pw.workout_id), '{}') into v_old_workout_ids
  from public.plan_workouts pw where pw.plan_id = v_id;

  delete from public.plan_workouts pw where pw.plan_id = v_id;

  for v_workout in select value from jsonb_array_elements(coalesce(p_plan -> 'workouts', '[]')) loop
    v_workout_id := public.upsert_workout_tree(v_workout, false);
    insert into public.plan_workouts (plan_id, workout_id, position) values (v_id, v_workout_id, v_position);
    v_position := v_position + 1;
  end loop;

  delete from public.workouts w
  where w.id = any (v_old_workout_ids)
    and not w.in_library
    and not exists (select 1 from public.plan_workouts pw where pw.workout_id = w.id);

  return v_id;
end $$;

create or replace function public.delete_plan(p_plan_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
declare
  v_workout_ids uuid[];
begin
  select coalesce(array_agg(pw.workout_id), '{}') into v_workout_ids
  from public.plan_workouts pw where pw.plan_id = p_plan_id;

  delete from public.plans p where p.id = p_plan_id;

  delete from public.workouts w
  where w.id = any (v_workout_ids)
    and not w.in_library
    and not exists (select 1 from public.plan_workouts pw where pw.workout_id = w.id);
end $$;

revoke execute on function public.save_workout(jsonb), public.save_plan(jsonb), public.delete_plan(uuid)
  from public, anon;
grant execute on function public.save_workout(jsonb), public.save_plan(jsonb), public.delete_plan(uuid)
  to authenticated;

revoke execute on function public.is_own_workout(uuid), public.is_visible_exercise(uuid) from public, anon;
grant execute on function public.is_own_workout(uuid), public.is_visible_exercise(uuid) to authenticated;
