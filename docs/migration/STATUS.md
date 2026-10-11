# Migration status

Updated: 2026-10-11 by A0. A8 owns this file from Phase 1 on.

**Phase 0 is done. Phase 1 is unblocked.** Branch from `migration/expo` (README §4).

| Agent | State | Branch | Notes |
|---|---|---|---|
| A0 Foundation | Done | `migration/expo` | Expo SDK 57 scaffold, seams stubbed, compat Firebase. Not booted on a device (no Android SDK/Xcode in the container). See [handoff/A0.md](handoff/A0.md) |
| A1 Data and Firebase | Ready to start | `migration/a1-data` | Converts `firebase/compat/*` to the modular API with AsyncStorage persistence. RTK 2 `extraReducers` already converted to builder form by A0 |
| A2 Auth, native config and EAS | Ready to start | `migration/a2-auth` | Google Sign-In package was uninstalled: re-add it and enable its plugin in `app.config.ts`. **D1 iOS bundle ID needs Dmytro's confirmation** (DECISIONS.md) |
| A3 Media and device | Ready to start | `migration/a3-media` | `expo-audio` is installed with its plugin declared. The `SoundPlayer` seam has no volume or duration (see A0 handoff) |
| A4 Playback and background | Ready to start | `migration/a4-playback` | `expo-notifications` is installed with its plugin declared. `BackgroundAction.tsx` calls the `backgroundSession` stub |
| A5 UI and navigation | Ready to start | `migration/a5-ui` | Navigation 7 is installed. 7 `@ts-expect-error TODO(A5)` markers to remove. The Icon seam is backed by deprecated `@expo/vector-icons` |
| A6 Admin web | Not in scope (D5) | n/a | |
| A7 Quality | Ready to start | `migration/a7-quality` | `jest` was removed. `npm test` is a placeholder that exits 0. `__tests__/App-test.js` still uses `react-test-renderer` |
| A8 Integrator | Waiting for Phase 1 | `migration/expo` | |

## `expo-doctor` (Phase 0 result: 19 of 21 checks pass)

| Check | Result | Who handles it |
|---|---|---|
| Expo config schema | Cannot run here: `exp.host` is blocked by egress policy. `npx expo config` resolves the config without errors | A2: re-run on a machine with network access |
| React Native Directory metadata | Cannot run here: `reactnative.directory` is blocked | A5 (and A8): re-run with network access. Expect flags for unmaintained JS libs: `react-native-scroll-picker-wheel`, `react-native-keyboard-aware-scroll-view`, `react-native-circular-progress`, `react-native-countdown-circle-timer` |
| All other 19 checks (SDK version match, peer deps, duplicates, Metro config, lock file, …) | Pass | n/a |

## Phase 0 check results

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Pass (7 `@ts-expect-error TODO(A5)`) |
| `npx expo prebuild --clean --no-install` | Pass (android/ and ios/ deleted afterwards; both are gitignored) |
| `npx expo export --platform android` | Pass (1663 modules, no resolution errors) |
| `npx expo export --platform ios` | Pass (1667 modules) |
| `npm test` | Placeholder (no runner until A7) |
| Device boot | Not tested: no Android SDK, Xcode or emulator in the container. Dmytro has to check this |
