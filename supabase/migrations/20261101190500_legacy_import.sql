-- One-time import of Firebase data, sent by the app after Supabase login. Deterministic uuid v5 ids keep it
-- idempotent: re-running updates the same rows. Payload is built by app/api/legacy-import/legacy-to-payload.ts:
-- { exercises: [{ key, name, metric, image_file_name, catalog_exercise_id }],
--   workouts: [{ legacy_id, name, color_idx, labels, updated_at_ms,
--                exercises: [{ exercise_key, laps, rest_sec, is_visible, color_idx, sets }] }],
--   plans: [{ legacy_id, name, color_idx, labels, updated_at_ms, workouts: [<workout> + source_legacy_id] }],
--   include_baseline: boolean }

create or replace function public.legacy_uuid(p_name text)
returns uuid language sql immutable set search_path = '' as $$
  select extensions.uuid_generate_v5('6f1d3c3e-6a51-4c55-9a3e-2b8f0e7c9d14'::uuid, p_name)
$$;

create or replace function public.legacy_workout_payload(
  p_workout jsonb, p_id uuid, p_exercise_ids jsonb, p_source_workout_id uuid
)
returns jsonb language sql immutable set search_path = '' as $$
  select jsonb_build_object(
    'id', p_id,
    'name', coalesce(p_workout ->> 'name', ''),
    'color_idx', coalesce((p_workout ->> 'color_idx')::smallint, 0),
    'labels', coalesce(p_workout -> 'labels', '[]'::jsonb),
    'source_workout_id', p_source_workout_id,
    'exercises', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', public.legacy_uuid('workout-exercise:' || p_id || ':' || ord),
          'exercise_id', p_exercise_ids ->> (e ->> 'exercise_key'),
          'laps', e -> 'laps',
          'rest_sec', e -> 'rest_sec',
          'is_visible', e -> 'is_visible',
          'color_idx', e -> 'color_idx',
          'sets', e -> 'sets'
        )
        order by ord
      )
      from jsonb_array_elements(coalesce(p_workout -> 'exercises', '[]')) with ordinality as t (e, ord)
    ), '[]'::jsonb)
  )
$$;

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

revoke execute on function public.legacy_workout_payload(jsonb, uuid, jsonb, uuid) from public, anon;
grant execute on function public.legacy_workout_payload(jsonb, uuid, jsonb, uuid) to authenticated;
revoke execute on function public.import_legacy_data(jsonb) from public, anon;
grant execute on function public.import_legacy_data(jsonb) to authenticated;
revoke execute on function public.legacy_uuid(text) from public, anon;
grant execute on function public.legacy_uuid(text) to authenticated;
