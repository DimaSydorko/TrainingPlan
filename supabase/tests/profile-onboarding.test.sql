begin;
select plan(5);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'a@test.com'),
  ('00000000-0000-0000-0000-00000000000b', 'b@test.com');

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a"}';

select lives_ok($$update public.profiles set sex = 'male', training_experience = '1_3y', onboarded_at = now()
  where id = '00000000-0000-0000-0000-00000000000a'$$, 'owner completes onboarding');
select results_eq('select overall_level, onboarded_at is not null from public.profiles',
  $$values ('intermediate'::text, true)$$, 'experience sets the starting level');
select lives_ok($$insert into public.body_weights (user_id, weight_kg) values ('00000000-0000-0000-0000-00000000000a', 80)
  on conflict (user_id, measured_on) do update set weight_kg = excluded.weight_kg$$, 'body weight saved');

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000b"}';
update public.profiles set onboarded_at = null where id = '00000000-0000-0000-0000-00000000000a';
select is_empty('select 1 from public.body_weights', 'another user sees no body weights');
reset role;
select isnt((select onboarded_at from public.profiles where id = '00000000-0000-0000-0000-00000000000a'), null,
  'another user cannot change onboarding');

select * from finish();
rollback;
