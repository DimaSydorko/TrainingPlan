begin;
select plan(34);

insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a', 'a@test.com');
update public.profiles set sex = 'male', training_experience = '1_3y' where id = '00000000-0000-0000-0000-00000000000a';

insert into public.exercises (id, owner_id, name, metric, complexity, pattern_id, pattern_load_ratio) values
  ('e0000000-0000-0000-0000-000000000001', null, 'Barbell bench', 'weight_reps', 3, 'horizontal_press', 1),
  ('e0000000-0000-0000-0000-000000000002', null, 'Dumbbell bench', 'weight_reps', 2, 'horizontal_press', 0.4),
  ('e0000000-0000-0000-0000-000000000003', null, 'Push-up', 'reps', 1, 'horizontal_press', null),
  ('e0000000-0000-0000-0000-000000000004', null, 'Incline press', 'weight_reps', 3, null, null),
  ('e0000000-0000-0000-0000-000000000005', null, 'Plank', 'time', 1, 'core_stability', null);
insert into public.exercise_muscles (exercise_id, muscle_id, weight) values
  ('e0000000-0000-0000-0000-000000000001', 'lower_chest', 1),
  ('e0000000-0000-0000-0000-000000000001', 'triceps', 0.6),
  ('e0000000-0000-0000-0000-000000000004', 'lower_chest', 0.7),
  ('e0000000-0000-0000-0000-000000000004', 'upper_chest', 1),
  ('e0000000-0000-0000-0000-000000000005', 'abs', 1);
insert into public.strength_standards (exercise_id, sex, level, metric, value) values
  ('e0000000-0000-0000-0000-000000000001', 'male', 'beginner', 'bw_ratio', 0.5),
  ('e0000000-0000-0000-0000-000000000001', 'male', 'novice', 'bw_ratio', 0.75),
  ('e0000000-0000-0000-0000-000000000001', 'male', 'intermediate', 'bw_ratio', 1.0),
  ('e0000000-0000-0000-0000-000000000001', 'male', 'advanced', 'bw_ratio', 1.5),
  ('e0000000-0000-0000-0000-000000000004', 'male', 'beginner', 'bw_ratio', 0.4),
  ('e0000000-0000-0000-0000-000000000004', 'male', 'novice', 'bw_ratio', 0.6),
  ('e0000000-0000-0000-0000-000000000004', 'male', 'intermediate', 'bw_ratio', 0.85),
  ('e0000000-0000-0000-0000-000000000004', 'male', 'advanced', 'bw_ratio', 1.3);
insert into public.exercise_images (id, owner_id, storage_path, file_name) values
  ('f0000000-0000-0000-0000-000000000001', null, 'catalog/bench.gif', 'bench.gif');

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a"}';
insert into public.body_weights (weight_kg, measured_on) values (80, current_date);

-- save_workout
select lives_ok($$select public.save_workout('{
  "id":"a0000000-0000-0000-0000-000000000001","name":"Push","labels":["gym"],
  "exercises":[
    {"id":"ae000000-0000-0000-0000-000000000001","exercise_id":"e0000000-0000-0000-0000-000000000001","laps":2,"rest_sec":90,
     "sets":[{"reps":5,"weight":80},{"reps":5,"weight":80}]},
    {"id":"ae000000-0000-0000-0000-000000000002","exercise_id":"e0000000-0000-0000-0000-000000000005","laps":1,
     "sets":[{"duration_sec":60}]}
  ]}')$$, 'save_workout inserts');
select is((select count(*)::int from public.workout_exercises), 2, 'two exercises saved');
select lives_ok($$select public.save_workout('{
  "id":"a0000000-0000-0000-0000-000000000001","name":"Push v2",
  "exercises":[{"id":"ae000000-0000-0000-0000-000000000001","exercise_id":"e0000000-0000-0000-0000-000000000001","laps":1,
     "sets":[{"reps":5,"weight":85}]}]}')$$, 'save_workout updates');
select results_eq('select name, cardinality(labels) from public.workouts', $$values ('Push v2', 0)$$, 'workout updated');
select is((select count(*)::int from public.workout_exercises), 1, 'removed exercise deleted');
select throws_ok($$select public.save_workout('{"id":"a0000000-0000-0000-0000-000000000002","exercises":[
  {"id":"ae000000-0000-0000-0000-000000000009","exercise_id":"e0000000-0000-0000-0000-000000000001","laps":2,"sets":[{}]}]}')$$,
  '23514', null, 'sets length must equal laps');

-- save_plan / delete_plan
select lives_ok($$select public.save_plan('{"id":"b0000000-0000-0000-0000-000000000001","name":"Plan","workouts":[
  {"id":"a0000000-0000-0000-0000-000000000011","name":"Day 1","source_workout_id":"a0000000-0000-0000-0000-000000000001",
   "exercises":[{"id":"ae000000-0000-0000-0000-000000000011","exercise_id":"e0000000-0000-0000-0000-000000000001","laps":1,"sets":[{"reps":5}]}]},
  {"id":"a0000000-0000-0000-0000-000000000012","name":"Day 2","exercises":[]}]}')$$, 'save_plan inserts');
select results_eq(
  $$select w.name, pw.position::int, w.in_library from public.plan_workouts pw join public.workouts w on w.id = pw.workout_id order by pw.position$$,
  $$values ('Day 1', 0, false), ('Day 2', 1, false)$$, 'plan workouts are ordered copies');
select is((select source_workout_id from public.workouts where id = 'a0000000-0000-0000-0000-000000000011'),
  'a0000000-0000-0000-0000-000000000001'::uuid, 'copy keeps source');
select lives_ok($$select public.save_plan('{"id":"b0000000-0000-0000-0000-000000000001","name":"Plan","workouts":[
  {"id":"a0000000-0000-0000-0000-000000000012","name":"Day 2","exercises":[]}]}')$$, 'save_plan removes a workout');
select is_empty($$select 1 from public.workouts where id = 'a0000000-0000-0000-0000-000000000011'$$, 'orphan copy deleted');
select lives_ok($$select public.delete_plan('b0000000-0000-0000-0000-000000000001')$$, 'delete_plan');
select is((select count(*)::int from public.workouts), 1, 'only library workout remains');

-- finish_session → stats + PRs
select is(
  (select (public.finish_session(
    '{"id":"c0000000-0000-0000-0000-000000000001","workout_id":"a0000000-0000-0000-0000-000000000001","workout_name":"Push",
      "started_at":"2026-10-01T10:00:00Z","finished_at":"2026-10-01T11:00:00Z"}',
    '[{"exercise_id":"e0000000-0000-0000-0000-000000000001","lap_no":1,"planned_reps":5,"reps":5,"weight":80},
      {"exercise_id":"e0000000-0000-0000-0000-000000000001","lap_no":2,"planned_reps":5,"reps":3,"weight":85},
      {"exercise_id":"e0000000-0000-0000-0000-000000000001","lap_no":3,"planned_reps":5,"is_skipped":true},
      {"exercise_id":"e0000000-0000-0000-0000-000000000005","lap_no":1,"planned_duration_sec":60,"duration_sec":45}]'
  ) -> 'records')::text::jsonb @> '[{"kind":"e1rm"}]'),
  true, 'finish_session returns new records'
);
select results_eq(
  $$select top_weight, top_reps::int, best_e1rm, hard_sets::int, total_sets::int, skipped_sets::int, volume
    from public.exercise_session_stats where exercise_id = 'e0000000-0000-0000-0000-000000000001'$$,
  $$values (85.00::numeric, 3, 93.50::numeric, 2, 3, 1, 655.00::numeric)$$, 'weighted stats computed'
);
select is((select completion_ratio from public.exercise_session_stats where exercise_id = 'e0000000-0000-0000-0000-000000000001'),
  0.533::numeric, 'completion ratio from plan vs actual');
select is((select max_hold_sec from public.exercise_session_stats where exercise_id = 'e0000000-0000-0000-0000-000000000005'),
  45, 'hold time stat');
select is((select value from public.personal_records where kind = 'e1rm'), 93.50::numeric, 'e1rm PR');
select is(
  (select (public.finish_session('{"id":"c0000000-0000-0000-0000-000000000001"}', '[{"exercise_id":"e0000000-0000-0000-0000-000000000001","lap_no":1,"reps":20,"weight":200}]') ->> 'inserted')::boolean),
  false, 'finish_session is idempotent'
);
select is((select count(*)::int from public.set_logs), 4, 'retry adds no logs');

select public.finish_session(
  '{"id":"c0000000-0000-0000-0000-000000000002","started_at":"2026-10-05T10:00:00Z"}',
  '[{"exercise_id":"e0000000-0000-0000-0000-000000000001","lap_no":1,"reps":5,"weight":90}]'
);
select is((select value from public.personal_records where kind = 'e1rm'), 105.00::numeric, 'better session updates PR');
delete from public.workout_sessions where id = 'c0000000-0000-0000-0000-000000000002';
select is((select value from public.personal_records where kind = 'e1rm'), 93.50::numeric, 'deleting session restores PR');
select is((select count(*)::int from public.exercise_session_stats), 2, 'deleted session stats removed');

-- progress & fatigue
select public.finish_session(format('{"id":"c0000000-0000-0000-0000-0000000000%s","started_at":"%s"}', n, ts)::jsonb,
  format('[{"exercise_id":"e0000000-0000-0000-0000-000000000001","lap_no":1,"reps":5,"weight":%s}]', w)::jsonb)
from (values ('10', '2026-10-15T10:00:00Z', 77.5), ('11', '2026-10-20T10:00:00Z', 80), ('12', '2026-10-25T10:00:00Z', 82.5),
             ('13', '2026-10-28T10:00:00Z', 90), ('14', '2026-10-31T10:00:00Z', 92.5)) v (n, ts, w);
select results_eq(
  $$select status, period_days from public.get_exercise_progress(7, '2026-11-01T12:00:00Z')
    where exercise_id = 'e0000000-0000-0000-0000-000000000001'$$,
  $$values ('up'::text, 7)$$, 'exercise progress up'
);
select results_eq(
  $$select status from public.get_exercise_progress(5, '2026-11-01T12:00:00Z')
    where exercise_id = 'e0000000-0000-0000-0000-000000000001'$$,
  $$values ('up'::text)$$, 'sparse period falls back to doubled period'
);
select is(
  (select status from public.get_muscle_progress(7, '2026-11-01T12:00:00Z') where muscle_id = 'lower_chest'),
  'up', 'muscle progress combines exercises'
);
select cmp_ok(
  (select recovery_pct from public.get_muscle_fatigue('2026-10-31T12:00:00Z') where muscle_id = 'lower_chest'),
  '<', 100, 'trained muscle is fatigued'
);
select is(
  (select recovery_pct from public.get_muscle_fatigue('2026-10-31T12:00:00Z') where muscle_id = 'calves'),
  100, 'untrained muscle fully recovered'
);
select is((select count(*)::int from public.get_muscle_fatigue()), 19, 'fatigue row per muscle');

-- start weight estimate
select results_eq(
  $$select source, e1rm from public.estimate_start_weight('e0000000-0000-0000-0000-000000000002')$$,
  $$values ('pattern'::text, 43.17::numeric)$$, 'pattern ratio converts barbell e1rm to dumbbell'
);
select is((select source from public.estimate_start_weight('e0000000-0000-0000-0000-000000000004')),
  'standards', 'no pattern data falls back to standards');
select is_empty($$select 1 from public.estimate_start_weight('e0000000-0000-0000-0000-000000000003')$$,
  'no weight estimate for bodyweight exercise');
select throws_ok($$select public.recalc_levels()$$, '42501', null, 'clients cannot run level job');

reset role;
select public.recalc_levels('00000000-0000-0000-0000-00000000000a');
set local role authenticated;
select results_eq(
  $$select level, source from public.user_exercise_levels where exercise_id = 'e0000000-0000-0000-0000-000000000001'$$,
  $$values ('intermediate'::text, 'standards'::text)$$, 'level from standards (e1rm 107.92 / bw 80 = 1.35)'
);

select * from finish();
rollback;
