---
name: supabase-backend
description: Backend side of Supabase for this app — SQL migrations, RLS policies, profiles, protected fields, RPC/security definer functions, storage buckets, Edge Functions (AI plan generation with DeepSeek), auth settings, environments and security checks. Use when creating or changing tables, policies, functions, buckets or Edge Functions, or reviewing Supabase security.
---

# Supabase backend

App-side code (fetchers, hooks, offline) → `services` skill + `.claude/contracts/server-state.md` (database rules there apply). Firebase move workflow → `firebase-to-supabase-react-query`.

## Where logic goes

| Need | Place |
| --- | --- |
| Own rows CRUD (workouts, plans, results, settings) | Client direct, bounded by RLS |
| AI, publish/share, admin, payments, push, quotas, 3rd-party keys | Edge Function |
| Atomic multi-row/table write, protected-field change | Postgres fn via `.rpc()` |

Secret key (`sb_secret_`/service_role) only in Edge Functions or local one-off scripts. Never in app or browser.

## Rules

1. Schema only via `npx supabase migration new <name>` in git. No dashboard changes.
2. Every `public` table: RLS on, one policy per op, `auth.uid()` check, `with check` on insert/update. Templates: `references/sql-templates.md`.
3. User FKs point to `profiles(id)`, not `auth.users`.
4. Protected columns (role, status, publish flags) not client-updatable: column grants or trigger; change via fn/Edge Function.
5. Functions: `security invoker` by default; `security definer` only with `set search_path = ''` and own `auth.uid()` checks; revoke execute from `public, anon` (and `authenticated` if not client-facing).
6. Views: `with (security_invoker = true)`.
7. Storage: private buckets, path `<user_id>/…`, policies on `storage.objects`.
8. User text (names, notes, published plans) is untrusted. Compatibility: renames break installed apps — add, migrate, drop later; or put a view/RPC in front.
9. Avoid Supabase-only features in core flows; keep trusted logic portable (SQL fns, Deno TS).

## AI Edge Function (DeepSeek)

Template: `references/edge-function-template.md`. Must: client from user's JWT (not secret key), per-user quota, key via `npx supabase secrets set`, strict JSON → zod → code writes rows. Model never emits SQL and gets no open-ended tools.

## Steps

1. Migration SQL → `npx supabase db reset` → `npx supabase gen types typescript --local > app/lib/supabase/database.types.ts`.
2. RLS test in `supabase/tests/<table>.test.sql` (pgTAP): user B cannot select/update/delete user A rows; anon gets nothing. `npx supabase test db`.
3. `npx supabase db lint`; ask the user to check dashboard Security/Performance Advisor after push.
4. Remote: ask before `npx supabase db push` / `functions deploy`; confirm the project ref (dev vs prod).

## Environments

One dev project until MVP; prod is a new project built from the same migrations (`db push`), never copied by hand. Auth before launch: email confirm, CAPTCHA on sign-up, rate limits, redirect allowlist (Google).
