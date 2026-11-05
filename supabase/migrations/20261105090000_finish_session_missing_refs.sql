-- Playback finishes are queued offline and can reach the server after the workout or plan was deleted.
-- A missing workout_id / plan_id / workout_exercise_id is stored as null instead of failing the whole session.

create or replace function public.finish_session(p_session jsonb, p_sets jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_id uuid := (p_session ->> 'id')::uuid;
  v_inserted boolean;
begin
  insert into public.workout_sessions (
    id, user_id, workout_id, plan_id, workout_name, source, started_at, finished_at, effort_rating
  )
  values (
    v_id,
    (select auth.uid()),
    (select w.id from public.workouts w where w.id = (p_session ->> 'workout_id')::uuid),
    (select p.id from public.plans p where p.id = (p_session ->> 'plan_id')::uuid),
    coalesce(p_session ->> 'workout_name', ''),
    coalesce(p_session ->> 'source', 'played'),
    coalesce((p_session ->> 'started_at')::timestamptz, now()),
    coalesce((p_session ->> 'finished_at')::timestamptz, now()),
    (p_session ->> 'effort_rating')::smallint
  )
  on conflict (id) do nothing;
  v_inserted := found;

  if v_inserted then
    insert into public.set_logs (
      id, session_id, user_id, exercise_id, workout_exercise_id, exercise_order, lap_no, planned_reps,
      planned_weight, planned_duration_sec, planned_rest_sec, reps, weight, duration_sec, rest_sec, is_skipped,
      logged_at
    )
    select
      coalesce(s.id, gen_random_uuid()), v_id, (select auth.uid()), s.exercise_id,
      (select we.id from public.workout_exercises we where we.id = s.workout_exercise_id),
      coalesce(s.exercise_order, 0), s.lap_no, s.planned_reps, s.planned_weight, s.planned_duration_sec,
      s.planned_rest_sec, s.reps, s.weight, s.duration_sec, s.rest_sec, coalesce(s.is_skipped, false),
      coalesce(s.logged_at, now())
    from jsonb_to_recordset(coalesce(p_sets, '[]')) as s (
      id uuid, exercise_id uuid, workout_exercise_id uuid, exercise_order smallint, lap_no smallint,
      planned_reps smallint, planned_weight numeric, planned_duration_sec integer, planned_rest_sec integer,
      reps smallint, weight numeric, duration_sec integer, rest_sec integer, is_skipped boolean, logged_at timestamptz
    );
  end if;

  return jsonb_build_object(
    'session_id', v_id,
    'inserted', v_inserted,
    'records', coalesce((
      select jsonb_agg(jsonb_build_object('exercise_id', pr.exercise_id, 'kind', pr.kind, 'value', pr.value))
      from public.personal_records pr
      where pr.session_id = v_id and pr.user_id = (select auth.uid())
    ), '[]'::jsonb)
  );
end $$;
