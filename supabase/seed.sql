-- Local dev seed: creates two test users for RLS testing.
-- This file runs after migrations when Docker is available (`npx supabase db reset`).
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'alice@test.com', crypt('password', gen_salt('bf')), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'bob@test.com',   crypt('password', gen_salt('bf')), now(), now(), now())
ON CONFLICT (id) DO NOTHING;
