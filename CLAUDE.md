# TrainingPlan

Expo SDK 57 RN app (Android/iOS): plans, workouts, timer playback, AI integraton.

## Migration (new code = target)
- Server data: Firebase+Redux thunks → Supabase via React Query. Client state: Redux → Zustand (persist settings only).
- No new Redux slices/thunks or Firestore calls. An entity lives in one backend only; migrating it deletes its Firebase+Redux code in the same change.
- Files/folders kebab-case (ESLint `check-file`). Cross-folder imports `@<folder>/…` (tsconfig `paths`); relative only inside one core folder. `type` only, no `interface`/`I` prefix.
- Skills: `firebase-to-supabase-react-query`, `redux-to-zustand-migration`.

## Layout
- Target: `app/lib/supabase` (client, generated types) → `app/api/<entity>` (fetchers, row→domain) → `app/services/<entity>` (RQ hooks, `query-keys.ts`) → UI. Zustand in `app/stores`. ESLint enforces layers.
- Legacy: Redux `app/store`, hooks `app/hooks/redux.ts`; Firebase `app/utils/firebase.ts`. Keep redux-persist key `root`.
- Device APIs only via `app/platform/*`; icons via `app/common/icon`; reuse `app/common` wrappers.
- Navigation: `app/routers`, `ScreenName` + param lists in `app/utils`.
- Never edit `android/`/`ios/` (CNG) — use `app.config.ts`. Never read `.env*`.

## Rules (read the contract when touching that area)
`.claude/contracts/`: `server-state.md` (Supabase/RQ/offline), `client-state.md`, `component.md`, `styles.md`, `code-style.md`, `constants.md`, `architecture.md`; reviews: `architecture-review-checklist.md`.
- Styles: `StyleSheet` in `<name>.styles.ts`; colors from theme (light+dark); inline only runtime values.
- Constants in co-located `<name>.constants.ts`. Handlers `handle*`, props `on*`. No `any`.
- `testID` = `screen.element`, used by Maestro (`e2e/`) — don't rename.

## Verify
Branch `'#<trello-id>-<2-4-kebab-words>'` (quote it: `#` starts a shell comment). PRs → `main`.
Before every `git commit` run `/pre-commit` (review → tests → checks); a hook blocks commits without a fresh pass. Never write `.claude/.pre-commit-ok` yourself. Husky re-checks staged files.
`npx tsc --noEmit && npm run lint && npm test` (lint: 0 errors, warnings must not grow).
