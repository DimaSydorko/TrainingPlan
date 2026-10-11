# Migration decisions

Answered by Dmytro on 2026-10-11.

| # | Decision | Answer |
|---|---|---|
| D1 | App identifiers | Keep `com.trainingplantogether_cli` for Android **and** use the same value as the iOS bundle identifier |
| D2 | Firebase | Firebase JS SDK, modular API (no React Native Firebase) |
| D3 | Background workout | Rewrite: timestamp-based timer + `expo-notifications` (drop react-native-background-actions) |
| D4 | Expo Router | Later. Stay on React Navigation 7 |
| D5 | Admin panel | Out of scope for now (A6 not run) |
| D6 | Base branch | `main` (commit ee75ad7). Correction: the original plan wrongly said dev was ahead; `dev` is an old ancestor of `main` |
| — | Expo SDK | **SDK 57** (latest stable at time of work, RN 0.86 / React 19.2). Use `expo@^57.0.17` or later (fixes Hermes v1 memory and dev startup regressions) |

## Open questions for Dmytro
- **D1 (iOS bundle ID):** Apple bundle identifiers may only contain letters, digits, `-` and `.`, so `com.trainingplantogether_cli` is invalid on iOS and `expo prebuild` rejects it. A0 set `ios.bundleIdentifier` to `com.trainingplantogether-cli` as the nearest valid value. Please confirm or choose another; the Android package stays `com.trainingplantogether_cli`.

## Environment notes for agents
- Work happens in a Linux cloud container: there is **no Android SDK, no Xcode, no emulator**. Verify with `npx tsc --noEmit`, `npm test`, `npx expo-doctor`, `npx expo prebuild --clean --no-install` (then delete `android/` and `ios/`), and `npx expo export --platform android` (bundles JS, catches import/resolution errors). Device testing is done by Dmytro afterwards.
- No real Firebase config is available. Use `.env.example`; do not invent values.
- `api.expo.dev`, `exp.host` and `reactnative.directory` are blocked by the container's egress policy. Run `expo install` / `expo prebuild` / `expo export` with `EXPO_OFFLINE=1` (versions then come from `expo/bundledNativeModules.json`). Two `expo-doctor` checks (config schema, React Native Directory) cannot run here and fail with network errors.
