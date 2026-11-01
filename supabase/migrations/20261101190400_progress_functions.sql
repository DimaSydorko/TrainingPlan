-- Read-side analytics (security invoker, own data only) and the weekly level job (definer, not client-callable).
-- Tuning constants live in the function bodies; see .claude/context/exercise-progression-design.md.

create or replace function public.level_rank(p_level text)
returns integer language sql immutable set search_path = '' as $$
  select array_position(array['beginner', 'novice', 'intermediate', 'advanced'], p_level) - 1
$$;

create or replace function public.level_from_rank(p_rank numeric)
returns text language sql immutable set search_path = '' as $$
  select case when p_rank is not null
    then (array['beginner', 'novice', 'intermediate', 'advanced'])[least(greatest(round(p_rank)::integer, 0), 3) + 1]
  end
$$;

create or replace function public.period_days_for_level(p_level text)
returns integer language sql immutable set search_path = '' as $$
  select case p_level when 'intermediate' then 28 when 'advanced' then 42 else 14 end
$$;

-- Per muscle: residual fatigue (decays over recovery_hours), weekly hard sets, last trained, trend.
create or replace function public.get_muscle_fatigue(p_at timestamptz default now())
returns table (
  muscle_id text,
  group_id text,
  recovery_pct integer,
  sets_7d numeric,
  sets_prev_7d numeric,
  last_trained_at timestamptz,
  trend text
)
language sql stable security invoker set search_path = '' as $$
  with me as (
    select (select auth.uid()) as uid
  ),
  best as (
    select st.exercise_id, max(st.best_e1rm) as max_e1rm
    from public.exercise_session_stats st, me
    where st.user_id = me.uid and st.performed_at > p_at - interval '90 days'
    group by st.exercise_id
  ),
  loads as (
    select
      em.muscle_id,
      st.performed_at,
      st.hard_sets * em.weight as weighted_sets,
      st.hard_sets * em.weight
        * coalesce(st.best_e1rm / nullif(best.max_e1rm, 0), 0.75)
        * coalesce(0.7 + 0.1 * ws.effort_rating, 1)
        * (1.5 - 0.5 * coalesce(st.completion_ratio, 1)) as load
    from public.exercise_session_stats st
    cross join me
    join public.workout_sessions ws on ws.id = st.session_id
    join public.exercise_muscles em on em.exercise_id = st.exercise_id
    left join best on best.exercise_id = st.exercise_id
    where st.user_id = me.uid
      and st.performed_at > p_at - interval '90 days'
      and st.performed_at <= p_at
      and ws.source <> 'legacy_baseline'
  ),
  per_muscle as (
    select
      l.muscle_id,
      sum(l.load * exp(-3 * extract(epoch from p_at - l.performed_at) / 3600 / m.recovery_hours)) as residual,
      sum(l.weighted_sets) filter (where l.performed_at > p_at - interval '7 days') as sets_7d,
      sum(l.weighted_sets) filter (
        where l.performed_at <= p_at - interval '7 days' and l.performed_at > p_at - interval '14 days'
      ) as sets_prev_7d,
      max(l.performed_at) as last_trained_at
    from loads l
    join public.muscles m on m.id = l.muscle_id
    group by l.muscle_id
  )
  select
    m.id,
    m.group_id,
    round(100 * greatest(0, 1 - coalesce(pm.residual, 0) / 10))::integer,
    round(coalesce(pm.sets_7d, 0), 1),
    round(coalesce(pm.sets_prev_7d, 0), 1),
    pm.last_trained_at,
    case
      when coalesce(pm.sets_7d, 0) > coalesce(pm.sets_prev_7d, 0) * 1.15 + 0.5 then 'up'
      when coalesce(pm.sets_7d, 0) < coalesce(pm.sets_prev_7d, 0) * 0.85 - 0.5 then 'down'
      else 'stable'
    end
  from public.muscles m
  left join per_muscle pm on pm.muscle_id = m.id
  order by m.sort
$$;

create or replace function public.exercise_progress_for_period(p_period_days integer, p_at timestamptz)
returns table (
  exercise_id uuid,
  metric text,
  current_best numeric,
  previous_best numeric,
  current_sessions integer,
  previous_sessions integer,
  change_pct numeric,
  status text
)
language sql stable security invoker set search_path = '' as $$
  with values_by_session as (
    select
      st.exercise_id,
      e.metric,
      st.performed_at,
      case e.metric
        when 'weight_reps' then st.best_e1rm
        when 'reps' then st.max_reps::numeric
        else st.max_hold_sec::numeric
      end as value
    from public.exercise_session_stats st
    join public.exercises e on e.id = st.exercise_id
    where st.user_id = (select auth.uid())
      and st.performed_at > p_at - make_interval(days => 2 * p_period_days)
      and st.performed_at <= p_at
  ),
  periods as (
    select
      v.exercise_id,
      v.metric,
      max(v.value) filter (where v.performed_at > p_at - make_interval(days => p_period_days)) as current_best,
      max(v.value) filter (where v.performed_at <= p_at - make_interval(days => p_period_days)) as previous_best,
      count(*) filter (where v.performed_at > p_at - make_interval(days => p_period_days))::integer as current_sessions,
      count(*) filter (where v.performed_at <= p_at - make_interval(days => p_period_days))::integer as previous_sessions
    from values_by_session v
    where v.value is not null
    group by v.exercise_id, v.metric
  )
  select
    p.exercise_id,
    p.metric,
    p.current_best,
    p.previous_best,
    p.current_sessions,
    p.previous_sessions,
    round(100 * (p.current_best - p.previous_best) / nullif(p.previous_best, 0), 1),
    case
      when p.current_sessions = 0 then 'not_trained'
      when p.current_sessions < 2 or p.previous_sessions < 2 then 'insufficient'
      when p.current_best > p.previous_best * 1.03 then 'up'
      when p.current_best < p.previous_best * 0.97 then 'down'
      else 'stable'
    end
  from periods p
$$;

-- Best of current period vs previous period per exercise; sparse exercises fall back to a doubled period.
create or replace function public.get_exercise_progress(p_period_days integer default null, p_at timestamptz default now())
returns table (
  exercise_id uuid,
  metric text,
  period_days integer,
  current_best numeric,
  previous_best numeric,
  current_sessions integer,
  previous_sessions integer,
  change_pct numeric,
  status text
)
language sql stable security invoker set search_path = '' as $$
  with period as (
    select coalesce(
      p_period_days,
      public.period_days_for_level((select pr.overall_level from public.profiles pr where pr.id = (select auth.uid())))
    ) as days
  ),
  base as (
    select b.*, period.days from period, public.exercise_progress_for_period(period.days, p_at) b
  ),
  extended as (
    select x.*, period.days * 2 as days from period, public.exercise_progress_for_period(period.days * 2, p_at) x
  )
  select
    b.exercise_id,
    b.metric,
    case when b.status = 'insufficient' and x.status not in ('insufficient', 'not_trained') then x.days else b.days end,
    case when b.status = 'insufficient' and x.status not in ('insufficient', 'not_trained') then x.current_best else b.current_best end,
    case when b.status = 'insufficient' and x.status not in ('insufficient', 'not_trained') then x.previous_best else b.previous_best end,
    case when b.status = 'insufficient' and x.status not in ('insufficient', 'not_trained') then x.current_sessions else b.current_sessions end,
    case when b.status = 'insufficient' and x.status not in ('insufficient', 'not_trained') then x.previous_sessions else b.previous_sessions end,
    case when b.status = 'insufficient' and x.status not in ('insufficient', 'not_trained') then x.change_pct else b.change_pct end,
    case when b.status = 'insufficient' and x.status not in ('insufficient', 'not_trained') then x.status else b.status end
  from base b
  left join extended x on x.exercise_id = b.exercise_id
$$;

-- Per-muscle trend: exercise changes combined by muscle weight; declines while fatigued are flagged.
create or replace function public.get_muscle_progress(p_period_days integer default null, p_at timestamptz default now())
returns table (
  muscle_id text,
  group_id text,
  change_pct numeric,
  exercises_count integer,
  status text,
  is_probably_fatigue boolean
)
language sql stable security invoker set search_path = '' as $$
  with progress as (
    select * from public.get_exercise_progress(p_period_days, p_at) where status in ('up', 'down', 'stable')
  ),
  per_muscle as (
    select
      em.muscle_id,
      round(sum(p.change_pct * em.weight) / nullif(sum(em.weight), 0), 1) as change_pct,
      count(*)::integer as exercises_count
    from progress p
    join public.exercise_muscles em on em.exercise_id = p.exercise_id
    group by em.muscle_id
  ),
  fatigue as (
    select f.muscle_id, f.recovery_pct from public.get_muscle_fatigue(p_at) f
  )
  select
    m.id,
    m.group_id,
    pm.change_pct,
    coalesce(pm.exercises_count, 0),
    case
      when pm.muscle_id is null then 'insufficient'
      when pm.change_pct > 3 then 'up'
      when pm.change_pct < -3 then 'down'
      else 'stable'
    end,
    coalesce(pm.change_pct < -3 and f.recovery_pct < 60, false)
  from public.muscles m
  left join per_muscle pm on pm.muscle_id = m.id
  left join fatigue f on f.muscle_id = m.id
  order by m.sort
$$;

-- Starting e1RM for a never-done weighted exercise, with a safety discount. Weight rounding stays in the app
-- (weight step is a device setting). Sources: pattern → muscles → standards → default (e1rm null).
create or replace function public.estimate_start_weight(p_exercise_id uuid)
returns table (e1rm numeric, source text, discount numeric, working_e1rm numeric)
language plpgsql stable security invoker set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_target public.exercises;
  v_profile public.profiles;
  v_body_weight numeric;
  v_level text;
  v_e1rm numeric;
  v_source text;
  v_discount numeric;
begin
  select * into v_target from public.exercises e where e.id = p_exercise_id;
  if not found or v_target.metric <> 'weight_reps' then
    return;
  end if;

  select * into v_profile from public.profiles pr where pr.id = v_uid;
  select bw.weight_kg into v_body_weight from public.body_weights bw
  where bw.user_id = v_uid order by bw.measured_on desc limit 1;

  if v_target.pattern_id is not null then
    select st.best_e1rm / coalesce(x.pattern_load_ratio, 1) * coalesce(v_target.pattern_load_ratio, 1)
    into v_e1rm
    from public.exercise_session_stats st
    join public.exercises x on x.id = st.exercise_id
    where st.user_id = v_uid
      and x.pattern_id = v_target.pattern_id
      and x.id <> v_target.id
      and st.best_e1rm is not null
      and st.performed_at > now() - interval '180 days'
    order by st.performed_at desc, st.best_e1rm desc
    limit 1;
    if v_e1rm is not null then
      v_source := 'pattern';
    end if;
  end if;

  if v_e1rm is null then
    select public.level_from_rank(sum(public.level_rank(uel.level) * em.weight * tm.weight) / sum(em.weight * tm.weight))
    into v_level
    from public.exercise_muscles tm
    join public.exercise_muscles em on em.muscle_id = tm.muscle_id and em.exercise_id <> tm.exercise_id
    join public.user_exercise_levels uel on uel.exercise_id = em.exercise_id and uel.user_id = v_uid
    where tm.exercise_id = v_target.id and tm.weight >= 0.5 and uel.source = 'standards';

    if v_level is not null then
      v_source := 'muscles';
    else
      v_level := coalesce(v_profile.overall_level, public.level_from_experience(v_profile.training_experience));
      v_source := 'standards';
    end if;

    select ss.value * v_body_weight into v_e1rm
    from public.strength_standards ss
    where ss.exercise_id = v_target.id and ss.sex = v_profile.sex and ss.level = v_level and ss.metric = 'bw_ratio';
  end if;

  if v_e1rm is null then
    v_source := 'default';
    v_discount := 0.35;
  else
    v_discount := case v_source when 'pattern' then 0.10 when 'muscles' then 0.20 else 0.25 end;
  end if;

  v_discount := least(
    v_discount
      + 0.05 * greatest(coalesce(v_target.complexity, 3) - 2, 0)
      + case when coalesce(v_profile.overall_level, 'beginner') in ('beginner', 'novice') then 0.05 else 0 end,
    0.5
  );

  return query select round(v_e1rm, 2), v_source, v_discount, round(v_e1rm * (1 - v_discount), 2);
end $$;

revoke execute on function
  public.get_muscle_fatigue(timestamptz),
  public.exercise_progress_for_period(integer, timestamptz),
  public.get_exercise_progress(integer, timestamptz),
  public.get_muscle_progress(integer, timestamptz),
  public.estimate_start_weight(uuid)
  from public, anon;
grant execute on function
  public.get_muscle_fatigue(timestamptz),
  public.exercise_progress_for_period(integer, timestamptz),
  public.get_exercise_progress(integer, timestamptz),
  public.get_muscle_progress(integer, timestamptz),
  public.estimate_start_weight(uuid)
  to authenticated;

-- Weekly: per-exercise levels (standards → muscles → overall → onboarding) and overall level.
create or replace function public.recalc_levels(p_user_id uuid default null)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_user record;
  v_body_weight numeric;
  v_overall numeric;
begin
  for v_user in
    select pr.id, pr.sex, pr.overall_level, pr.training_experience
    from public.profiles pr
    where p_user_id is null or pr.id = p_user_id
  loop
    select bw.weight_kg into v_body_weight from public.body_weights bw
    where bw.user_id = v_user.id order by bw.measured_on desc limit 1;

    create temporary table if not exists pg_temp.user_exercises (exercise_id uuid primary key) on commit drop;
    truncate pg_temp.user_exercises;
    insert into pg_temp.user_exercises
    select st.exercise_id from public.exercise_session_stats st where st.user_id = v_user.id
    union
    select we.exercise_id from public.workout_exercises we
    join public.workouts w on w.id = we.workout_id where w.owner_id = v_user.id;

    create temporary table if not exists pg_temp.standard_levels (exercise_id uuid primary key, rank integer)
      on commit drop;
    truncate pg_temp.standard_levels;
    insert into pg_temp.standard_levels
    select best.exercise_id, coalesce(max(public.level_rank(ss.level)) filter (where best.value >= ss.value), 0)
    from (
      select
        st.exercise_id,
        case e.metric
          when 'weight_reps' then max(st.best_e1rm) / nullif(v_body_weight, 0)
          when 'reps' then max(st.max_reps)::numeric
          else max(st.max_hold_sec)::numeric
        end as value,
        case e.metric when 'weight_reps' then 'bw_ratio' when 'reps' then 'reps' else 'hold_sec' end as metric
      from public.exercise_session_stats st
      join public.exercises e on e.id = st.exercise_id
      where st.user_id = v_user.id and st.performed_at > now() - interval '180 days'
      group by st.exercise_id, e.metric
    ) best
    join public.strength_standards ss
      on ss.exercise_id = best.exercise_id and ss.sex = v_user.sex and ss.metric = best.metric
    where best.value is not null
    group by best.exercise_id;

    select avg(sl.rank) into v_overall from pg_temp.standard_levels sl;

    insert into public.user_exercise_levels (user_id, exercise_id, level, source, confidence, updated_at)
    select
      v_user.id,
      ue.exercise_id,
      coalesce(
        public.level_from_rank(sl.rank),
        public.level_from_rank(muscle_level.rank),
        public.level_from_rank(v_overall),
        coalesce(v_user.overall_level, public.level_from_experience(v_user.training_experience), 'beginner')
      ),
      case
        when sl.rank is not null then 'standards'
        when muscle_level.rank is not null then 'muscles'
        when v_overall is not null then 'overall'
        else 'onboarding'
      end,
      case
        when sl.rank is not null then 0.9
        when muscle_level.rank is not null then 0.6
        when v_overall is not null then 0.4
        else 0.2
      end,
      now()
    from pg_temp.user_exercises ue
    left join pg_temp.standard_levels sl on sl.exercise_id = ue.exercise_id
    left join lateral (
      select sum(other.rank * em.weight * tm.weight) / nullif(sum(em.weight * tm.weight), 0) as rank
      from public.exercise_muscles tm
      join public.exercise_muscles em on em.muscle_id = tm.muscle_id and em.exercise_id <> tm.exercise_id
      join pg_temp.standard_levels other on other.exercise_id = em.exercise_id
      where tm.exercise_id = ue.exercise_id
    ) muscle_level on true
    on conflict (user_id, exercise_id) do update set
      level = excluded.level,
      source = excluded.source,
      confidence = excluded.confidence,
      updated_at = excluded.updated_at;

    if v_overall is not null then
      update public.profiles
      set overall_level = public.level_from_rank(v_overall), level_updated_at = now()
      where id = v_user.id;
    end if;
  end loop;
end $$;
revoke execute on function public.recalc_levels(uuid) from public, anon, authenticated;

do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    execute $cron$ select cron.schedule('recalc-levels-weekly', '17 3 * * 1', 'select public.recalc_levels()') $cron$;
  end if;
end $$;

revoke execute on function public.level_rank(text), public.level_from_rank(numeric), public.period_days_for_level(text)
  from public, anon;
grant execute on function public.level_rank(text), public.level_from_rank(numeric), public.period_days_for_level(text)
  to authenticated;
