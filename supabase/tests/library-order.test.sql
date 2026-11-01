begin;
select plan(11);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'a@test.com'),
  ('00000000-0000-0000-0000-00000000000b', 'b@test.com');

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a"}';

select lives_ok($$select public.save_workout('{"id":"a0000000-0000-0000-0000-000000000001","name":"Push","exercises":[
  {"id":"ae000000-0000-0000-0000-000000000001","exercise_key":"bench press","exercise_name":"Bench press",
   "exercise_metric":"reps","laps":1,"sets":[{"reps":8}]},
  {"id":"ae000000-0000-0000-0000-000000000002","exercise_key":"time:plank","exercise_name":"Plank",
   "exercise_metric":"time","laps":1,"sets":[{"duration_sec":null}]}]}')$$, 'save_workout resolves exercises by key');
select is((select count(*)::int from public.exercises where owner_id = auth.uid()), 2, 'two own exercises created');
select is(
  (select exercise_id from public.workout_exercises where id = 'ae000000-0000-0000-0000-000000000001'),
  public.legacy_uuid('exercise:00000000-0000-0000-0000-00000000000a:bench press'),
  'same deterministic id as the legacy import');

select lives_ok($$select public.save_workout('{"id":"a0000000-0000-0000-0000-000000000002","name":"Push 2","exercises":[
  {"id":"ae000000-0000-0000-0000-000000000003","exercise_key":"bench press","exercise_name":"Bench Press ",
   "exercise_metric":"weight_reps","laps":1,"sets":[{"reps":8,"weight":60}]}]}')$$, 'second workout reuses the exercise');
select is((select count(*)::int from public.exercises where owner_id = auth.uid()), 2, 'no duplicate exercise');
select is((select metric from public.exercises where name = 'Bench press'), 'weight_reps', 'reps upgraded to weight_reps');

select results_eq('select id from public.workouts order by sort_order',
  $$values ('a0000000-0000-0000-0000-000000000001'::uuid), ('a0000000-0000-0000-0000-000000000002'::uuid)$$,
  'new workouts appended to the end');
select lives_ok($$select public.reorder_workouts(array[
  'a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001']::uuid[])$$, 'reorder_workouts');
select results_eq('select id from public.workouts order by sort_order',
  $$values ('a0000000-0000-0000-0000-000000000002'::uuid), ('a0000000-0000-0000-0000-000000000001'::uuid)$$,
  'order saved');

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000b"}';
select public.reorder_workouts(array['a0000000-0000-0000-0000-000000000001']::uuid[]);
reset role;
select is((select sort_order from public.workouts where id = 'a0000000-0000-0000-0000-000000000001'), 1,
  'another user cannot reorder');

update public.profiles set legacy_imported_at = now() where id = '00000000-0000-0000-0000-00000000000a';
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a"}';
select is(
  public.import_legacy_data('{"exercises":[],"workouts":[{"legacy_id":"w1","name":"Old","exercises":[]}],"plans":[]}') ->> 'skipped',
  'true', 'import runs only once');
reset role;

select * from finish();
rollback;
