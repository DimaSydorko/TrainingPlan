# Building TrainingPlan with EAS

Covers build variants, environment variables, EAS profiles, signing credentials, the Supabase project and the Google Cloud setup that Google Sign-In needs.

## 1. Build variants

`app.config.ts` reads `APP_VARIANT`. `eas.json` sets it for every profile. Without it, the config builds `production`.

| Variant | App name | Android package | iOS bundle ID | URL scheme |
|---|---|---|---|---|
| development | Training Plan (Dev) | `com.trainingplantogether_cli.dev` | `com.trainingplantogether-cli.dev` | `trainingplan-dev` |
| preview | Training Plan (Preview) | `com.trainingplantogether_cli.preview` | `com.trainingplantogether-cli.preview` | `trainingplan-preview` |
| production | Training Plan | `com.trainingplantogether_cli` | `com.trainingplantogether-cli` | `trainingplan` |

Each variant has its own ID, so all three can be installed on one phone. For EAS and Google they are three separate apps, each with its own credentials and its own OAuth clients. All three talk to the same Supabase project until a production project exists.

The iOS bundle ID is still an open question ([release-checklist.md](release-checklist.md) Q1). Apple does not allow `_`, so `com.trainingplantogether-cli` is used for now. If Dmytro picks another ID, change `IOS_BUNDLE_ID` in `app.config.ts` before the first iOS build.

## 2. Environment variables

`.env.example` lists every key. For local work, copy it to `.env`. For EAS, create the same keys as **EAS environment variables** (expo.dev → project → Environment variables, or `eas env:create`) in the `development`, `preview` and `production` environments. Each profile in `eas.json` picks its environment through the `environment` field. `.env` is gitignored, so it is never uploaded to EAS.

| Key | Environments | Visibility | Notes |
|---|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | all three | Plain text | `https://<project-ref>.supabase.co` (Supabase → Project Settings → API) |
| `EXPO_PUBLIC_SUPABASE_KEY` | all three | Plain text | The publishable (anon) key. Public by design — RLS protects the data. Never use the secret/service-role key here |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | all three, same value | Plain text | OAuth client of type "Web application" in the Google Cloud project (the one Firebase originally created, "Web client (auto created by Google Service)") |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | **different value per environment** | Plain text | OAuth client of type "iOS" for that variant's bundle ID. `app.config.ts` turns it into the iOS URL scheme. An EAS iOS build fails early if it is missing |
| `APP_VARIANT` | set by `eas.json` | n/a | Do not add it as an EAS variable |
| `EAS_PROJECT_ID` | optional | n/a | Only needed if the project ID is not hard-coded in `app.config.ts` (see §3) |

Android doesn't need its own client ID in the app. Google matches the Android OAuth client by package name and SHA-1, and the app only passes the web client ID.

## 3. First-time EAS setup

1. `npm i -g eas-cli` (version 16 or newer), then `eas login`.
2. `eas init`. The config is dynamic, so EAS cannot write the project ID itself. Copy the ID it prints into `app.config.ts`: replace `process.env.EAS_PROJECT_ID || undefined` with the ID string. You can also export `EAS_PROJECT_ID` in your shell, but then every `eas` command needs it.
3. Create the EAS environment variables from §2.
4. Android version code: `appVersionSource` is `remote`, so EAS stores `versionCode` and `buildNumber`, and `production` raises them on each build. Before the first production build, set the remote Android version code above the last one uploaded to Play: `eas build:version:set -p android`. The old Gradle config had `versionCode 1` with an ABI split override (×1000 + ABI index), so look up the real number in the Play Console.
5. Android credentials: see §4. **Do not let EAS create a new keystore for the production profile before you've read §4.**
6. iOS credentials: on the first `eas build -p ios`, let EAS create the distribution certificate and provisioning profiles. You need a paid Apple Developer account. Register the bundle IDs from §1 (EAS can do this for you).

Builds:

```bash
eas build --profile development --platform android   # dev client APK, installs next to the store app
eas build --profile development-simulator --platform ios
eas build --profile preview --platform android       # internal APK
eas build --profile production --platform android    # AAB for Play
```

`npx expo run:android` / `run:ios` builds the development variant locally if `APP_VARIANT=development` is in `.env`.

## 4. Android signing keys (important)

Until now, release builds were signed with the **React Native template debug keystore** (`android/app/debug.keystore`, password `android`, alias `androiddebugkey`). It was deleted with `android/` but is still in git history at commit `ee75ad7`. That keystore is public: it ships in every React Native template.

Its fingerprints:

- SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- SHA-256: `FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C`

What to do depends on what the Play Console shows under *Setup → App signing*:

- **App not published yet**: let EAS generate a new production keystore. Done.
- **Published, Play App Signing enabled** (Google holds the app signing key, the debug keystore is only the *upload* key): request an **upload key reset** in the Play Console with a new key that EAS generates (`eas credentials` → Android → production → download the upload certificate). Until Google approves the reset, import the old debug keystore into EAS as the upload keystore so you can still ship: `git show ee75ad7:android/app/debug.keystore > old.keystore`, then `eas credentials` → Android → `production` → Keystore → upload `old.keystore`.
- **Published, no Play App Signing** (the debug keystore is the app signing key): Play only accepts updates signed with that key, so a new keystore would mean a new listing. Import the old keystore into EAS as above, then enroll in Play App Signing with *key upgrade* and register a new upload key, so the public key stops being the one that matters.

Never commit a keystore. EAS keeps credentials on its servers. The development and preview variants have different package names, so EAS can generate fresh keystores for them.

## 5. Supabase and Google Sign-In checklist

The app signs in with native Google Sign-In, then hands the ID token to Supabase (`signInWithIdToken`). Google Sign-In fails with `DEVELOPER_ERROR` (Android) or an invalid-client error (iOS) until steps 2–3 are done for each variant you build; Supabase rejects the token until step 4 is done.

1. **Supabase project**: schema changes only through `supabase/migrations` (`npx supabase db push` after `npx supabase test db`), then regenerate `app/lib/supabase/database.types.ts`. Auth → Email: confirmations on, minimum password length 8. Run the Security and Performance Advisors after schema changes.
2. **Android OAuth clients**: Google Cloud console (the project that owns the web client) → APIs & Services → Credentials → create one client of type *Android* per package in §1 with these SHA-1 fingerprints:
   - production: the **Play App Signing key** (Play Console → App signing → "App signing key certificate"), the **upload key** (EAS: `eas credentials` → Android → production), and the old debug key above while it is still in use;
   - development and preview: the EAS keystore of that profile (`eas credentials` → Android → development / preview). For local `expo run:android` debug builds, also add `~/.android/debug.keystore` (`keytool -list -v -keystore ~/.android/debug.keystore -storepass android`).
   No `google-services.json` is needed.
3. **iOS OAuth clients**: one client of type *iOS* per bundle ID in §1. Put its client ID into `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` in the matching EAS environment. No `GoogleService-Info.plist` is needed.
4. **Supabase Google provider**: Supabase → Authentication → Providers → Google → enabled. *Client IDs*: the web client ID and every iOS client ID, comma-separated (web first). *Client secret*: the web client's secret. Turn on *Skip nonce check* (the native iOS SDK sets a nonce the app can't read). Locally the same values come from `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` / `..._SECRET` (`supabase/config.toml`).
5. **OAuth consent screen**: make sure it is published (not "Testing"), or add testers' accounts.
6. **Leftovers**: the Firebase project is no longer used by the app (only by `admin/` until it moves). Its Google Cloud project stays — it owns the OAuth clients.

## 6. Native config is generated

`android/` and `ios/` are gitignored and generated by `npx expo prebuild --clean` (EAS runs it on every build). For the same `APP_VARIANT` and env vars, the output is identical on every run (checked by hashing two clean prebuilds). The only env-dependent part is the Google iOS URL scheme. Change native settings in `app.config.ts` or a config plugin, never in the generated folders.
