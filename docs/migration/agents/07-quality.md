# A7: Quality (tests, lint, E2E)

## Mission
Set up the safety net: unit-test infrastructure, linting, stricter TypeScript, and a manual and automated test plan that A8 uses to sign off the migration.

## Branch
`migration/a7-quality` (worktree `../tp-a7-quality`)

## Owns
`__tests__/**`, `e2e/**`, `jest.config.js`, `eslint.config.js`, `.prettierrc.js`, `docs/migration/TESTING.md`

## Rule
In Phase 1, **don't reformat or autofix files in `app/`**. Only add config and tests. A8 runs the repo-wide fix pass at the end.

## Tasks
1. **Jest**: install `jest-expo` and `@testing-library/react-native`, add `jest.config.js` with `preset: 'jest-expo'`, and add mocks for AsyncStorage, expo-audio, expo-speech, expo-notifications, Firebase, and Google Sign-In in `__tests__/setup/`. Replace the placeholder `App-test.js` with a smoke test that renders `App` with a mock store.
2. **ESLint**: install `eslint-config-expo` (flat config) + Prettier integration and keep the existing `.prettierrc.js` style. Add rules for `react-hooks/exhaustive-deps` (warn) and `no-restricted-imports` banning the removed libraries (`react-native-sound`, `react-native-tts`, `react-native-keep-awake`, `react-native-background-actions`, `react-native-vector-icons`, `firebase/compat/*` once A1 has merged) so nobody brings them back.
3. **TypeScript plan**: document a path to `strict: true` in `TESTING.md` (which flags to turn on in what order) and turn on the ones that don't need code changes now. A8 or a later task does the rest.
4. **`TESTING.md`**: a manual test plan, one checklist per area: auth, plans, workouts (CRUD, reorder, copy), publications (browse, publish, copy, paginate), playing (foreground, locked screen, interruptions such as calls and music, battery-saver mode), settings (theme, sound, TTS, vibration), offline (NetInfo / NoSignal state), and upgrade-in-place from the old build.
5. **Maestro E2E** (`e2e/*.yaml`): flows for login with email, creating a workout with 2 exercises, playing it for 30 seconds, and switching the theme. Use stable `testID`s. List the IDs you need in your handoff so A5 and A4 can add them (only add them yourself with minimal edits if those agents have already merged).
6. **CI (optional)**: a GitHub Actions workflow that runs `tsc`, lint, tests, and `expo-doctor` on PRs to `migration/expo`.

## Acceptance criteria
- [ ] `npm test` runs green with the smoke test and mocks in place.
- [ ] `npx expo lint` runs, with the warning count recorded as a baseline in your handoff.
- [ ] `TESTING.md` is complete enough that someone new could run the full manual pass.
- [ ] Maestro flows run locally against a dev build after Phase 2.

## Handoff
Fill in `handoff/A7.md`: the warning baseline, the `testID`s needed, and the TS strictness roadmap.
