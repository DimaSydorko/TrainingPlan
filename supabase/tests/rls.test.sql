BEGIN;
SELECT plan(24);

-- Create two test users in auth.users directly.
INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-000000000001', 'alice@test.com'),
  ('00000000-0000-0000-0000-000000000002', 'bob@test.com');

-- Profiles are auto-created by the trigger; seed additional rows for plans/workouts.
INSERT INTO public.plans (id, owner_id, name) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Alice plan'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Bob plan');

INSERT INTO public.workouts (id, owner_id, name) VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Alice workout'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Bob workout');

INSERT INTO public.exercise_images (id, owner_id, file_name, storage_key, download_url, filter) VALUES
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'img.png', 'key1', 'url1', 'gym'),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'img.png', 'key2', 'url2', 'gym');

-- ─── anon gets nothing ───────────────────────────────────────────────────────
SET LOCAL ROLE anon;
SELECT is(count(*)::int, 0, 'anon cannot select profiles')  FROM public.profiles;
SELECT is(count(*)::int, 0, 'anon cannot select plans')     FROM public.plans;
SELECT is(count(*)::int, 0, 'anon cannot select workouts')  FROM public.workouts;
SELECT is(count(*)::int, 0, 'anon cannot select exercise_images') FROM public.exercise_images;

-- ─── Alice sees only her rows ────────────────────────────────────────────────
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub":"00000000-0000-0000-0000-000000000001"}';

SELECT is(count(*)::int, 1, 'alice sees only her profile')
  FROM public.profiles WHERE id = '00000000-0000-0000-0000-000000000002';

SELECT is(count(*)::int, 0, 'alice cannot see bobs profile')
  FROM public.profiles WHERE id = '00000000-0000-0000-0000-000000000002';

SELECT is(count(*)::int, 1, 'alice sees her plan')
  FROM public.plans WHERE id = '10000000-0000-0000-0000-000000000001';

SELECT is(count(*)::int, 0, 'alice cannot see bobs plan')
  FROM public.plans WHERE id = '10000000-0000-0000-0000-000000000002';

SELECT is(count(*)::int, 1, 'alice sees her workout')
  FROM public.workouts WHERE id = '20000000-0000-0000-0000-000000000001';

SELECT is(count(*)::int, 0, 'alice cannot see bobs workout')
  FROM public.workouts WHERE id = '20000000-0000-0000-0000-000000000002';

SELECT is(count(*)::int, 1, 'alice sees her exercise image')
  FROM public.exercise_images WHERE id = '30000000-0000-0000-0000-000000000001';

SELECT is(count(*)::int, 0, 'alice cannot see bobs exercise image')
  FROM public.exercise_images WHERE id = '30000000-0000-0000-0000-000000000002';

-- ─── Alice cannot update Bob's rows ─────────────────────────────────────────
SELECT throws_ok(
  $$UPDATE public.plans SET name = 'hacked' WHERE id = '10000000-0000-0000-0000-000000000002'$$,
  'alice cannot update bobs plan'
);

SELECT throws_ok(
  $$UPDATE public.workouts SET name = 'hacked' WHERE id = '20000000-0000-0000-0000-000000000002'$$,
  'alice cannot update bobs workout'
);

-- ─── Alice cannot delete Bob's rows ─────────────────────────────────────────
SELECT throws_ok(
  $$DELETE FROM public.plans WHERE id = '10000000-0000-0000-0000-000000000002'$$,
  'alice cannot delete bobs plan'
);

SELECT throws_ok(
  $$DELETE FROM public.workouts WHERE id = '20000000-0000-0000-0000-000000000002'$$,
  'alice cannot delete bobs workout'
);

-- ─── Bob sees only his rows ──────────────────────────────────────────────────
SET LOCAL "request.jwt.claims" TO '{"sub":"00000000-0000-0000-0000-000000000002"}';

SELECT is(count(*)::int, 1, 'bob sees his plan')
  FROM public.plans WHERE id = '10000000-0000-0000-0000-000000000002';

SELECT is(count(*)::int, 0, 'bob cannot see alices plan')
  FROM public.plans WHERE id = '10000000-0000-0000-0000-000000000001';

SELECT is(count(*)::int, 1, 'bob sees his workout')
  FROM public.workouts WHERE id = '20000000-0000-0000-0000-000000000002';

SELECT is(count(*)::int, 0, 'bob cannot see alices workout')
  FROM public.workouts WHERE id = '20000000-0000-0000-0000-000000000001';

SELECT is(count(*)::int, 1, 'bob sees his exercise image')
  FROM public.exercise_images WHERE id = '30000000-0000-0000-0000-000000000002';

SELECT is(count(*)::int, 0, 'bob cannot see alices exercise image')
  FROM public.exercise_images WHERE id = '30000000-0000-0000-0000-000000000001';

SELECT * FROM finish();
ROLLBACK;
