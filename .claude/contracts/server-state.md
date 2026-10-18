## Server State (Supabase + React Query)

Server state — anything stored in the backend (plans, workouts, publications, profiles, exercise images) — is owned
by **React Query** and fetched from **Supabase**. Client/UI state belongs in Zustand (`client-state.md`). Never
copy fetched entities into a store "for convenience".

> **Migration status.** Today all server data still goes through Firebase + Redux thunks (`app/store/**`). Those
> rules are in the _Legacy Firebase_ section at the end. Everything else in this file applies to new code.

### Layer split — non-negotiable

Server state flows through these layers, top-down. Each layer imports only from the layer directly below it.

| Layer                         | Path                                                       | Owns                                                                                                   | Forbidden                                                   |
| ----------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| Consumer hooks (optional)     | `app/screens/<screen-name>/hooks/use-*.ts`                      | Screen-specific composition/derivation over a shared hook                                              | Redefining query keys; calling Supabase; reading `app/api`  |
| Shared React Query hooks      | `app/services/<entity>/use-*.ts` + `query-keys.ts`         | `useQuery` / `useMutation`, query options, key factory, invalidation, optimistic updates, realtime → invalidate | Supabase client import; row types; store reads        |
| Fetchers (anti-corruption)    | `app/api/<entity>/<operation>.ts` (+ `types.ts`, `mappers.ts`) | The Supabase query/RPC, error → throw, row ↔ domain mapping                                          | React Query, React, stores, navigation                      |
| Client                        | `app/lib/supabase/client.ts`, `database.types.ts`          | The one `createClient<Database>()` instance and the generated types                                    | Feature code                                                |

```
app/lib/supabase/client.ts            ← createClient<Database>(…) — only file that imports @supabase/supabase-js for runtime
app/lib/supabase/database.types.ts    ← generated, never hand-edited
app/lib/query-client.ts               ← QueryClient, persister, onlineManager/focusManager, mutation defaults
app/api/plans/get-plans.ts            ← pure fetcher
app/api/plans/mappers.ts              ← PlanRow ↔ Plan
app/services/plans/use-plans.ts       ← useQuery wrapping getPlans
app/services/plans/use-save-plan.ts   ← useMutation (optimistic, offline-capable)
app/services/plans/query-keys.ts      ← plansKeys + // Invalidations: map
```

Rules:

-   ESLint enforces the split (`no-restricted-imports` overrides in `eslint.config.js`): only `app/lib/supabase/**`
    and `app/api/**` may import `@supabase/supabase-js` / the client; `app/api/**` may not import React Query, React
    or stores; nothing outside `app/services/**` imports `app/api/**`.
-   Never call `supabase.from(...)` inside `queryFn` / `mutationFn` — import the fetcher.
-   Group by **entity** (`plans`, `workouts`, `publications`, `profiles`, `exercise-images`), never by screen.

### Supabase client and types

-   One client in `app/lib/supabase/client.ts`, created with the anon key from `EXPO_PUBLIC_SUPABASE_URL` /
    `EXPO_PUBLIC_SUPABASE_ANON_KEY`, session persisted in AsyncStorage, `detectSessionInUrl: false`, and
    `startAutoRefresh` / `stopAutoRefresh` wired to `AppState`. Follow the current Supabase Expo quickstart for the
    exact setup (polyfills change between versions — check before adding one).
-   The **service-role key never ships in the app.**
-   Types are generated: `npx supabase gen types typescript --project-id <id> > app/lib/supabase/database.types.ts`
    (or `--local`). Regenerate after every migration; never edit the file by hand.
-   Row types (`Tables<'plans'>`, `TablesInsert<'plans'>`, `TablesUpdate<'plans'>`) are used **only inside
    `app/api/**`**.

### Database rules

-   Schema changes are SQL migrations in `supabase/migrations/` created with the Supabase CLI
    (`npx supabase migration new <name>`). No dashboard-only schema changes.
-   **Row Level Security is enabled on every table**, with explicit policies (owner rows:
    `auth.uid() = owner_id`; publications: readable by everyone, writable by the owner). A client-side
    `.eq('owner_id', userId)` filter is a query, not a security boundary.
-   Primary keys are UUIDs that the **client can generate** (`expo-crypto` `randomUUID()`), so items created offline
    keep their id after sync.
-   Every mutable table has `updated_at` (trigger-maintained) for conflict resolution; default is last-write-wins.
-   Multi-row or multi-table writes that must be atomic go through a Postgres function called with `.rpc()`.

### Fetchers (`app/api/<entity>/`)

-   One file per operation, named after it: `get-plans.ts`, `get-plan.ts`, `save-plan.ts`, `delete-plan.ts`.
-   Always destructure `{ data, error }` and **throw** on `error`, so React Query sees the failure. Never return
    `null`/`[]` to hide an error.
-   Map rows to domain types in `mappers.ts` (snake_case → camelCase, `null` → `undefined` where the domain expects
    it, JSON columns parsed and validated). The domain type is what the rest of the app sees.
-   Select only the columns you map (`.select('id, title, …')`), and paginate list queries (`.range()`), using the
    existing `QUERY_LIMIT` style constants.
-   Fetchers take all inputs as arguments (including `userId`); they never read the session or a store.

### Types convention

`type` only, no `I` prefix, action-first names:

```ts
type SavePlanArgs = { plan: Plan; userId: UserId }
type GetPlansArgs = { userId: UserId; page: number }
```

### Hooks accept all inputs as arguments

Never read a store or the session inside a shared hook. The consumer reads them and passes values in.

```ts
// ✅
const { data: plans } = usePlans({ userId })

// ❌
const usePlans = () => {
  const userId = useSessionStore(s => s.userId)
}
```

### Query keys — one factory per entity

Never inline string-array keys. The factory lives at `app/services/<entity>/query-keys.ts`:

```ts
export const plansKeys = {
  all: ['plans'] as const,
  lists: () => [...plansKeys.all, 'list'] as const,
  list: (userId: UserId) => [...plansKeys.lists(), userId] as const,
  detail: (planId: PlanId) => [...plansKeys.all, 'detail', planId] as const,
}

// Invalidations:
// useSavePlan   → plansKeys.list(userId) + plansKeys.detail(planId)
// useDeletePlan → plansKeys.list(userId)
```

Everything extends `<entity>Keys.all` so logout can `removeQueries({ queryKey: plansKeys.all })`.

### `enabled` gates required inputs

If an arg can be `null` / `undefined` (no session yet, no selected plan), pass `enabled: Boolean(arg)`.

### Offline-first — non-negotiable

The app is used in gyms with poor connectivity; today it works offline through a local Redux copy. React Query must
keep that behavior:

-   `app/lib/query-client.ts` wires `onlineManager` to NetInfo and `focusManager` to `AppState`.
-   The cache is persisted with `PersistQueryClientProvider` + an AsyncStorage persister. Because persisted queries
    must outlive the persister's `maxAge`, the global default `gcTime` is **24 h** (match the persister).
-   Queries use `networkMode: 'offlineFirst'`.
-   Every mutation that must survive offline has a `mutationKey` and is registered with
    `queryClient.setMutationDefaults(key, { mutationFn })`, so paused mutations can be resumed after an app restart
    (`resumePausedMutations()` in the persister's `onSuccess`).
-   Offline-capable mutations update the cache optimistically (see rubric) so the UI reflects the change at once.
-   Actions that need the server (publish, copy a publication, sign in) check `onlineManager.isOnline()` and tell the
    user instead of queueing.

### Caching (`staleTime`) — chosen per entity

Default `staleTime` is `0`. Set a longer one only deliberately, after you can answer: what staleness is acceptable,
and which mutations invalidate this key (add them to the `// Invalidations:` map). Guide:

| Data                                       | `staleTime`        | Notes                                                    |
| ------------------------------------------ | ------------------ | -------------------------------------------------------- |
| Own plans / workouts                       | `5 * 60_000`       | Changed mostly by this device; mutations invalidate      |
| Publications feed                          | `60_000`           | Other users' data; pull-to-refresh calls `refetch()`     |
| Profile / settings sync                    | `5 * 60_000`       |                                                          |
| Exercise images catalogue                  | `24 * 60 * 60_000` | Rarely changes; large — select only needed columns       |

Do not copy `staleTime` from a sibling hook "because it works there".

### Mutation strategy — decision rubric

| Signal                                                                                   | Strategy                                                         |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| User's own data that must work offline (create/edit/reorder/delete plan, workout, results) | **Optimistic** with snapshot + rollback, invalidate on settle  |
| Shared/server-validated actions (publish, unpublish, copy publication, account changes)  | **Invalidate** on success; require online                        |
| Unclear                                                                                  | **Invalidate** — it's safer                                      |

Optimistic mutations follow all five steps: `cancelQueries` → snapshot → `setQueryData` → rollback in `onError` →
`invalidateQueries` in `onSettled`.

### Cross-entity invalidation map

Keep an `// Invalidations:` block at the bottom of each `query-keys.ts` listing which mutations affect which keys
(e.g. publishing a workout invalidates `publicationsKeys.lists()` and `workoutsKeys.detail(id)`).

### Realtime

Supabase Realtime subscriptions live in a hook in `app/services/<entity>/` (`use-plans-realtime.ts`). The handler
only **invalidates** (or patches) the entity's keys; it never writes to a store. Unsubscribe
(`supabase.removeChannel`) in the effect cleanup. Subscribe only where live updates matter.

### Errors

-   Fetchers throw; hooks don't swallow.
-   User-facing error toasts come from one place: `QueryCache` / `MutationCache` `onError` in
    `app/lib/query-client.ts` → the toast store rendered by `NotificationHandler`. Screens don't build their own
    error toasts (they may render inline empty/error states).

### Request hygiene — fetch once, fetch correctly

-   Never fetch the same data from sibling components with separate effects — share one query.
-   No `useEffect` + `useState` fetching in new code. No effect loops from unstable deps; never put a fresh object or
    array literal in a query key or dependency array.
-   Never use a `useMutation` without invalidation (or optimistic update + settle invalidation).
-   Never store fetched entities in Zustand or Redux.
-   Paginated lists (`InfiniteScroll`) use `useInfiniteQuery`.

### Auth

-   Supabase Auth is the session source. Email/password via `supabase.auth.signInWithPassword` / `signUp`; Google
    via `getGoogleIdToken()` from `app/platform/google-auth.ts` → `supabase.auth.signInWithIdToken({ provider:
    'google', token })`.
-   Auth calls live in `app/api/auth/`; the session is exposed through one hook (`app/services/auth/use-session.ts`)
    driven by `onAuthStateChange`.
-   Logout: `supabase.auth.signOut()`, `signOutGoogle()`, `queryClient.clear()` (and remove the persisted cache), and
    every store's `reset()` (`client-state.md`).

### Legacy Firebase (until removed)

-   Firestore/Auth calls exist only in `app/utils/firebase.ts`, `app/store/firestore.ts`, `app/store/sync.ts` and the
    `app/store/**/*AC.ts` thunks. **Do not add new ones.** Modular API only (`firebase/compat` is ESLint-blocked).
-   When an entity moves to Supabase, delete its Firestore code, its thunks and its Redux data in the same change;
    never dual-write or read from both.
-   Existing user data is moved by a one-off migration script (outside the app bundle), not by app code.
