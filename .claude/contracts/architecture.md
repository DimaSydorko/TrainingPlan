## Architecture Contract

Before you add code, understand what already exists, where it belongs, and how far a change ripples.

**Organizing idea — blast radius.** Every edit to a _shared surface_ ripples to every importer. The shared surfaces
are: `app/common/**`, `app/components/**`, `app/theme/**`, `app/hooks/**`, `app/utils/**`, `app/platform/**`,
`app/lib/**`, `app/api/**`, `app/services/**`, `app/stores/**`, legacy `app/store/**`, `app/routers/**` (plus
`ScreenName` and the param lists), `app.config.ts`, and the Jest setup in `app/__tests__/setup/**`. A change there is
never "just one file".

Lower-level rules live in their own contracts and are not repeated here:

| Concern                                                    | Contract                           |
| ---------------------------------------------------------- | ---------------------------------- |
| Formatting, naming, types, `common/` vs `components/`      | `code-style.md`                    |
| `StyleSheet`, theme colors, dynamic styles                 | `styles.md`                        |
| Component placement, tiers, **reuse-before-create**        | `component.md`                     |
| Co-located constants                                       | `constants.md`                     |
| Supabase + React Query layering, offline, request hygiene  | `server-state.md`                  |
| Zustand stores, persistence, reset on logout               | `client-state.md`                  |
| How a reviewer verifies all of this + blast-radius steps   | `architecture-review-checklist.md` |

---

### Before you write code — preflight

Run this checklist _before_ the first line, every time:

-   [ ] **Search before create.** `rg -i "<concept>" app/common app/components app/hooks app/utils app/theme app/platform app/services app/stores`.
        If an existing unit renders the same primary element and ≤1 new optional prop covers your case, **extend
        it**; create a new one only when you'd add ≥2 behavioral props or branch its JSX. (A _behavioral prop_
        changes what renders or how it behaves, not just text/style. Detail: `component.md` → Reuse Before Create.)
-   [ ] **Reuse the wrapper.** If `app/common` has a wrapper (`Icon`, `AppModal`, `ConfirmButton`, `MyTextInput`,
        `MySwitch`, `Toast`, `DraggableList`, `AppImage`, …), never import the underlying library primitive.
-   [ ] **Respect the layers.** Supabase calls live in `app/api/<entity>/`; React Query hooks live in
        `app/services/<entity>/` and wrap those fetchers; screens and components consume the hooks and never import
        `app/api`, `app/lib/supabase` or `@supabase/supabase-js`. Device APIs go through `app/platform/`. The layer
        rules are ESLint-enforced (`no-restricted-imports` overrides in `eslint.config.js`).
-   [ ] **Respect the migration.** No new Redux slices/thunks, no new Firestore calls (see CLAUDE.md → Current
        stack vs target stack).
-   [ ] **Classify the blast radius.** Is the edit _additive_ (safe) or _modifying_ a shared surface (ripples to N
        callers)? If modifying, list the callers first — review checklist Part A.
-   [ ] **Route cross-cutting calls through their one home** (table below).

---

### DRY — one piece of knowledge, one home

-   A literal (table name, storage key, threshold, label, sound file, timing value) appearing in **≥2 files** moves
    to one `*.constants.ts` / `app/utils/constants.ts` home.
-   Never inline a Supabase query or a string-array query key in a component — import the hook; hooks use the
    entity key factory (`server-state.md`).
-   Apply the **rule of three** and deduplicate only knowledge that _must change together_. Coincidental
    duplication stays duplicated — a wrong abstraction (a shared component growing one boolean per caller) widens
    blast radius worse than copy-paste. Tests are DRY-exempt (DAMP).

---

### Single Responsibility (SRP) — one reason to change

-   A component is **presentational OR container** — never both. A presentational component does not call
    hooks from `app/services`, read a store, or `dispatch`; it gets props.
-   Data fetching/mutation lives in a hook; **one hook owns one domain**.
-   Soft caps: a `.tsx` component > **200 lines** or a hook > **150 lines** is a decompose signal, not a target.
    (Legacy offenders: `WorkoutsScreen.tsx`, `PlayingScreen.tsx` — split them when you touch them substantially.)
-   "and" in a file/commit name usually means two responsibilities.

---

### Separation of Concerns + cross-cutting

Each cross-cutting concern has exactly **one home**. Calling it inline in a leaf, or duplicating it, is _scattering_.

| Concern                                  | One home                                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| Supabase client + auth session           | `app/lib/supabase/client.ts` (created once)                                                |
| React Query client, persister, managers  | `app/lib/query-client.ts` (`onlineManager` ← NetInfo, `focusManager` ← AppState)           |
| Network status in UI                     | one source (today `settingsReducer.internet`; target: a hook over `onlineManager`) — no ad-hoc `NetInfo.fetch()` in screens |
| Device APIs (audio, speech, keep-awake, notifications, Google sign-in) | `app/platform/*`                                             |
| Theme colors / typography                | `app/theme/*` + the settings hook                                                          |
| Icons                                    | `app/common/icon` + `app/theme/icons.ts`                                                   |
| Error / status toasts                    | `NotificationHandler` + `common/toast` (today fed by Redux `error` fields; target: React Query `QueryCache`/`MutationCache` `onError` → a toast store) — no per-screen toast implementations |
| Auth ("who is signed in?")               | one session seam (today `useUser()`; target: a session hook over Supabase Auth)            |
| Navigation names and params              | `ScreenName` + param lists in `app/utils/types.ts` — no string screen names                |
| Native configuration                     | `app.config.ts` / config plugins — never `android/` or `ios/`                              |

---

### Primitive Obsession — model the domain, not strings

-   A finite set of options is a **typed union / `as const` object**, never bare magic literals (give `switch` a
    `never` default).
-   Mutually-exclusive booleans collapse into **one discriminated union** (e.g. playback `status: 'idle' | 'playing'
    | 'paused' | 'finished'` instead of `isPlaying` + `isPaused` + `isFinished`).
-   Domain identity (`planId`, `workoutId`, `userId`) gets a named type (`type PlanId = string`) in new code so
    signatures say what they take.
-   Durations have a unit in the name (`durationSec`, `restMs`) — never a bare `time: number`.

---

### Open/Closed (OCP) — extend, don't fork or break

Adding behavior should not edit a shared component in a way that breaks existing callers.

| Additive (blast radius = 1)          | Breaking (blast radius = N — avoid)                       |
| ------------------------------------ | --------------------------------------------------------- |
| new **optional** prop with a default | new **required** prop                                     |
| new key in a variant `Record` map    | renamed / removed prop                                    |
| widened union member                 | changed default value / rendered element / testID         |
| a `children` slot                    | inline `if/else` over `variant` inside the shared component |

-   Never fork a `common/` component (no `PrimaryConfirmButton` beside `ConfirmButton`) — extend it with a prop.
-   Never edit a shared fetcher/hook/util to satisfy one caller.
-   ≥3 behavioral boolean props already present → refactor to a `mode` union or slots before adding a 4th.
-   `testID`s are a public contract with the Maestro flows in `e2e/` — changing one is a breaking change.

---

### Anti-Corruption Layer / Bounded Context

The `app/api/<entity>/` fetcher is the **anti-corruption layer**: it owns the table/RPC name, the generated row
type, and the mapping to a clean domain type. Database shapes must not leak past it.

-   Every fetcher returns a **mapped domain type** (camelCase, app types from `app/utils/types.ts` or the entity's
    `types.ts`) — never a raw `Tables<'plans'>` row.
-   Components, screens, hooks and stores never reference snake_case columns (`owner_id`, `created_at`).
-   `app/api/<entity>/` and `app/services/<entity>/` are named after the **data domain** (`plans`, `workouts`,
    `publications`, `profiles`, `exercise-images`), never a screen (`my-plans-screen`).
-   Legacy Firestore documents follow the same rule: Firestore shapes stay inside `app/store/**` thunks.

---

### Request hygiene

Server state belongs to React Query; fetch once, fetch guarded. **Full rules are in `server-state.md`.** In short:

-   A query whose key depends on a nullable arg passes `enabled: Boolean(arg)`.
-   Never fetch the same data from sibling components with separate effects — share one query.
-   Server entities never live in Zustand (or in new Redux code).
-   Every mutation invalidates or optimistically updates (with rollback) the keys it affects.
-   Offline is a first-class state: mutations must queue and resume, not fail silently.

---

### Reuse before create

**Full rule and the wrapper map are in `component.md` → Reuse Before Create.** The hard rule: if an
`app/common` wrapper exists, never import the library equivalent directly.
