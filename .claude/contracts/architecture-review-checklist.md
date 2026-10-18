## Architecture Review Checklist

> Single source of truth for architecture review. Rationale lives in the owning contract — `architecture.md`
> (principles), `server-state.md` (Supabase + React Query), `client-state.md` (Zustand). Cite them, don't re-describe.
> Severity tags: 🔴 CRITICAL / 🟠 MAJOR / 🟡 MINOR / 🔵 SUGGESTION.

---

### Part A — Blast-Radius / Change-Impact Procedure (run FIRST)

> **Diff range.** Commands use `$BASE...$HEAD`. Branch review → `BASE=main`, `HEAD=<branch>`. Uncommitted review →
> replace `$BASE...$HEAD` with `HEAD`.

#### Step 1 — List changed files

```bash
git diff --name-only $BASE...$HEAD
git diff --name-only HEAD          # uncommitted
```

#### Step 2 — Tag each changed file as SHARED SURFACE or screen-local

| Shared surface             | Path glob                                                    | Why it is high-radius                                       |
| -------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- |
| Generic UI                 | `app/common/**`                                              | used by most screens; `testID`s used by Maestro             |
| Business components        | `app/components/**`                                          | shared across plan/workout/publication flows                |
| Theme                      | `app/theme/**`                                               | every rendered pixel, both themes                           |
| Hooks / providers          | `app/hooks/**`                                               | `redux.ts`, `AppHelperProvider`, `usePlaying` are app-wide  |
| Utils, constants, types    | `app/utils/**`                                               | `ScreenName`, param lists, shared types                     |
| Device seams               | `app/platform/**`                                            | audio/speech/notifications/Google sign-in for the whole app |
| Supabase / RQ client       | `app/lib/**`                                                 | 100% of server traffic, offline behavior, auth session      |
| Fetchers                   | `app/api/**`                                                 | a mapping change ripples to every hook above it             |
| React Query hooks / keys   | `app/services/**`                                            | key or option change ripples to every consumer              |
| Stores                     | `app/stores/**`, legacy `app/store/**`                       | global state; persisted shapes affect existing installs     |
| Navigation                 | `app/routers/**`                                             | every screen transition and deep link                       |
| Native config              | `app.config.ts`, `eas.json`, `package.json` deps             | needs a new build; can break store builds                   |
| Database                   | `supabase/migrations/**`                                     | RLS and schema for all users; irreversible once applied     |
| Test setup                 | `__tests__/setup/**`                                         | every test file                                             |

Everything else (one screen's own files, a screen-local hook/store) is **screen-local**.

#### Step 3 — Compute the importer/consumer set for each shared file

```bash
rg -l "from '.*/<dir>/<FileStem>'" app      # e.g. rg -l "from '.*/ConfirmButton/ConfirmButton'" app
rg -l "<ExportName>" app                    # barrel imports via app/common/index.ts
rg -l "use<Entity>|<entity>Keys\." app      # React Query entity
rg -l "use<Name>Store" app                  # Zustand store
rg -l "state\.<slice>Reducer|use<Slice>\(" app   # legacy Redux slice
```

Attach the importer list (or its count + the screens it spans) to the review note.

#### Step 4 — Classify diff radius

| Radius     | Definition                                                                                 | Reviewer action                                                            |
| ---------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| **local**  | only screen-local files changed                                                            | normal per-principle review                                                |
| **module** | shared file changed, importers within one router tree                                      | review + name the tree                                                     |
| **shared** | shared file changed, importers span ≥2 router trees                                        | list consumers; verify additive (OCP); a test per affected path            |
| **global** | `app/lib`, `app.tsx`, a persisted store shape, `theme/colors.ts`, `app.config.ts`, a migration with RLS, or a top-fan-in `Common` component | require explicit additive-only justification; block on missing regression test |

#### Step 5 — Boundary integrity

-   Imports reaching into another screen's internals: `rg "from '.*screens/<Other>/components" app`.
-   Layer violations — read lint output, don't trust the exit code: `npm run lint 2>&1 | rg "no-restricted-imports"`.
-   Native packages imported outside `app/platform` / `app/common/icon`.

#### Step 6 — Server-state propagation

For every changed `useMutation` / `query-keys.ts`, check the `// Invalidations:` map and confirm a mutation that
changes data shown on another screen invalidates that screen's keys. For offline-capable mutations confirm
`mutationKey` + `setMutationDefaults` registration.

#### Step 7 — Runtime check for shared/global radius

Run a development build: exercise the affected screens online **and in airplane mode**, then reconnect and confirm
queued changes sync once. For theme/style changes check light and dark. For store shape changes, install the
previous build, use it, upgrade, and confirm data survives. Run the relevant Maestro flow.

#### Step 8 — Verdict line

`Radius: GLOBAL — app/lib/query-client.ts changed, affects all server traffic and offline sync; additive-only? <yes/no>`

---

### Part B — Per-Principle Checklist

#### DRY / Reuse-before-create — `architecture.md` → DRY, `component.md`

-   🔴 Direct import of a library primitive where a `Common`/`platform` wrapper exists (`Modal`, `Switch`,
    vector icons, `expo-audio`, `expo-speech`, …) outside the wrapper.
-   🟠 Literal (table name, storage key, timing, label) repeated in ≥2 files with no constants home.
-   🟠 New component near-duplicating an existing one.
-   🟡 Hand-written type mirroring an existing one instead of `Pick`/`Omit`/derivation.
-   🔵 Don't dedupe coincidental duplication. Tests are DRY-exempt.

#### SRP — `architecture.md` → SRP

-   🔴 Presentational component that calls `app/services` hooks, reads a store, or dispatches.
-   🔴 Supabase/Firestore call inside a component, screen, store or Zustand action.
-   🟠 God hook/screen: many `useState`/`useEffect` mixing transport, validation and derivation; `.tsx` > 200 lines,
    hook > 150 lines.
-   🔵 "and" in the file/commit name.

#### Separation of Concerns — `architecture.md` → cross-cutting table

-   🔴 `createClient` or a second `QueryClient` outside `app/lib`.
-   🟠 `NetInfo.fetch()` / `AppState` listeners for online/focus logic in screens instead of the managers.
-   🟠 Per-screen error toast implementation instead of the shared toast flow.
-   🟠 String screen names instead of `ScreenName`.
-   🟡 Hardcoded color or font size in a component (`rg "#[0-9a-fA-F]{3,8}'" app --glob '!app/theme/**'`).

#### Primitive Obsession — `architecture.md`

-   🟠 Finite options as bare strings compared inline; mutually exclusive booleans instead of a union.
-   🟠 Durations without unit in the name.
-   🟡 New `enum` where an `as const` object + union fits.

#### OCP — `architecture.md`

-   🔴 Fork of a `common/` component.
-   🟠 New required prop / changed default / renamed `testID` on a shared component.
-   🟠 Added `variant` branch inside a shared component instead of a `Record` map.
-   🟡 ≥3 behavioral booleans and a 4th added.

#### Anti-Corruption Layer — `architecture.md`, `server-state.md`

-   🔴 `@supabase/supabase-js` or `app/lib/supabase` imported outside `app/lib/supabase/**` and `app/api/**`.
-   🔴 `app/api/**` imported outside `app/services/**`.
-   🔴 Fetcher returning a raw row type, or snake_case columns referenced outside `app/api`
    (`git diff $BASE...$HEAD -- app | rg '^\+' | rg "\.[a-z]+_[a-z_]+"` — confirm each hit).
-   🔴 Fetcher that returns `null`/`[]` on `error` instead of throwing.
-   🟠 `@ts-ignore` / `as any` / `: any` in `app/api` or `app/services`.
-   🟠 `app/api` / `app/services` folder named after a screen.
-   🟡 Inline query key array (`rg "queryKey: \[" app`).

#### Database — `server-state.md` → Database rules

-   🔴 New table without RLS enabled and explicit policies.
-   🔴 Service-role key or secret in app code or `EXPO_PUBLIC_*`.
-   🟠 Schema change without a migration file, or `database.types.ts` not regenerated.
-   🟠 Server-generated ids for data that can be created offline.

#### Request hygiene and offline — `server-state.md`

-   🔴 Fetched entity stored in Zustand or new Redux code.
-   🔴 `useMutation` without invalidation or optimistic update + settle invalidation.
-   🔴 Offline-capable mutation without `mutationKey` / `setMutationDefaults` (lost on restart).
-   🟠 Optimistic update missing a step (cancel, snapshot, set, rollback, settle).
-   🟠 Nullable query input without `enabled`.
-   🟠 `useEffect` + `useState` fetching in new code; unstable deps or key parts.
-   🟡 `staleTime` copied from a sibling without an entry in the invalidation map.

#### Client state — `client-state.md`

-   🔴 Persisted store without `version`, or a renamed persist key.
-   🟠 Store read without a selector in a component; copy of a server entity in a store.
-   🟠 App-wide store with user data missing `reset()` or not reset on logout.
-   🟡 Per-tick timer values written to a store.

#### Migration hygiene — CLAUDE.md → Current stack vs target

-   🔴 New Firestore call or new Redux slice/thunk.
-   🔴 Entity read or written through both Firebase and Supabase.
-   🟠 Existing folder renamed in the same commit as a behavior change.
-   🟠 New `interface` / `I` prefix / non-kebab-case file/folder.

---

### Verdict

End every review with the **blast-radius verdict line** (Part A Step 8), the severity-tagged findings, and
**Approve / Request Changes / Needs Discussion**.
