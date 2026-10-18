# A0 — Foundation (Phase 0, runs alone)

## Mission
Turn the repo into an Expo SDK 57 project that **boots to the login screen and navigates all tabs**, with stubs for every library that later agents will replace. Create the seams in README §6 so Phase 1 can run in parallel without conflicts.

## Depends on
Dmytro's answers to D1–D6 (README §2). Record them in `docs/migration/DECISIONS.md`.

## Branch
`migration/expo` from `main` (D6). Work directly on this branch; A8 takes over ownership afterwards.

## Tasks
1. **Scaffold the project.** Create a reference Expo project somewhere outside the repo (`npx create-expo-app@latest tp-ref --template blank-typescript`) and use it as a source for configs. Don't run the generator inside the repo.
2. **Root config**
   - `package.json`: `"main": "expo/AppEntry"`, or keep `index.js` using `registerRootComponent(App)`. Scripts: `start: expo start`, `android: expo run:android`, `ios: expo run:ios`, `lint`, `test`, `doctor: expo-doctor`. Remove the `bandle*` and `clean:*` scripts.
   - `app.config.ts`: name, slug, scheme (replaces `yourSchemeHere`), `orientation: 'portrait'`, `android.package` and `ios.bundleIdentifier` per D1, icon from `app/assets/icons/icon.png`, `userInterfaceStyle: 'automatic'` (the app has light/dark themes). Pre-declare these plugins, with TODO comments naming the owning agent: `expo-audio`, `expo-notifications`, `@react-native-google-signin/google-signin`, `expo-build-properties`.
   - `babel.config.js`: `babel-preset-expo`. Add the Reanimated/worklets plugin only if the installed preset doesn't already include it.
   - `metro.config.js`: `getDefaultConfig` from `expo/metro-config`.
   - `tsconfig.json`: extend `expo/tsconfig.base`, `strict: false` for now (A7 tightens it later).
   - `.gitignore`: add `android/`, `ios/`, `.expo/`, `.env`, `*.local.*` (already there).
3. **Remove the bare native projects**: `git rm -r android ios`. First copy `android/app/src/main/res/raw/*.mp3` to `app/assets/sounds/`. Delete `CustomModule.java` and `CustomPackage.java` along with the folders; nothing uses them.
4. **Dependencies**
   - Remove: `react-native-web`, `react-dom`, `redux-typescript`, `@types/prettier`, `@types/react-native-keep-awake`, `@types/react-native-vector-icons`, `metro-react-native-babel-preset`, `babel-jest`, `jest` (A7 adds `jest-expo`), `react-test-renderer`.
   - `npx expo install` the core packages: `expo`, `react`, `react-native`, `react-native-screens`, `react-native-safe-area-context`, `react-native-gesture-handler`, `react-native-reanimated`, `react-native-worklets`, `react-native-svg`, `@react-native-async-storage/async-storage`, `@react-native-community/netinfo`, `@react-native-community/slider`, `expo-status-bar`, `expo-build-properties`.
   - Upgrade to current majors: `@react-navigation/native`, `@react-navigation/stack`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs` (A5 fixes any code breakage; you only need it to compile and boot), `@reduxjs/toolkit`, `react-redux`, `firebase`.
   - Leave the libraries Phase 1 agents will replace in place for now, but stop importing them directly (see step 5).
5. **Create the seams** from README §6:
   - `app/services/audio.ts`, `speech.ts`, `keepAwake.ts`, `backgroundSession.ts`, `googleAuth.ts`. Each starts as a stub that logs `console.warn('[stub] …')` and returns safe values. `getGoogleIdToken` rejects with `new Error('Google sign-in not migrated yet')`.
   - `app/common/icon/icon.tsx`: a temporary wrapper. Use whichever icon package currently works under SDK 57; A5 replaces it.
   - Point every caller at the seams. Replace the direct imports in `usePlaying.tsx`, `useTTS.tsx`, `AppHelperProvider.tsx`, `AppSoundPicker.tsx`, `SettingsScreen.tsx`, `PlayingScreen.tsx`, `BackgroundAction.tsx`, `UserAC.ts`, `AppGoogleSignInButton.tsx`, and the 9 files that import `react-native-vector-icons`. **Change only the imports and calls, nothing else.**
   - Then uninstall `react-native-sound`, `react-native-tts`, `react-native-keep-awake`, `react-native-background-actions`, `react-native-vector-icons`, and `@react-native-google-signin/google-signin`. A2 re-adds Google Sign-In at its current version.
6. **Firebase compat shim.** In `app/utils/firebase.ts`, switch the imports to `firebase/compat/app`, `firebase/compat/auth`, `firebase/compat/firestore`, `firebase/compat/database`, `firebase/compat/storage`, and `firebase/compat/functions`. In `PublicationsAC.ts`, replace `import firebase from 'firebase'` with the compat import. Read the config from `process.env.EXPO_PUBLIC_FIREBASE_*` instead of `constants.local.ts`, and commit a `.env.example` listing the keys (no values).
7. **Get it booting.** Run `npx expo prebuild --clean`, then `npx expo run:android`, and on macOS also `run:ios`. The app should open, show the login screen with email/password login working, and switch between all tabs. Fix only what blocks booting.
8. **Docs**: commit this plan folder (`docs/migration/**`). Create `DECISIONS.md`, and create `STATUS.md` as a table with one row per agent showing state, branch, and notes.

## Acceptance criteria
- [ ] `npx expo-doctor` passes, apart from issues explicitly assigned to Phase 1 agents (list them in STATUS.md).
- [ ] `npx tsc --noEmit` passes, using `// @ts-expect-error TODO(Ax)` only where a Phase 1 agent will fix it.
- [ ] The Android dev build boots, email login works, and all tabs render. Note iOS status if you're not on macOS.
- [ ] No source file imports any of the removed libraries directly.
- [ ] Seam signatures match README §6 exactly.

## Handoff
Fill in `handoff/A0.md`. List every stub, every `TODO(Ax)`, and any deviations from this brief. Mark Phase 1 as unblocked in `STATUS.md`.
