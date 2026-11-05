-- Logs (source of truth) + trigger-maintained per-session stats and personal records.

create table public.workout_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  workout_id    uuid references public.workouts (id) on delete set null,
  plan_id       uuid references public.plans (id) on delete set null,
  workout_name  text not null default '' check (char_length(workout_name) <= 120),
  source        text not null default 'played' check (source in ('played', 'ai', 'legacy_baseline')),
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  effort_rating smallint check (effort_rating between 1 and 5),
  created_at    timestamptz not null default now(),
  check (finished_at is null or finished_at >= started_at)
);
create index workout_sessions_user_started_idx on public.workout_sessions (user_id, started_at desc);
create index workout_sessions_workout_id_idx on public.workout_sessions (workout_id);
create index workout_sessions_plan_id_idx on public.workout_sessions (plan_id);

create table public.set_logs (
  id                   uuid primary key default gen_random_uuid(),
  session_id           uuid not null references public.workout_sessions (id) on delete cascade,
  user_id              uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  exercise_id          uuid not null references public.exercises (id) on delete restrict,
  workout_exercise_id  uuid references public.workout_exercises (id) on delete set null,
  exercise_order       smallint not null default 0 check (exercise_order >= 0),
  lap_no               smallint not null check (lap_no >= 1),
  planned_reps         smallint check (planned_reps >= 0),
  planned_weight       numeric(6, 2) check (planned_weight >= 0),
  planned_duration_sec integer check (planned_duration_sec >= 0),
  planned_rest_sec     integer check (planned_rest_sec >= 0),
  reps                 smallint check (reps between 0 and 1000),
  weight               numeric(6, 2) check (weight between 0 and 1000),
  duration_sec         integer check (duration_sec between 0 and 86400),
  rest_sec             integer check (rest_sec between 0 and 86400),
  is_skipped           boolean not null default false,
  logged_at            timestamptz not null default now()
);
create index set_logs_session_id_idx on public.set_logs (session_id);
create index set_logs_user_exercise_idx on public.set_logs (user_id, exercise_id, logged_at);
create index set_logs_exercise_id_idx on public.set_logs (exercise_id);
create index set_logs_workout_exercise_id_idx on public.set_logs (workout_exercise_id);

create table public.exercise_session_stats (
  session_id       uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_id      uuid not null references public.exercises (id) on delete cascade,
  user_id          uuid not null references public.profiles (id) on delete cascade,
  performed_at     timestamptz not null,
  top_weight       numeric(6, 2),
  top_reps         smallint,
  best_e1rm        numeric(7, 2),
  max_reps         smallint,
  max_hold_sec     integer,
  volume           numeric(10, 2) not null default 0,
  hard_sets        smallint not null default 0,
  total_sets       smallint not null default 0,
  skipped_sets     smallint not null default 0,
  completion_ratio numeric(4, 3),
  primary key (session_id, exercise_id)
);
create index exercise_session_stats_user_exercise_idx
  on public.exercise_session_stats (user_id, exercise_id, performed_at desc);
create index exercise_session_stats_exercise_id_idx on public.exercise_session_stats (exercise_id);

create table public.personal_records (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  kind        text not null check (kind in ('e1rm', 'weight', 'reps', 'hold', 'volume')),
  value       numeric(10, 2) not null,
  session_id  uuid not null references public.workout_sessions (id) on delete cascade,
  achieved_at timestamptz not null,
  primary key (user_id, exercise_id, kind)
);
create index personal_records_exercise_id_idx on public.personal_records (exercise_id);
create index personal_records_session_id_idx on public.personal_records (session_id);

alter table public.workout_sessions enable row level security;
create policy workout_sessions_select_own on public.workout_sessions for select to authenticated
  using (user_id = (select auth.uid()));
create policy workout_sessions_insert_own on public.workout_sessions for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy workout_sessions_update_own on public.workout_sessions for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy workout_sessions_delete_own on public.workout_sessions for delete to authenticated
  using (user_id = (select auth.uid()));
revoke update on public.workout_sessions from anon, authenticated;
grant update (effort_rating, finished_at) on public.workout_sessions to authenticated;

alter table public.set_logs enable row level security;
create policy set_logs_select_own on public.set_logs for select to authenticated
  using (user_id = (select auth.uid()));
create policy set_logs_insert_own on public.set_logs for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.workout_sessions ws where ws.id = session_id and ws.user_id = (select auth.uid()))
    and public.is_visible_exercise(exercise_id)
  );
revoke update, delete, truncate on public.set_logs from anon, authenticated;

alter table public.exercise_session_stats enable row level security;
create policy exercise_session_stats_select_own on public.exercise_session_stats for select to authenticated
  using (user_id = (select auth.uid()));
revoke insert, update, delete, truncate on public.exercise_session_stats from anon, authenticated;

alter table public.personal_records enable row level security;
create policy personal_records_select_own on public.personal_records for select to authenticated
  using (user_id = (select auth.uid()));
revoke insert, update, delete, truncate on public.personal_records from anon, authenticated;

create or replace function public.estimate_e1rm(p_weight numeric, p_reps integer)
returns numeric language sql immutable set search_path = '' as $$
  select case
    when p_weight > 0 and p_reps > 0 then round(p_weight * (1 + least(p_reps, 12) / 30.0), 2)
  end
$$;

create or replace function public.refresh_personal_records(p_user_id uuid, p_exercise_ids uuid[])
returns void language plpgsql security definer set search_path = '' as $$
begin
  delete from public.personal_records pr
  where pr.user_id = p_user_id and pr.exercise_id = any (p_exercise_ids);

  insert into public.personal_records (user_id, exercise_id, kind, value, session_id, achieved_at)
  select distinct on (st.exercise_id, k.kind)
    st.user_id, st.exercise_id, k.kind, k.value, st.session_id, st.performed_at
  from public.exercise_session_stats st
  join public.workout_sessions ws on ws.id = st.session_id and ws.source <> 'legacy_baseline'
  cross join lateral (values
    ('e1rm', st.best_e1rm),
    ('weight', st.top_weight),
    ('reps', st.max_reps::numeric),
    ('hold', st.max_hold_sec::numeric),
    ('volume', st.volume)
  ) as k (kind, value)
  where st.user_id = p_user_id and st.exercise_id = any (p_exercise_ids) and k.value > 0
  order by st.exercise_id, k.kind, k.value desc, st.performed_at asc;
end $$;
revoke execute on function public.refresh_personal_records(uuid, uuid[]) from public, anon, authenticated;

create or replace function public.set_logs_refresh_stats()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_user record;
begin
  insert into public.exercise_session_stats (
    session_id, exercise_id, user_id, performed_at, top_weight, top_reps, best_e1rm, max_reps, max_hold_sec,
    volume, hard_sets, total_sets, skipped_sets, completion_ratio
  )
  select
    sl.session_id,
    sl.exercise_id,
    sl.user_id,
    ws.started_at,
    max(sl.weight) filter (where not sl.is_skipped and sl.weight > 0),
    null,
    max(public.estimate_e1rm(sl.weight, sl.reps)) filter (where not sl.is_skipped and e.metric = 'weight_reps'),
    max(sl.reps) filter (where not sl.is_skipped),
    max(sl.duration_sec) filter (where not sl.is_skipped),
    coalesce(sum(sl.weight * sl.reps) filter (where not sl.is_skipped), 0),
    count(*) filter (where not sl.is_skipped and (sl.reps > 0 or sl.duration_sec > 0)),
    count(*),
    count(*) filter (where sl.is_skipped),
    round(avg(case
      when sl.is_skipped then 0
      when sl.planned_reps > 0 then least(coalesce(sl.reps, 0)::numeric / sl.planned_reps, 1)
      when sl.planned_duration_sec > 0 then least(coalesce(sl.duration_sec, 0)::numeric / sl.planned_duration_sec, 1)
    end), 3)
  from public.set_logs sl
  join public.workout_sessions ws on ws.id = sl.session_id
  join public.exercises e on e.id = sl.exercise_id
  where (sl.session_id, sl.exercise_id) in (select distinct n.session_id, n.exercise_id from new_rows n)
  group by sl.session_id, sl.exercise_id, sl.user_id, ws.started_at
  on conflict (session_id, exercise_id) do update set
    performed_at = excluded.performed_at,
    top_weight = excluded.top_weight,
    best_e1rm = excluded.best_e1rm,
    max_reps = excluded.max_reps,
    max_hold_sec = excluded.max_hold_sec,
    volume = excluded.volume,
    hard_sets = excluded.hard_sets,
    total_sets = excluded.total_sets,
    skipped_sets = excluded.skipped_sets,
    completion_ratio = excluded.completion_ratio;

  update public.exercise_session_stats st
  set top_reps = (
    select max(sl.reps) from public.set_logs sl
    where sl.session_id = st.session_id and sl.exercise_id = st.exercise_id
      and not sl.is_skipped and sl.weight = st.top_weight
  )
  where (st.session_id, st.exercise_id) in (select distinct n.session_id, n.exercise_id from new_rows n)
    and st.top_weight is not null;

  for v_user in select n.user_id, array_agg(distinct n.exercise_id) as exercise_ids from new_rows n group by n.user_id loop
    perform public.refresh_personal_records(v_user.user_id, v_user.exercise_ids);
  end loop;
  return null;
end $$;
revoke execute on function public.set_logs_refresh_stats() from public, anon, authenticated;

create trigger set_logs_after_insert after insert on public.set_logs
  referencing new table as new_rows
  for each statement execute function public.set_logs_refresh_stats();

create or replace function public.workout_sessions_refresh_records()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid;
begin
  for v_user_id in select distinct o.user_id from old_rows o loop
    perform public.refresh_personal_records(
      v_user_id,
      array(select distinct st.exercise_id from public.exercise_session_stats st where st.user_id = v_user_id)
    );
  end loop;
  return null;
end $$;
revoke execute on function public.workout_sessions_refresh_records() from public, anon, authenticated;

create trigger workout_sessions_after_delete after delete on public.workout_sessions
  referencing old table as old_rows
  for each statement execute function public.workout_sessions_refresh_records();

-- Batch insert on session finish (offline queue). Idempotent on session id.
-- p_session: { id, workout_id, plan_id, workout_name, source, started_at, finished_at, effort_rating }
-- p_sets: [{ id?, exercise_id, workout_exercise_id, exercise_order, lap_no, planned_reps, planned_weight,
--            planned_duration_sec, planned_rest_sec, reps, weight, duration_sec, rest_sec, is_skipped, logged_at }]
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
    (p_session ->> 'workout_id')::uuid,
    (p_session ->> 'plan_id')::uuid,
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
      coalesce(s.id, gen_random_uuid()), v_id, (select auth.uid()), s.exercise_id, s.workout_exercise_id,
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
revoke execute on function public.finish_session(jsonb, jsonb) from public, anon;
grant execute on function public.finish_session(jsonb, jsonb) to authenticated;

revoke execute on function public.estimate_e1rm(numeric, integer) from public, anon;
grant execute on function public.estimate_e1rm(numeric, integer) to authenticated;
