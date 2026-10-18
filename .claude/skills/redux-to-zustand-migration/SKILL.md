---
name: redux-to-zustand-migration
description: Use when moving client/UI state from the legacy Redux Toolkit slices in app/store (settings, user session UI, workout selection, playback) to Zustand stores in app/stores, including the redux-persist hand-over for settings, reset on logout, and final removal of redux, react-redux and redux-persist. Triggers on migrating Redux to Zustand, replacing a slice with a store, or removing fields from a slice.
---

# Redux → Zustand

Moves **client/UI state** from Redux to Zustand. Server data must already have moved to React Query
(`firebase-to-supabase-react-query`) — do not port fetched entities into Zustand.

## Code rules — read the contract first

`.claude/contracts/client-state.md` (split rule, store shape, selectors, persistence, legacy hand-over, reset).

## When to use

-   Replacing a slice (or part of one) in `app/store/**` with a store in `app/stores/**`
-   Removing fields from a slice whose data moved elsewhere
-   Final removal of Redux

## When NOT to use

-   The field is fetched from the backend → `firebase-to-supabase-react-query`
-   The state is used by one component only → plain `useState`

## Slice inventory (current)

| Slice                 | Client state to move                                               | Server data (moves to React Query first)        |
| --------------------- | ------------------------------------------------------------------ | ----------------------------------------------- |
| `settingsReducer`     | theme (store `themeName`, derive colors), vibration, battery mode, TTS, sound, weight step | — (`internet` → `onlineManager` hook) |
| `workoutReducer`      | `selectedWorkout` → `selectedWorkoutId`, `sortedWorkoutUids` (local order) | `workouts`, `exerciseImages`, `deletedWorkoutUids`, `error`/`isLoading` |
| `plansReducer`        | selection / edit-mode flags                                        | plans, deleted uids, error/loading              |
| `publicationsReducer` | feed filters / search text                                         | publications, error/loading                     |
| `userReducer`         | —                                                                  | user, user data, session (→ Supabase Auth)      |

Re-check this table against the code before starting; it reflects the state at the time this skill was written.

## Delivery shape — ask first

**Option A — Multiple PRs (default):** foundation, one PR per slice, cleanup.
**Option B — One branch, checkpoints:** commit and pause after each unit for device testing.

Never create or switch branches yourself.

## Foundation checkpoint (additive only)

-   [ ] `npx expo install zustand` (v5)
-   [ ] `app/stores/` exists; a shared `reset-stores.ts` that calls every app-wide store's `reset()`
-   [ ] Logout flow calls `resetStores()` next to the existing Redux logout
-   [ ] Test util to reset stores between tests
-   [ ] No Redux files modified or deleted

## Per-slice checkpoint

1. Audit reads/writes: `rg "use<Slice>\(|state\.<slice>Reducer|<sliceAction>" app`.
2. Classify each field (client → store; server → stop, migrate with the other skill first; derived → selector).
3. Create the store (`app/stores/<name>/use-<name>-store.ts`) per `references/store-shape-template.md`, with tests.
4. Settings only: `persist` with `version`, `partialize`, and the one-time read from `persist:root`
   (`references/legacy-persist-handover.md`).
5. Switch consumers to narrow selectors; replace `dispatch(action)` with store actions.
6. Remove the moved fields, reducers and actions from the slice, and their Redux tests. If the slice is now empty,
   remove it from `combineReducers` **but keep the persist key `root`**.
7. tsc, lint, tests, Maestro flows touching the screens.

## Final cleanup (after every slice is gone)

See `references/redux-removal-checklist.md`: remove `Provider`/`PersistGate` from `app.tsx`, `app/store/`,
`app/hooks/redux.ts`, `__tests__/utils/test-store.ts` + `renderWithStore`, the packages, and finally the
`persist:root` key (one release after the hand-over shipped).

## Final step — QA note (mandatory)

In chat, after the last checkpoint:

1. **What changed** — client-state move to Zustand, no feature changes; mention persistence/reset effects
   (e.g. "settings survive the update via a one-time import").
2. **Risk areas** — upgrade from the previous build keeps theme/sound/TTS settings; logout/login as another user
   leaves no selection or playback state; playback survives backgrounding.
3. **Test areas** — by screen (`Settings`, `Workouts`, `Workout`, `Playing`, `MyPlans`, `Publications`), one line
   each, plus the Maestro flows to run.

## Companion skill

`firebase-to-supabase-react-query`. One concern per PR/checkpoint.
