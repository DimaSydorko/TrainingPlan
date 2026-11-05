begin;
select plan(3);

insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a', 'a@test.com');
insert into public.exercises (id, owner_id, name, metric) values
  ('e0000000-0000-0000-0000-000000000001', null, 'Squat', 'weight_reps');

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a"}';

select lives_ok($$select public.finish_session(
  '{"id":"c0000000-0000-0000-0000-000000000001","workout_id":"a0000000-0000-0000-0000-00000000dead",
    "plan_id":"b0000000-0000-0000-0000-00000000dead","workout_name":"Gone","effort_rating":3}',
  '[{"exercise_id":"e0000000-0000-0000-0000-000000000001","workout_exercise_id":"ae000000-0000-0000-0000-00000000dead",
     "lap_no":1,"reps":5,"weight":100}]')$$, 'finish with deleted workout, plan and row');
select results_eq('select workout_id, plan_id, effort_rating::int from public.workout_sessions',
  $$values (null::uuid, null::uuid, 3)$$, 'missing references stored as null');
select results_eq('select workout_exercise_id, reps::int from public.set_logs', $$values (null::uuid, 5)$$,
  'set kept without its workout row');

select * from finish();
rollback;
