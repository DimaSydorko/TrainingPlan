begin;
select plan(30);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'a@test.com'),
  ('00000000-0000-0000-0000-00000000000b', 'b@test.com');

insert into public.exercises (id, owner_id, name, metric, complexity) values
  ('e0000000-0000-0000-0000-000000000001', null, 'Bench press', 'weight_reps', 3),
  ('e0000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000a', 'A custom', 'reps', null),
  ('e0000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-00000000000b', 'B custom', 'reps', null);
insert into public.exercise_muscles (exercise_id, muscle_id, weight) values
  ('e0000000-0000-0000-0000-000000000001', 'lower_chest', 1),
  ('e0000000-0000-0000-0000-00000000000b', 'abs', 1);
insert into public.workouts (id, owner_id, name) values
  ('a0000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-00000000000b', 'B workout');
insert into public.workout_exercises (id, workout_id, exercise_id, position, laps, sets) values
  ('ae000000-0000-0000-0000-00000000000b', 'a0000000-0000-0000-0000-00000000000b',
   'e0000000-0000-0000-0000-00000000000b', 0, 1, '[{"reps": 10}]');
insert into public.plans (id, owner_id, name) values
  ('b0000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-00000000000b', 'B plan');
insert into public.workout_sessions (id, user_id, workout_name) values
  ('c0000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-00000000000b', 'B session');
insert into public.set_logs (session_id, user_id, exercise_id, lap_no, reps) values
  ('c0000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-00000000000b',
   'e0000000-0000-0000-0000-00000000000b', 1, 10);
insert into public.body_weights (user_id, weight_kg) values ('00000000-0000-0000-0000-00000000000b', 80);

-- anon
set local role anon;
select is_empty('select 1 from public.exercises', 'anon sees no exercises');
select is_empty('select 1 from public.muscles', 'anon sees no muscles');
select is_empty('select 1 from public.workouts', 'anon sees no workouts');
select throws_ok($$select public.finish_session('{}', '[]')$$, '42501', null, 'anon cannot finish session');

-- user A
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a"}';

select is((select count(*)::int from public.muscles), 19, 'muscles readable');
select results_eq(
  'select id from public.exercises order by id',
  $$values ('e0000000-0000-0000-0000-000000000001'::uuid), ('e0000000-0000-0000-0000-00000000000a'::uuid)$$,
  'A sees catalog + own exercises only'
);
select is_empty($$select 1 from public.exercise_muscles where exercise_id = 'e0000000-0000-0000-0000-00000000000b'$$,
  'A cannot see B exercise muscles');
select is_empty('select 1 from public.workouts', 'A cannot see B workouts');
select is_empty('select 1 from public.workout_exercises', 'A cannot see B workout exercises');
select is_empty('select 1 from public.plans', 'A cannot see B plans');
select is_empty('select 1 from public.workout_sessions', 'A cannot see B sessions');
select is_empty('select 1 from public.set_logs', 'A cannot see B set logs');
select is_empty('select 1 from public.exercise_session_stats', 'A cannot see B stats');
select is_empty('select 1 from public.personal_records', 'A cannot see B records');
select is_empty('select 1 from public.body_weights', 'A cannot see B body weights');
select is((select count(*)::int from public.profiles), 1, 'A sees only own profile');

select results_eq(
  $$with d as (update public.exercises set name = 'x' where id = 'e0000000-0000-0000-0000-000000000001' returning 1)
    select count(*) from d$$,
  array[0::bigint], 'A cannot rename catalog exercise'
);
select results_eq(
  $$with d as (delete from public.workouts where id = 'a0000000-0000-0000-0000-00000000000b' returning 1)
    select count(*) from d$$,
  array[0::bigint], 'A cannot delete B workout'
);
select throws_ok(
  $$insert into public.exercises (owner_id, name) values (null, 'fake catalog')$$,
  '42501', null, 'A cannot create catalog exercise'
);
select throws_ok(
  $$update public.exercises set complexity = 1 where id = 'e0000000-0000-0000-0000-00000000000a'$$,
  '42501', null, 'A cannot set catalog-only column'
);
select throws_ok(
  $$insert into public.muscles (id, group_id, recovery_hours) values ('x', 'chest', 48)$$,
  '42501', null, 'A cannot write reference tables'
);
select throws_ok(
  $$update public.profiles set role = 'admin'$$, '42501', null, 'A cannot change own role'
);
select throws_ok(
  $$update public.profiles set overall_level = 'advanced'$$, '42501', null, 'A cannot set own level'
);
select lives_ok($$update public.profiles set training_experience = '1_3y', sex = 'male'$$, 'A can set onboarding');
select is((select overall_level from public.profiles), 'intermediate', 'onboarding sets starting level');

insert into public.workouts (id, name) values ('a0000000-0000-0000-0000-00000000000a', 'A workout');
select throws_ok(
  $$insert into public.workout_exercises (workout_id, exercise_id, position, laps, sets)
    values ('a0000000-0000-0000-0000-00000000000a', 'e0000000-0000-0000-0000-00000000000b', 0, 1, '[{}]')$$,
  '42501', null, 'A cannot use B custom exercise'
);
select throws_ok(
  $$insert into public.workout_exercises (workout_id, exercise_id, position, laps, sets)
    values ('a0000000-0000-0000-0000-00000000000b', 'e0000000-0000-0000-0000-000000000001', 0, 1, '[{}]')$$,
  '42501', null, 'A cannot add exercise to B workout'
);
select throws_ok(
  $$insert into public.set_logs (session_id, exercise_id, lap_no, reps)
    values ('c0000000-0000-0000-0000-00000000000b', 'e0000000-0000-0000-0000-000000000001', 2, 5)$$,
  '42501', null, 'A cannot log into B session'
);
select throws_ok(
  $$insert into public.exercise_session_stats (session_id, exercise_id, user_id, performed_at)
    values ('c0000000-0000-0000-0000-00000000000b', 'e0000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-00000000000a', now())$$,
  '42501', null, 'A cannot write stats'
);
select throws_ok(
  $$select public.save_plan('{"id":"b0000000-0000-0000-0000-00000000000b","name":"hijack","workouts":[]}')$$,
  '42501', null, 'A cannot overwrite B plan via save_plan'
);

select * from finish();
rollback;
