begin;
select plan(13);

insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a', 'a@test.com');
insert into public.exercises (id, owner_id, name, metric) values
  ('e0000000-0000-0000-0000-000000000001', null, 'Squat', 'weight_reps');
insert into public.exercise_images (id, owner_id, storage_path, file_name) values
  ('f0000000-0000-0000-0000-000000000001', null, 'catalog/curl.gif', 'curl.gif');

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a"}';

create temporary table payload as select '{
  "include_baseline": true,
  "exercises": [
    {"key":"squat","name":"Squat","metric":"weight_reps","catalog_exercise_id":"e0000000-0000-0000-0000-000000000001"},
    {"key":"curl","name":"Curl","metric":"weight_reps","image_file_name":"curl.gif"},
    {"key":"time:plank","name":"Plank","metric":"time"}
  ],
  "workouts": [
    {"legacy_id":"wLegs00000000001","name":"Legs","color_idx":2,"labels":["gym"],"updated_at_ms":1760000000000,
     "exercises":[
       {"exercise_key":"squat","laps":2,"rest_sec":120,"is_visible":true,"color_idx":0,
        "sets":[{"reps":5,"weight":100},{"reps":5,"weight":105}]},
       {"exercise_key":"time:plank","laps":1,"rest_sec":30,"is_visible":true,"color_idx":1,"sets":[{"duration_sec":null}]}
     ]}
  ],
  "plans": [
    {"legacy_id":"pPlan00000000001","name":"Plan","color_idx":1,"labels":[],"updated_at_ms":1761000000000,
     "workouts":[
       {"legacy_id":"wLegs00000000001","source_legacy_id":"wLegs00000000001","name":"Legs","color_idx":2,"labels":[],
        "exercises":[{"exercise_key":"squat","laps":1,"rest_sec":120,"is_visible":true,"color_idx":0,"sets":[{"reps":3,"weight":110}]}]},
       {"legacy_id":"wArms00000000001","name":"Arms","color_idx":0,"labels":[],
        "exercises":[{"exercise_key":"curl","laps":1,"rest_sec":60,"is_visible":true,"color_idx":0,"sets":[{"reps":10,"weight":15}]}]}
     ]}
  ]
}'::jsonb as body;
grant select on payload to authenticated;

select results_eq(
  'select public.import_legacy_data(body) from payload',
  $$values ('{"exercises": 3, "workouts": 3, "plans": 1, "baseline_sets": 2}'::jsonb)$$,
  'import reports counts'
);
select is((select count(*)::int from public.exercises where owner_id is not null), 2, 'custom exercises created');
select is((select image_id from public.exercises where name = 'Curl'), 'f0000000-0000-0000-0000-000000000001'::uuid,
  'custom exercise linked to catalog image');
select is((select count(*)::int from public.workout_exercises where exercise_id = 'e0000000-0000-0000-0000-000000000001'), 2,
  'catalog-mapped exercise used in library and plan');
select results_eq('select name, in_library from public.workouts order by name, in_library',
  $$values ('Arms', false), ('Legs', false), ('Legs', true)$$, 'library + plan copies');
select is(
  (select count(*)::int from public.workouts w join public.workouts src on src.id = w.source_workout_id),
  1, 'plan copy linked to library workout');
select is((select created_at from public.workouts where in_library), to_timestamp(1760000000), 'created_at from lastUpdated');
select is((select source from public.workout_sessions), 'legacy_baseline', 'baseline session created');
select results_eq(
  $$select e.name, sl.lap_no::int, sl.reps::int, sl.weight from public.set_logs sl join public.exercises e on e.id = sl.exercise_id
    order by e.name, sl.lap_no$$,
  $$values ('Curl', 1, 10, 15.00::numeric), ('Squat', 1, 3, 110.00::numeric)$$,
  'baseline uses latest workout per exercise, skips time exercises'
);
select is_empty('select 1 from public.personal_records', 'baseline gives no PRs');
select isnt((select legacy_imported_at from public.profiles), null, 'profile marked imported');

select lives_ok('select public.import_legacy_data(body) from payload', 're-import runs');
select results_eq(
  $$select (select count(*) from public.workouts)::int, (select count(*) from public.set_logs)::int,
    (select count(*) from public.exercises)::int$$,
  $$values (3, 2, 3)$$, 're-import is idempotent'
);

select * from finish();
rollback;
