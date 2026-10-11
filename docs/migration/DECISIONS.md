# Migration decisions

Answered by Dmytro on 2026-10-11.

| # | Decision | Answer |
|---|---|---|
| D1 | App identifiers | Keep `com.trainingplantogether_cli` for Android **and** use the same value as the iOS bundle identifier |
| D2 | Firebase | Firebase JS SDK, modular API (no React Native Firebase) |
| D3 | Background workout | Rewrite: timestamp-based timer + `expo-notifications` (drop react-native-background-actions) |
| D4 | Expo Router | Later. Stay on React Navigation 7 |
| D5 | Admin panel | Out of scope for now (A6 not run) |
| D6 | Base branch | `origin/dev` (commit e0466f5) |
| — | Expo SDK | **SDK 57** (latest stable at time of work, RN 0.86 / React 19.2). Use `expo@^57.0.17` or later (fixes Hermes v1 memory and dev startup regressions) |

## Environment notes for agents
- Work happens in a Linux cloud container: there is **no Android SDK, no Xcode, no emulator**. Verify with `npx tsc --noEmit`, `npm test`, `npx expo-doctor`, `npx expo prebuild --clean --no-install` (then delete `android/` and `ios/`), and `npx expo export --platform android` (bundles JS, catches import/resolution errors). Device testing is done by Dmytro afterwards.
- No real Firebase config is available. Use `.env.example`; do not invent values.
