# A2: Auth, native config and EAS

## Mission
Get Google Sign-In working under Expo, own `app.config.ts`, and set up EAS so anyone can build development, preview, and production binaries from a clean clone.

## Branch
`migration/a2-auth` (worktree `../tp-a2-auth`)

## Owns
`app.config.ts`, `eas.json`, `.env.example`, `app/services/googleAuth.ts`, `app/Screens/LoginScreen/AppGoogleSignInButton.tsx`

## Do not touch
`app/store/UserReducer/UserAC.ts` (A1 owns it and calls your seam).

## Tasks
1. **Google Sign-In**
   - `npx expo install @react-native-google-signin/google-signin`, then configure its config plugin in `app.config.ts`. Pass the iOS URL scheme (reversed iOS client ID) through plugin options or an env var.
   - Implement `googleAuth.ts` per README §6: `configureGoogleSignIn()` with `webClientId` (from env), `getGoogleIdToken()`, and `signOutGoogle()`. The current library's `signIn()` returns `{ type: 'success' | 'cancelled', data }` and no longer returns `{ idToken }` directly. Map a cancel to a typed error that A1 can tell apart from a real failure.
   - `hasPlayServices({ showPlayServicesUpdateDialog: true })` on Android before signing in.
   - Update `AppGoogleSignInButton.tsx` to use the seam, and the library's current button component or the app's own button.
   - Firebase console checklist (write it in your handoff; Dmytro does it): add the **SHA-1/SHA-256 fingerprints** of the EAS debug and release keystores and of the Play App Signing key to the Android app. Register the iOS app with the new bundle ID (D1). Make sure the web client ID matches.
2. **`app.config.ts`**
   - Make it dynamic, with `APP_VARIANT` = development | preview | production. Development and preview builds get a name and bundle ID suffix (`.dev`, `.preview`) so they can sit next to the production app.
   - Settings: the `scheme` from A0, `android.permissions` (`VIBRATE`, plus whatever A4 needs, e.g. `POST_NOTIFICATIONS`), `android.blockedPermissions` for anything unused, and `ios.infoPlist` entries if A3 or A4 need background audio (`UIBackgroundModes: ['audio']`). Ask those agents in their handoffs before enabling it.
   - `expo-build-properties`: Android `minSdkVersion`/`targetSdkVersion` per the SDK defaults. Only override with a reason.
   - Version numbers: `version` from package.json. Android `versionCode` and iOS `buildNumber` managed by EAS (`appVersionSource: remote`, `autoIncrement` in production).
3. **EAS**
   - `eas.json` profiles: `development` (developmentClient, internal distribution), `preview` (internal, APK for Android), `production` (store builds, AAB).
   - Environment: `EXPO_PUBLIC_FIREBASE_*` and Google client IDs set as EAS environment variables per environment. `.env.example` lists every key.
   - Write up keystore and credentials handling in `docs/migration/BUILD.md`. If an existing Android upload keystore exists and the app is published (D1), it must be imported into EAS, not regenerated.
4. **Remove leftovers**: there should be no references to `google-services.json` unless D2 chose React Native Firebase.

## Acceptance criteria
- [ ] A development build installs next to the production app and opens.
- [ ] Google sign-in → Firebase user is created or reused (end to end once A1 is merged; before that, show the seam returns an ID token).
- [ ] Cancelling Google sign-in shows no error toast.
- [ ] `eas build --profile preview --platform android` succeeds from a clean clone with only env vars set.
- [ ] `npx expo prebuild --clean` produces the same native config every time.

## Handoff
Fill in `handoff/A2.md` with the Firebase/Google console checklist for Dmytro, the env var list, and the permissions you added and which agent asked for each.
