---
name: firebase-to-supabase-react-query
description: Use when moving an entity's server data (plans, workouts, publications, user profile, exercise images, auth) from Firebase + Redux thunks to Supabase + React Query, or when standing up the Supabase/React Query foundation. Drives the workflow (delivery shape, foundation checkpoint, per-entity checkpoints, data migration, QA note). Code rules live in .claude/contracts/server-state.md.
---

# Firebase + Redux thunks → Supabase + React Query

Moves **server state** out of Firebase/Redux into Supabase/React Query, one entity at a time. Client/UI state goes
to Zustand afterwards — companion skill `redux-to-zustand-migration`.

## Code rules — read the contract first

`.claude/contracts/server-state.md` (layers, Supabase rules, offline-first, keys, mutation rubric) and
`.claude/contracts/client-state.md`. This file is the **workflow**.

## Recommended order

1. Foundation (below)
2. `exercise-images` (read-only, simplest) → `workouts` → `plans` (references workouts) → `publications` → `profiles`
3. Auth (Supabase Auth replaces Firebase Auth) — can happen before step 2 if the backend needs `auth.uid()` for
   RLS from day one; in that case do auth right after the foundation
4. Remaining Redux → Zustand (`redux-to-zustand-migration`)
5. Remove `firebase`, Firestore helpers, `app/store/sync.ts`, then Redux

Ask the user to confirm the order before starting; they may have reasons to change it.

## When NOT to use

-   State never leaves the device (theme, sound, playback) → `redux-to-zustand-migration`
-   Device APIs → `app/platform`

## Delivery shape — ask first

**Option A — Multiple PRs (default).** Foundation PR, then one PR per entity, then cleanup.
**Option B — One branch, checkpoints.** Commit and pause after each unit so the user can test on a device.

Do not assume A. **Never create or switch branches yourself** — ask the user.

## Foundation checkpoint — rigid checklist (additive only)

-   [ ] Supabase project exists; ask the user for the project ref. Add `supabase/` via `npx supabase init`
-   [ ] Install with `npx expo install @supabase/supabase-js @tanstack/react-query @tanstack/react-query-persist-client @tanstack/query-async-storage-persister expo-crypto`
        (check the current Supabase Expo quickstart for any extra polyfill it requires)
-   [ ] `.env.example` + EAS env: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
-   [ ] `app/lib/supabase/client.ts` (AsyncStorage session, `detectSessionInUrl: false`, AppState auto-refresh)
-   [ ] `app/lib/supabase/database.types.ts` generated
-   [ ] `app/lib/query-client.ts`: `QueryClient` defaults (`gcTime` 24 h, queries `networkMode: 'offlineFirst'`,
        `retry` sane), `onlineManager` ← NetInfo, `focusManager` ← AppState, `QueryCache`/`MutationCache`
        `onError` → toast, AsyncStorage persister
-   [ ] `app.tsx`: `PersistQueryClientProvider` with `onSuccess={() => queryClient.resumePausedMutations()}` —
        inside the existing Redux providers for now
-   [ ] Jest: mock for `app/lib/supabase/client` in `app/__tests__/setup/mocks/`, a `createTestQueryClient()` +
        `renderWithQueryClient` util in `app/__tests__/utils/`
-   [ ] ESLint layer rules active (`eslint.config.js`)
-   [ ] `npx tsc --noEmit`, `npm run lint`, `npm test`, `npx expo export` pass; no Firebase/Redux code removed

## Per-entity checkpoint

1. **Inventory.** List every Firestore read/write for the entity (`rg "<collection>Collection|<Entity>AC|<entity>Reducer" app`),
   the Redux fields holding its data, and every screen reading them (`use<Entity>()` from `app/hooks/redux.ts`).
2. **Schema.** Migration with table, `updated_at` trigger, RLS + policies (`supabase-backend` skill); regenerate types.
3. **Data migration.** A one-off script outside the app (`scripts/migrate-<entity>.ts`, run with the service-role
   key from the developer's machine, never bundled) copies Firestore docs into the table, mapping Firebase uids to
   Supabase user ids. Make it idempotent (upsert) and log counts. Ask the user before running it against
   production.
4. **Fetchers + mappers** in `app/api/<entity>/` (recipe: `services` skill).
5. **Hooks + keys** in `app/services/<entity>/`; offline mutations with `mutationKey` + `setMutationDefaults`.
   Templates: `references/hook-templates.md`, `references/optimistic-mutation-template.md`,
   `references/query-key-factory.md`, `references/stale-time-rubric.md`.
6. **Switch consumers.** Replace `use<Entity>()` selectors and `dispatch(<entity>AC.*)` in screens with the hooks.
   Selection state that was a copy of the entity becomes an id (`selectedWorkoutId`).
7. **Remove legacy for this entity in the same checkpoint**: its thunks in `*AC.ts`, its data fields and reducers
   in the slice, its Firestore collection ref, its part of `sync.ts`, its Redux tests. Keep redux-persist key
   `root` untouched.
8. **Local data hand-over.** Items that exist only in the old persisted Redux state (created offline, never synced)
   are uploaded once on first launch after the update, then dropped. Test it.
9. Update the `// Invalidations:` map; run tsc, lint, tests, and the Maestro flows touching the entity.

## Auth checkpoint

-   `app/api/auth/` (sign in/up with password, Google via `signInWithIdToken` + `app/platform/google-auth.ts`,
    sign out), `app/services/auth/use-session.ts` over `onAuthStateChange`.
-   User migration: export Firebase Auth users and import them into Supabase (Google users relink by email). Users
    with email/password may need a password reset — confirm the approach with the user before implementing.
-   Logout clears the React Query cache (and persisted cache) and resets stores.

## Final step — QA note (mandatory)

After the user confirms the last checkpoint, write a QA note in chat (not a file unless asked):

1. **What changed** — 2–3 sentences: which entity moved from Firebase to Supabase, any user-visible effect
   (e.g. "lists refresh after edits", "one-time upload of offline items on first launch").
2. **Risk areas** — 2–4 bullets: offline edit then reconnect, upgrade from previous build with local data, RLS
   (another account cannot see the data), logout/login as another user.
3. **Test areas** — by screen (`MyPlans`, `Workouts`, `Workout`, `Playing`, `Publications`, `Profile`,
   `Settings`), one line each, plus the Maestro flows to run (`e2e/0X-*.yaml`).

No step-by-step clicks, no rollback instructions, no unrelated regression lists.

## Companion skill

`redux-to-zustand-migration`. Keep each PR/checkpoint to one concern.
