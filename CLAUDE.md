# TrainingPlan

Expo SDK 57 RN app (Android/iOS): plans, workouts, timer playback, publications.

## Migration (new code = target)
- Server data: Firebase+Redux thunks → Supabase via React Query. Client state: Redux → Zustand (persist settings only).
- No new Redux slices/thunks or Firestore calls. An entity lives in one backend only; migrating it deletes its Firebase+Redux code in the same change.
- New files/folders kebab-case (don't rename existing PascalCase ones in passing). `type` only, no `interface`/`I` prefix.
- Skills: `firebase-to-supabase-react-query`, `redux-to-zustand-migration`.

## Layout
- Target: `app/lib/supabase` (client, generated types) → `app/api/<entity>` (fetchers, row→domain) → `app/services/<entity>` (RQ hooks, `query-keys.ts`) → UI. Zustand in `app/stores`. ESLint enforces layers.
- Legacy: Redux `app/store`, hooks `app/Hooks/redux.ts`; Firebase `app/Utils/firebase.ts`. Keep redux-persist key `root`.
- Device APIs only via `app/platform/*`; icons via `app/Common/Icon`; reuse `app/Common` wrappers.
- Navigation: `app/Routers`, `ScreenName` + param lists in `app/Utils`.
- Never edit `android/`/`ios/` (CNG) — use `app.config.ts`. Never read `.env*`.

## Rules (read the contract when touching that area)
`.claude/contracts/`: `server-state.md` (Supabase/RQ/offline), `client-state.md`, `component.md`, `styles.md`, `code-style.md`, `constants.md`, `architecture.md`; reviews: `architecture-review-checklist.md`.
- Styles: `StyleSheet` in `<name>.styles.ts`; colors from theme (light+dark); inline only runtime values.
- Constants in co-located `<name>.constants.ts`. Handlers `handle*`, props `on*`. No `any`.
- `testID` = `screen.element`, used by Maestro (`e2e/`) — don't rename.

## Tests
Every new util/component/fetcher/hook/store and bug fix gets tests in a sibling `__tests__/*.test.ts(x)`. RNTL 14 is async (`await render`). Native mocks: `__tests__/setup/`.

## Verify
`npx tsc --noEmit && npm run lint && npm test` (lint: 0 errors, warnings must not grow).
