begin;
select plan(4);

insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-0000000000c1', 'google@test.com',
   '{"full_name": "Google User", "avatar_url": "https://example.com/a.png"}'),
  ('00000000-0000-0000-0000-0000000000c2', 'mail@test.com', '{"full_name": "Mail User"}');

select is(
  (select display_name from public.profiles where id = '00000000-0000-0000-0000-0000000000c1'),
  'Google User', 'display_name from full_name'
);
select is(
  (select photo_url from public.profiles where id = '00000000-0000-0000-0000-0000000000c1'),
  'https://example.com/a.png', 'photo_url from avatar_url'
);
select is(
  (select photo_url from public.profiles where id = '00000000-0000-0000-0000-0000000000c2'),
  null, 'photo_url empty without avatar'
);
select is(
  (select email from public.profiles where id = '00000000-0000-0000-0000-0000000000c2'),
  'mail@test.com', 'email copied'
);

select * from finish();
rollback;
