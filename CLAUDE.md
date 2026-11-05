# TrainingPlan

Expo SDK 57 RN app (Android/iOS): plans, workouts, timer playback, AI integraton.

## Architecture
- Server data: Supabase via React Query. Client state: Zustand (persist settings only). Redux and Firebase are gone — don't re-add.
- Files/folders kebab-case (ESLint `check-file`). Cross-folder imports `@<folder>/…` (tsconfig `paths`); relative only inside one core folder. `type` only, no `interface`/`I` prefix.

## Layout
- `app/lib/supabase` (client, generated types) → `app/api/<entity>` (fetchers, row→domain) → `app/services/<entity>` (RQ hooks, `query-keys.ts`) → UI. Zustand in `app/stores`. ESLint enforces layers.
- AsyncStorage `persist:root` = old Redux data, read-only (settings hand-over, `app/api/legacy-import`). Never write it.
- Device APIs only via `app/platform/*`; icons via `app/common/icon`; reuse `app/common` wrappers.
- Navigation: `app/routers`, `ScreenName` + param lists in `app/utils`.
- Never edit `android/`/`ios/` (CNG) — use `app.config.ts`. Never read `.env*`.

## Rules (read the contract when touching that area)
`.claude/contracts/`: `server-state.md` (Supabase/RQ/offline), `client-state.md`, `component.md`, `styles.md`, `code-style.md`, `constants.md`, `architecture.md`; reviews: `architecture-review-checklist.md`.
- Styles: `StyleSheet` in `<name>.styles.ts`; colors from theme (light+dark); inline only runtime values.
- Arrow functions only, no `function`. Constants in the file using them; `<name>.constants.ts` only when shared. Handlers `handle*`, props `on*`. No `any`. No code comments — self-explanatory names instead.
- `testID` = `screen.element`, used by Maestro (`e2e/`) — don't rename.

## Verify
Branch `'#<trello-id>-<2-4-kebab-words>'` (quote it: `#` starts a shell comment). PRs → `main`.
Before every `git commit` run `/pre-commit` (review → tests → checks); a hook blocks commits without a fresh pass. Never write `.claude/.pre-commit-ok` yourself. Husky re-checks staged files.
`npx tsc --noEmit && npm run lint && npm test` (lint: 0 errors, warnings must not grow).
