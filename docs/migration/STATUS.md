# Migration status

Updated: 2026-10-12 by A8.

**Phase 2 (merge) is done.** All six Phase 1 branches are merged into `migration/expo`, the cross-agent follow-ups are in, and the branch passes every check that can run in the container. **Phase 3 (device QA, EAS builds, release) is next and needs Dmytro:** start with [DEVICE-TEST.md](DEVICE-TEST.md).

| Agent | State | Branch | Notes |
|---|---|---|---|
| A0 Foundation | Done | `migration/expo` | [handoff/A0.md](handoff/A0.md) |
| A7 Quality | Merged (1st) | `migration/a7-quality` | jest-expo, ESLint flat config, Maestro flows, CI. [handoff/A7.md](handoff/A7.md) |
| A5 UI and navigation | Merged (2nd) | `migration/a5-ui` | Navigation 7, new icons, edge-to-edge, keyboard-controller, DraggableList seam. Fix after merge: Jest mocks for keyboard-controller and safe-area-context. [handoff/A5.md](handoff/A5.md) |
| A3 Media and device | Merged (3rd) | `migration/a3-media` | expo-audio / expo-speech / expo-keep-awake. No conflicts. [handoff/A3.md](handoff/A3.md) |
| A1 Data and Firebase | Merged (4th) | `migration/a1-data` | Modular Firebase, AsyncStorage persistence, store tests. No conflicts. [handoff/A1.md](handoff/A1.md) |
| A2 Auth, native config and EAS | Merged (5th) | `migration/a2-auth` | google-signin 16, variants, EAS profiles. Conflicts in `package.json` / `app.config.ts` resolved by keeping all sides. [handoff/A2.md](handoff/A2.md), [BUILD.md](BUILD.md) |
| A4 Playback and background | Merged (6th) | `migration/a4-playback` | Timestamp player, expo-notifications cues. `usePlaying.tsx` / `PlayingScreen.tsx` took A4's side. [handoff/A4.md](handoff/A4.md) |
| A6 Admin web | Not in scope (D5) | n/a | |
| A8 Integrator | Phase 2 done; Phase 3 waits for device tests | `migration/expo` | [handoff/A8.md](handoff/A8.md) |

## Checks after each merge

| After merging | tsc | npm test | expo export (android) |
|---|---|---|---|
| A7 | pass | 4 suites / 12 tests | 1663 modules |
| A5 | pass | failed (smoke test: unlinked keyboard-controller, empty SafeAreaProvider) → fixed in `2ae9c41` → 8 / 56 | 1710 modules |
| A3 | pass | 9 / 71 | 1732 modules |
| A1 | pass | 18 / 140 | 1727 modules |
| A2 | pass | 19 / 154 | 1739 modules |
| A4 | pass | 20 / 171 | 1801 modules |

## Final gate (2026-10-12, after `chore: format`)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Pass (test files are type-checked too; no `@ts-nocheck` left) |
| `npm test` | Pass: **21 suites, 175 tests** |
| `npx expo lint` | **0 errors, 86 warnings** (76 `exhaustive-deps`, 10 React Compiler rules) |
| `npm run format:check` | Pass (now blocking in CI) |
| `EXPO_OFFLINE=1 npx expo-doctor` | 19/21. The 2 failures are the network-blocked checks (Expo config schema at exp.host, React Native Directory) |
| `EXPO_OFFLINE=1 npx expo prebuild --clean --no-install` | Pass. Android: INTERNET, MODIFY_AUDIO_SETTINGS, POST_NOTIFICATIONS, VIBRATE (+ 4 blocked); 8 cue sounds in `res/raw`; no FOREGROUND_SERVICE. iOS: `UIAppFonts` has the icon font, no `UIBackgroundModes`. `android/` and `ios/` deleted afterwards |
| `EXPO_OFFLINE=1 npx expo export --platform android` | Pass, 1801 modules |
| `EXPO_OFFLINE=1 npx expo export --platform ios` | Pass, 1804 modules |
| `grep -rn "TODO(A\|\[stub\]" app` | Nothing |
| Removed libraries in `package.json` | None left: react-native-sound, -tts, -keep-awake, -background-actions, react-native-vector-icons, @expo/vector-icons, react-native-web, redux-typescript. No `firebase/compat` imports in `app/` (ESLint bans them) |
| Device boot, EAS builds, Maestro | **Not run** (no Android SDK, Xcode, emulator or EAS login here). See [DEVICE-TEST.md](DEVICE-TEST.md) |

## README §8 (definition of done)

| Item | State |
|---|---|
| EAS `preview` builds for Android and iOS from a clean clone | Open: needs `eas init`, env vars and credentials (DEVICE-TEST.md §1) |
| No `android/` / `ios/` in git; `prebuild --clean` reproduces them | Done |
| Removed libraries gone from `package.json` | Done |
| `expo-doctor` reports no issues | 19/21 here; re-run the 2 network checks on a machine with internet |
| Every `TESTING.md` flow passes on Android and iOS | Open: device test |
| Data saved before the migration still loads | Covered by `persist.test.ts` and `__tests__/store.test.ts`; the real upgrade-in-place test is open (DEVICE-TEST.md, P0) |
| `ReadMe.md` explains the new stack | Open (Phase 3, after the device test confirms the commands) |

## Open items carried into Phase 3

- Every acceptance criterion that needs a device (DEVICE-TEST.md §2).
- The questions for Dmytro (DEVICE-TEST.md §3), including D1.
- Re-run `npx expo-doctor` with network access (config schema, React Native Directory; draggable-flatlist and countdown-circle-timer may be flagged).
- No Android notification small icon yet (needs a monochrome PNG).
