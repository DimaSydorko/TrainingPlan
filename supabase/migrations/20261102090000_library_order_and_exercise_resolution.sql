-- Library order (replaces the device-only sortedWorkoutUids / sortedPlanUids) and per-user exercise resolution:
-- the editor sends an exercise by key (normalized name, "time:" prefix for timed ones) and the server finds or
-- creates the user's own exercise with the same deterministic id the legacy import uses.
-- A source_workout_id that no longer exists (deleted library workout, stale client cache) is stored as null.

alter table public.workouts add column sort_order integer not null default 0;
alter table public.plans add column sort_order integer not null default 0;
create index workouts_owner_sort_idx on public.workouts (owner_id, in_library, sort_order);
create index plans_owner_sort_idx on public.plans (owner_id, sort_order);

create or replace function public.resolve_own_exercise(p_key text, p_name text, p_metric text)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if coalesce(btrim(p_key), '') = '' then
    raise exception 'exercise key required' using errcode = '22023';
  end if;

  v_id := public.legacy_uuid('exercise:' || v_uid || ':' || p_key);

  insert into public.exercises (id, owner_id, name, metric)
  values (v_id, v_uid, left(coalesce(nullif(btrim(p_name), ''), 'Exercise'), 120), coalesce(p_metric, 'reps'))
  on conflict (id) do update set metric = excluded.metric
  where public.exercises.metric = 'reps' and excluded.metric = 'weight_reps';

  return v_id;
end $$;

create or replace function public.upsert_workout_tree(p_workout jsonb, p_in_library boolean)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  v_id uuid := (p_workout ->> 'id')::uuid;
begin
  insert into public.workouts (id, owner_id, name, color_idx, labels, in_library, source_workout_id, sort_order)
  values (
    v_id,
    (select auth.uid()),
    coalesce(p_workout ->> 'name', ''),
    coalesce((p_workout ->> 'color_idx')::smallint, 0),
    coalesce(array(select jsonb_array_elements_text(p_workout -> 'labels')), '{}'),
    p_in_library,
    (select w.id from public.workouts w where w.id = (p_workout ->> 'source_workout_id')::uuid),
    (
      select coalesce(max(w.sort_order), -1) + 1 from public.workouts w
      where w.owner_id = (select auth.uid()) and w.in_library = p_in_library
    )
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
    case
      when e ? 'exercise_key' then
        public.resolve_own_exercise(e ->> 'exercise_key', e ->> 'exercise_name', e ->> 'exercise_metric')
      else (e ->> 'exercise_id')::uuid
    end,
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

create or replace function public.reorder_workouts(p_ids uuid[])
returns void language sql security invoker set search_path = '' as $$
  update public.workouts w set sort_order = t.ord - 1
  from unnest(p_ids) with ordinality as t (id, ord)
  where w.id = t.id and w.owner_id = (select auth.uid());
$$;

create or replace function public.reorder_plans(p_ids uuid[])
returns void language sql security invoker set search_path = '' as $$
  update public.plans p set sort_order = t.ord - 1
  from unnest(p_ids) with ordinality as t (id, ord)
  where p.id = t.id and p.owner_id = (select auth.uid());
$$;

-- The import runs once: a stale client cache must never overwrite data edited after the first import.
create or replace function public.import_legacy_data(p_payload jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_exercise_ids jsonb := '{}'::jsonb;
  v_exercise jsonb;
  v_exercise_id uuid;
  v_workout jsonb;
  v_workout_id uuid;
  v_plan jsonb;
  v_plan_id uuid;
  v_plan_workouts jsonb;
  v_imported_workout_ids uuid[] := '{}';
  v_session_id uuid;
  v_baseline_sets integer := 0;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if exists (select 1 from public.profiles p where p.id = v_uid and p.legacy_imported_at is not null) then
    return jsonb_build_object('exercises', 0, 'workouts', 0, 'plans', 0, 'baseline_sets', 0, 'skipped', true);
  end if;

  for v_exercise in select value from jsonb_array_elements(coalesce(p_payload -> 'exercises', '[]')) loop
    select e.id into v_exercise_id from public.exercises e
    where e.id = (v_exercise ->> 'catalog_exercise_id')::uuid and e.owner_id is null;

    if v_exercise_id is null then
      v_exercise_id := public.legacy_uuid('exercise:' || v_uid || ':' || (v_exercise ->> 'key'));
      insert into public.exercises (id, owner_id, name, metric, image_id)
      values (
        v_exercise_id,
        v_uid,
        left(coalesce(nullif(v_exercise ->> 'name', ''), 'Exercise'), 120),
        coalesce(v_exercise ->> 'metric', 'weight_reps'),
        (
          select i.id from public.exercise_images i
          where i.owner_id is null and i.file_name = v_exercise ->> 'image_file_name'
          order by i.created_at limit 1
        )
      )
      on conflict (id) do nothing;
    end if;
    v_exercise_ids := v_exercise_ids || jsonb_build_object(v_exercise ->> 'key', v_exercise_id);
  end loop;

  for v_workout in select value from jsonb_array_elements(coalesce(p_payload -> 'workouts', '[]')) loop
    v_workout_id := public.legacy_uuid('workout:' || v_uid || ':' || (v_workout ->> 'legacy_id'));
    perform public.upsert_workout_tree(
      public.legacy_workout_payload(v_workout, v_workout_id, v_exercise_ids, null), true
    );
    update public.workouts w
    set created_at = coalesce(to_timestamp((v_workout ->> 'updated_at_ms')::numeric / 1000), w.created_at)
    where w.id = v_workout_id;
    v_imported_workout_ids := v_imported_workout_ids || v_workout_id;
  end loop;

  for v_plan in select value from jsonb_array_elements(coalesce(p_payload -> 'plans', '[]')) loop
    v_plan_id := public.legacy_uuid('plan:' || v_uid || ':' || (v_plan ->> 'legacy_id'));
    select coalesce(jsonb_agg(
      public.legacy_workout_payload(
        w,
        public.legacy_uuid('plan-workout:' || v_plan_id || ':' || ord || ':' || (w ->> 'legacy_id')),
        v_exercise_ids,
        (
          select sw.id from public.workouts sw
          where sw.id = public.legacy_uuid('workout:' || v_uid || ':' || (w ->> 'source_legacy_id'))
        )
      )
      order by ord
    ), '[]'::jsonb)
    into v_plan_workouts
    from jsonb_array_elements(coalesce(v_plan -> 'workouts', '[]')) with ordinality as t (w, ord);

    perform public.save_plan(jsonb_build_object(
      'id', v_plan_id,
      'name', v_plan -> 'name',
      'color_idx', v_plan -> 'color_idx',
      'labels', coalesce(v_plan -> 'labels', '[]'::jsonb),
      'workouts', v_plan_workouts
    ));
    update public.plans p
    set created_at = coalesce(to_timestamp((v_plan ->> 'updated_at_ms')::numeric / 1000), p.created_at)
    where p.id = v_plan_id;
    v_imported_workout_ids := v_imported_workout_ids
      || array(select (w ->> 'id')::uuid from jsonb_array_elements(v_plan_workouts) w);
  end loop;

  if coalesce((p_payload ->> 'include_baseline')::boolean, false) then
    v_session_id := public.legacy_uuid('baseline:' || v_uid);
    insert into public.workout_sessions (id, user_id, workout_name, source, started_at, finished_at)
    select v_session_id, v_uid, 'Imported baseline', 'legacy_baseline', ts, ts
    from (
      select coalesce(max(to_timestamp((x ->> 'updated_at_ms')::numeric / 1000)), now()) as ts
      from (
        select value as x from jsonb_array_elements(coalesce(p_payload -> 'workouts', '[]'))
        union all
        select value from jsonb_array_elements(coalesce(p_payload -> 'plans', '[]'))
      ) items
    ) latest
    on conflict (id) do nothing;

    if found then
      insert into public.set_logs (id, session_id, user_id, exercise_id, workout_exercise_id, exercise_order, lap_no,
        planned_reps, planned_weight, reps, weight, logged_at)
      select
        public.legacy_uuid('baseline-set:' || latest.workout_exercise_id || ':' || s.lap_no),
        v_session_id, v_uid, latest.exercise_id, latest.workout_exercise_id, latest.exercise_order, s.lap_no,
        s.reps, s.weight, s.reps, s.weight, now()
      from (
        select distinct on (we.exercise_id)
          we.exercise_id, we.id as workout_exercise_id, we.sets,
          (dense_rank() over (order by we.exercise_id) - 1)::smallint as exercise_order
        from public.workout_exercises we
        join public.workouts w on w.id = we.workout_id
        join public.exercises e on e.id = we.exercise_id
        where we.workout_id = any (v_imported_workout_ids) and e.metric in ('weight_reps', 'reps')
        order by we.exercise_id, w.created_at desc, we.position
      ) latest
      cross join lateral (
        select
          ord::smallint as lap_no,
          nullif((item ->> 'reps')::numeric, 0)::smallint as reps,
          nullif((item ->> 'weight')::numeric, 0) as weight
        from jsonb_array_elements(latest.sets) with ordinality as t (item, ord)
      ) s
      where s.reps is not null;
      get diagnostics v_baseline_sets = row_count;
    end if;
  end if;

  update public.profiles set legacy_imported_at = now() where id = v_uid;

  return jsonb_build_object(
    'exercises', jsonb_array_length(coalesce(p_payload -> 'exercises', '[]')),
    'workouts', coalesce(array_length(v_imported_workout_ids, 1), 0),
    'plans', jsonb_array_length(coalesce(p_payload -> 'plans', '[]')),
    'baseline_sets', v_baseline_sets
  );
end $$;

revoke execute on function public.resolve_own_exercise(text, text, text), public.reorder_workouts(uuid[]),
  public.reorder_plans(uuid[]) from public, anon;
grant execute on function public.resolve_own_exercise(text, text, text), public.reorder_workouts(uuid[]),
  public.reorder_plans(uuid[]) to authenticated;
