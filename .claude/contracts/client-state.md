## Client State (Zustand)

Zustand holds **client/UI state only**. If a value comes from the backend, it belongs in React Query
(`server-state.md`), not in a store.

> **Migration status.** Client state is still in Redux (`app/store/**`, read via `app/hooks/redux.ts`). New features
> use Zustand. Existing slices move with the `redux-to-zustand-migration` skill, after their server data has moved
> to React Query.

### The split rule (non-negotiable)

| Belongs in Zustand                                                        | Does NOT belong in Zustand                          |
| ------------------------------------------------------------------------- | --------------------------------------------------- |
| Settings: theme name, vibration, battery mode, TTS, sound, weight step   | Plans, workouts, publications, profile, images      |
| Selection / navigation-adjacent UI: `selectedWorkoutId`, active tab       | A copy of a fetched entity (`selectedWorkout` object) |
| Playback session state (current exercise index, status, started-at)      | Server-derived flags or counts                      |
| Form drafts, local sort order, toasts queue                               | Anything you would refetch                          |

Store **ids**, not copies of server entities: `selectedWorkoutId` + `useWorkout(id)` instead of `selectedWorkout`.
Store **names**, not derived data: `themeName: 'light' | 'dark'` and derive `colors` with a selector, instead of
persisting the whole palette.

### Where stores live

| Scope        | Location                                         | Holds                                              |
| ------------ | ------------------------------------------------ | -------------------------------------------------- |
| App-wide     | `app/stores/<name>/use-<name>-store.ts`          | settings, session UI, playback, toasts             |
| Screen-local | `app/screens/<screen-name>/stores/use-<name>-store.ts`| one screen's UI state (filters, draft, edit mode)  |

Prefer plain `useState` when the state never leaves one component.

### Store shape

```ts
import { create } from 'zustand'

type PlaybackState = {
  workoutId: WorkoutId | null
  exerciseIndex: number
  status: PlaybackStatus
  start: (workoutId: WorkoutId) => void
  next: () => void
  reset: () => void
}

const INITIAL_STATE = {
  workoutId: null,
  exerciseIndex: 0,
  status: PLAYBACK_STATUS.IDLE,
}

export const usePlaybackStore = create<PlaybackState>()(set => ({
  ...INITIAL_STATE,
  start: workoutId => set({ workoutId, exerciseIndex: 0, status: PLAYBACK_STATUS.PLAYING }),
  next: () => set(state => ({ exerciseIndex: state.exerciseIndex + 1 })),
  reset: () => set(INITIAL_STATE),
}))
```

-   `type` for state, no `I` prefix; actions live inside the store; every app-wide store has `reset()`.
-   Read with **narrow selectors**: `usePlaybackStore(s => s.status)`. Selecting several fields → `useShallow`.
    Never `usePlaybackStore()` without a selector in a component.
-   Outside React (platform callbacks, `app/lib`), use `useXStore.getState()` / `setState`.
-   High-frequency values (timer ticks) are not stored per tick; store `startedAt` / `pausedAt` timestamps and
    derive elapsed time (this matches the timestamp-based timer in `PlayingScreen/playbackSchedule.ts`).

### Persistence

-   **Default: no persistence.** Only stores whose state must survive restarts use `persist` — today that is
    **settings** (and possibly the playback session for crash-resume, if decided).
-   Use `persist(…, { name: '<store>-v1', storage: createJSONStorage(() => AsyncStorage), version, migrate,
    partialize })`. `partialize` excludes actions and transient fields. Shape changes bump `version` with a
    `migrate` — never rename the key.
-   **Legacy hand-over:** redux-persist stores everything under AsyncStorage key `persist:root` (each slice is a
    JSON string inside). The settings store reads the old `settingsReducer` once on first launch when its own key is
    absent, maps it (palette → `themeName`), and does not delete `persist:root` until Redux is fully removed.
    Cover this with a test.
-   The React Query cache is persisted separately (`server-state.md`); never persist server data through Zustand.

### Reset on logout

Logout calls `reset()` on every app-wide store that holds user-specific state and clears the React Query cache:

```ts
usePlaybackStore.getState().reset()
useWorkoutsUiStore.getState().reset()
queryClient.clear()
```

Settings that are device preferences (theme, sound) may survive logout — decide per field and document it in the
store file.

### Testing

Each store gets a test for every action and `reset()`; reset state in `beforeEach` with
`useXStore.setState(INITIAL_STATE)`. Persisted stores get a test for `migrate` and the legacy hand-over.
