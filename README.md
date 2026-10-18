# TrainingPlan

Mobile app (Android + iOS) for building training plans and workouts, playing them with a fitness timer (audio/TTS cues, background playback), tracking progress, and sharing/publishing plans. Light and dark themes.

**Stack:** Expo SDK 57 · React Native 0.86 (New Architecture) · React 19.2 · TypeScript · React Navigation 7 · Jest + RNTL · Maestro.
**Migration in progress** — every area has a *legacy* and a *target* pattern. New code always uses the target.

| Concern | Legacy (don't extend) | Target (use for new code) |
|---|---|---|
| Server data | Firebase + Redux thunks (`app/store`, `app/utils/firebase.ts`) | Supabase + React Query (`app/lib/supabase` → `app/api` → `app/services`) |
| Client state | Redux Toolkit + redux-persist (`app/store`, `app/hooks/redux.ts`) | Zustand (`app/stores`), persist settings only |

An entity lives in one backend only; migrating it deletes its Firebase + Redux code in the same change. Expo migration history: git tag `archive/expo-migration-docs`.

## Quick start

```sh
nvm use                      # Node 24 (.nvmrc)
npm ci
cp .env.example .env         # fill in values; EXPO_PUBLIC_* is bundled into the app = public
npx expo run:android         # or run:ios — dev client build, Expo Go is not supported
```

EAS profiles (`eas.json`): `development`, `development-simulator`, `preview`, `production`. Details: [docs/build.md](docs/build.md).
`android/` and `ios/` are generated (CNG) — never edit them; native config goes in `app.config.ts`.

**Decisions:** background workout = timestamp timer + `expo-notifications` cues (no in-app audio while locked); React Navigation 7, no Expo Router yet; `admin/` is outside root lint, hooks and CI.

## Commands

| Command | Purpose |
|---|---|
| `npm start` | Metro / dev server |
| `npm run android` / `npm run ios` | Build and run the dev client |
| `npx tsc --noEmit` | Type check — **gate** |
| `npm run lint` | ESLint, incl. layer rules — **gate** (0 errors, warnings must not grow) |
| `npm test` | Jest — **gate** |
| `npm run format` / `format:check` | Prettier |
| `npm run e2e:android` / `e2e:ios` | Maestro flows in `e2e/` (needs `E2E_EMAIL`, `E2E_PASSWORD`) |
| `npm run prebuild` | Regenerate native projects |
| `npm run doctor` | expo-doctor |

CI (`.github/workflows/ci.yml`) runs tsc, lint, jest, prettier, expo-doctor and an Android/iOS bundle export on PRs to `main`.

## Project map

```
app/
  app.tsx           entry
  screens/          one folder per screen; components/ feature components; common/ shared wrappers (reuse first)
  common/icon       the only way to render icons
  routers/          React Navigation stacks/tabs
  utils/            ScreenName/TabName (constants.ts), route param lists (types.ts); firebase.ts = legacy
  theme/            colors (light + dark), theme, icons, insets
  platform/         the only place that touches device APIs (audio, speech, keep-awake, background, Google auth, media)
  hooks/            hooks; redux.ts = legacy typed Redux hooks
  store/            LEGACY Redux slices + Firestore sync (redux-persist key `root`, keep it)
  lib/supabase      TARGET Supabase client + generated types
  api/<entity>      TARGET fetchers + row→domain mappers
  services/<entity> TARGET React Query hooks + query-keys.ts
  stores/<name>     TARGET Zustand stores
__tests__/          Jest setup and app-level tests (unit tests sit next to code in __tests__/)
e2e/                Maestro flows — rely on testID = `screen.element`
admin/              separate web admin (MUI, own package.json) — not covered by root lint, hooks or CI
docs/               build (EAS, signing, Firebase), testing, release checklist
.claude/            agent rules: contracts/, skills/, commands/, hooks/
```

Data flow (enforced by ESLint): `lib/supabase` → `api/<entity>` → `services/<entity>` → UI. Supabase only in `lib`/`api`; `api` only imported by `services`; services never import `stores`.

## I need to… → do this

Rules live in [`.claude/contracts/`](.claude/contracts) — read the one for the area you touch. Skills in `.claude/skills/` are step-by-step workflows any agent can follow.

| Task | Where / how | Read |
|---|---|---|
| New or changed component/screen | `app/screens`, `app/components`; reuse `app/common` | skill `components`; `component.md`, `styles.md`, `constants.md` |
| New server query/mutation | `app/api/<entity>` + `app/services/<entity>` | skill `services`; `server-state.md` |
| Move an entity off Firebase | delete its Firebase + Redux code in the same change | skill `firebase-to-supabase-react-query` |
| Client/UI state | Zustand in `app/stores` | skill `redux-to-zustand-migration`; `client-state.md` |
| Device API (audio, speech, notifications…) | use or extend `app/platform/*` (e.g. `audio.ts`, `speech.ts`) | `architecture.md` |
| New route | `app/routers` + `ScreenName` and param list in `app/utils` | `architecture.md` |
| Native config / permissions | `app.config.ts` (config plugins) | — |
| Review a change | — | `architecture-review-checklist.md` |

## Hard rules

- No new Redux slices/thunks or Firestore calls.
- `type` only — no `interface`, no `I` prefix. No `any`.
- Styles: `StyleSheet` in `<name>.styles.ts`, colors from theme (light + dark); inline only runtime values. Constants in `<name>.constants.ts`.
- Handlers `handle*`, callback props `on*`.
- Never rename a `testID` (Maestro depends on it).
- Never read `.env*` files; never commit secrets. Supabase anon key is public (RLS); the service-role key never goes in the app.

Full style: [`code-style.md`](.claude/contracts/code-style.md).

## Git workflow

**Branch:** `#<trello-card-id>-<2-4 kebab-case words>`, e.g. `#12-readme-for-llms`.
Pattern `^#[0-9]+-[a-z0-9]+(-[a-z0-9]+){1,3}$`; `main`, `dev` and legacy `migration/*` are exempt. `git push` warns on a non-matching name.

> **Always quote the branch name.** In bash/zsh an unquoted `#` starts a comment, so `git checkout -b #12-x` fails.
> Use `git checkout -b '#12-readme-for-llms'`. In URLs `#` is `%23`.

**Commits:** `type(scope): summary` (feat, fix, refactor, test, chore, docs), imperative, ≤ 72 chars; body only for the why.
**Before committing:** tsc + lint + tests must pass. Husky's pre-commit re-checks staged files (type check, lint, prettier, related tests); never use `--no-verify`. Claude runs `/pre-commit` first (enforced by a hook).
**PRs:** target `main`.

## Testing

- Unit: Jest (`jest-expo`) + React Native Testing Library 14 (async APIs). Tests next to the code in `__tests__/`.
- E2E: Maestro flows in `e2e/` select elements by `testID`.
- Setup, mocks, Maestro, manual plan: [docs/testing.md](docs/testing.md). Before a release: [docs/release-checklist.md](docs/release-checklist.md).

## Links

- [App screenshots](https://drive.google.com/drive/u/1/folders/19hX1v5bRVtOqRFlrf1AHczV5qpTY1oh5)
