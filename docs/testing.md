# Testing

Unit tests, the TypeScript strictness roadmap, Maestro E2E flows and the manual test plan. Release device checks and open questions: [release-checklist.md](release-checklist.md). Lint/format rules: `eslint.config.js`, `.prettierrc.js`.

## 1. Unit tests (Jest)

### Layout

| Path | What |
|---|---|
| `jest.config.js` | `preset: 'jest-expo'`, test locations, transform allow-list, setup files |
| `app/__tests__/setup/jest.setup.js` | Registers the module mocks below (runs before each test file) |
| `app/__tests__/setup/jest.setupAfterEnv.js` | Reanimated 4 test setup |
| `app/__tests__/setup/mocks/*.js` | The mock implementations |
| `app/__tests__/utils/` | `createTestStore`, `getInitialState`, `createBootstrappedPersistor`, `renderWithStore` |
| `app/__tests__/*.test.ts(x)` | App-level tests: App smoke test, store persistence, mocks, helpers |
| `app/__tests__/<path>/*.test.ts(x)` | Unit tests, in a mirror of the `app/` path they test (`app/__tests__/platform/` tests `app/platform/`) |

Only files named `*.test.ts`, `*.test.tsx` or `*.test.js` are run. Other files inside `app/__tests__/` (setup, utils, fixtures) are ignored by the runner.

Libraries: `jest-expo` 57, `jest` 29, `@testing-library/react-native` 14 (with its `test-renderer` peer). RNTL 14 is **async**: `await render(...)`, `await fireEvent.press(...)`, `await userEvent.press(...)`. Its matchers (`toBeOnTheScreen`, `toHaveTextContent`, ...) are available as soon as a test imports anything from `@testing-library/react-native`.

### Mocks registered for every test

| Module | Mock | Notes |
|---|---|---|
| `@react-native-async-storage/async-storage` | the package's official Jest mock | In-memory; `await AsyncStorage.clear()` in `beforeEach` when a test depends on it |
| `@react-native-community/netinfo` | the package's official Jest mock | `addEventListener` is a `jest.fn()` |
| `expo-audio` | `mocks/expo-audio.js` | `createAudioPlayer` / `useAudioPlayer` return players with `jest.fn()` methods (`play`, `pause`, `seekTo`, `remove`, ...). Every player is kept in `require('expo-audio').__players` |
| `expo-speech` | `mocks/expo-speech.js` | `speak(text, { onStart, onDone })` calls both callbacks immediately |
| `expo-keep-awake` | `mocks/expo-keep-awake.js` | All functions are `jest.fn()` |
| `expo-notifications` | `mocks/expo-notifications.js` | Permissions granted; `scheduleNotificationAsync` returns ids and stores requests in `__scheduled`; cancel removes them; enums (`AndroidImportance`, `SchedulableTriggerInputTypes`, ...) included |
| `@react-native-google-signin/google-signin` | `mocks/google-signin.js` | `GoogleSignin.signIn()` resolves `{ type: 'success', data: { idToken: 'mock-google-id-token', user } }`; `statusCodes`, `isSuccessResponse`, `isErrorWithCode`, `GoogleSigninButton` included |
| `firebase/compat/*` and `firebase/app`, `firebase/auth`, `firebase/firestore`, `firebase/database`, `firebase/storage`, `firebase/functions` | `mocks/firebase.js` | A chainable stub: any property or call returns another stub, calls are awaitable, subscriptions return an unsubscribe function. Enough for module-level setup code; **not** a fake backend |
| `react-native-worklets` | the package's own `src/mock` | Required by Reanimated 4 |
| `react-native-gesture-handler` | `react-native-gesture-handler/jestSetup` | Official setup |

The setup file hides only `[stub] ...` warnings, so real warnings (for example React Native deprecations) still show in test output.

### Overriding a mock in one test

```ts
import * as Notifications from 'expo-notifications'

it('asks for permission when it was denied', async () => {
  jest.mocked(Notifications.getPermissionsAsync).mockResolvedValueOnce({ granted: false, status: 'denied' } as any)
  // ...
})
```

For data-layer tests, mock one level higher than Firebase, e.g. `jest.mock('@utils/firebase', () => ({ ... }))` or the specific modular functions your code calls (`jest.mock('firebase/firestore', () => ({ getDocs: jest.fn(), ... }))` in that test file overrides the global stub).

### Store helpers

```tsx
// in app/__tests__/screens/settings-screen/
import { renderWithStore } from '../../utils/render'

const { store } = await renderWithStore(<SettingsScreen />, {
  preloadedState: { settingsReducer: { isVibration: false } }, // deep-merged over the slices' initial state
})
```

`createTestStore` uses the real slice reducers without redux-persist. To test persistence itself, load the real `app/store` inside `jest.isolateModules` (see `app/__tests__/store.test.ts`).

### Writing tests

- Put them in `app/__tests__/` under the same path as the code, e.g. `app/platform/media-utils.ts` → `app/__tests__/platform/media-utils.test.ts`. Import the code under test via `@<folder>/…`; test helpers via a relative path.
- Prefer testing pure functions (timers, formatting, reducers, mapping Firebase docs) over rendering whole screens.
- A missing native-module mock goes into `app/__tests__/setup/mocks/` and is registered in `jest.setup.js`.

---

## 2. TypeScript strictness roadmap

`tsconfig.json` keeps `"strict": false` and enables strict-family flags one at a time. Error counts were measured on 2026-10-11 (file names from before the kebab-case rename); re-measure with `npx tsc --noEmit --<flag>`.

| Stage | Flags | Errors today | Notes |
|---|---|---|---|
| 0 (done) | `alwaysStrict`, `strictBindCallApply`, `noImplicitThis`, `strictBuiltinIteratorReturn`, `noFallthroughCasesInSwitch`, `forceConsistentCasingInFileNames` | 0 | Enabled in `tsconfig.json` |
| 1 | `strictFunctionTypes` | 4 | `PublicationsRouter.tsx` (2), `WorkoutsScreen.tsx`, `MyPlansScreen.tsx`: navigator/screen component prop types |
| 1 | `noImplicitReturns` | 2 | `UserAC.ts`, `WorkoutsScreen.tsx` |
| 1 | `noImplicitOverride` | 2 | `common/my-switch/switch-lib.tsx` (class component) |
| 1 | `useUnknownInCatchVariables` | 21 | All in `app/store/*/*AC.ts` `catch (e)` blocks. Fix: `e instanceof FirebaseError ? e.message : String(e)` |
| 2 | `noImplicitAny` | 29 | SwitchLib (9), SettingsScreen (5), Exercise (4), SwipeSelector (3), InfiniteScroll (3), PlansSlice (2), GoBackSubmitModal (2), usePlaying (1) |
| 3 | `strictNullChecks` (brings `strictPropertyInitialization`, 0 extra) | 114 | The big one. Go folder by folder: `app/store` → `app/hooks` → `app/common` → `app/components` → `app/screens`. Biggest: MySwitch 20, Exercise 15, WorkoutsScreen 12, PublicationsReducer 10. Option: use `// @ts-expect-error TODO(strict)` per remaining line to flip the flag early and burn the list down |
| 4 | `"strict": true` and delete the individual flags | 161 today in total | Only when stages 1–3 are at 0 |
| 5 (optional) | `noUncheckedIndexedAccess` | +33 on top of strictNullChecks | Worth it for the playback index maths (`exercises[idx]`) |
| — | `noUnusedLocals` / `noUnusedParameters` | 71 / 5 | Not recommended: ESLint's `@typescript-eslint/no-unused-vars` already reports these as warnings without blocking the build |
| — | `exactOptionalPropertyTypes` | 132 | Not recommended: noisy with React Native style types |

Test code in `app/__tests__/` already compiles with `--strict`. Keep it that way.

---

## 3. E2E flows (Maestro)

The flows live in `e2e/` and run against an installed **development or preview build** (not Expo Go).

| Flow | What it checks |
|---|---|
| `01-login-email.yaml` | Clean install → login screen → email/password login → tab bar |
| `02-create-workout.yaml` | Create workout "E2E Workout", add 2 exercises (each with a non-zero break), save |
| `03-play-workout.yaml` | Open it, Start Workout, play for ~30 s, still on the playing screen, pause and leave |
| `04-switch-theme.yaml` | Profile → Settings → Dark Theme on, restart app, still dark, switch back |
| `05-delete-workout.yaml` | Deletes every "E2E Workout" (cleanup, so runs are repeatable) |
| `subflows/*.yaml` | Shared steps: login (skipped if already signed in), open workout, add exercise |

### Running

1. Install Maestro: `curl -fsSL "https://get.maestro.mobile.dev" | bash` (needs Java 17+).
2. Start an Android emulator or connect a device (`adb devices`), or boot an iOS simulator.
3. Install a build: `npx expo run:android` / `npx expo run:ios`, or an EAS `development`/`preview` build.
4. Have a Firebase **test account** (email + password) in the project the build points at. Don't use a personal account: flow 02 writes and 05 deletes workouts.
5. Run:

```bash
export E2E_EMAIL='tester@example.com' E2E_PASSWORD='...'   # never commit these
npm run e2e:android     # APP_ID=com.trainingplantogether_cli
npm run e2e:ios         # APP_ID=com.trainingplantogether-cli (pending [release-checklist.md](release-checklist.md) Q1)
# single flow:
maestro test -e APP_ID=com.trainingplantogether_cli -e E2E_EMAIL="$E2E_EMAIL" -e E2E_PASSWORD="$E2E_PASSWORD" e2e/03-play-workout.yaml
```

Screenshots from `takeScreenshot` land in the current directory. `maestro studio` helps when a selector stops matching.

### testIDs the flows need

Shared components need a `testID` prop passed through to their touchable/input.

| testID | Where |
|---|---|
| `login.email`, `login.password`, `login.submit` | `LoginScreen` inputs and "Log in" button (`MyTextInput` and `ConfirmButton` need a `testID` prop) |
| `tab.plans`, `tab.workouts`, `tab.publications`, `tab.profile` | `AppRouter` tabs, via `tabBarButtonTestID` |
| `workouts.add` | `WorkoutsScreen` `AddMoreButton` (needs a `testID` prop) |
| `workouts.delete` | `WorkoutsScreen` edit-mode delete `IconButton` (needs a `testID` prop) |
| `editPlanWorkout.name` | `EditPlanWorkout` name `MyTextInput` |
| `appModal.confirm`, `appModal.cancel`, `appModal.refuse` | `AppModal` buttons |
| `workout.nameInput`, `workout.fab`, `workout.save`, `workout.start` | `WorkoutScreen`: name input, the `AddMoreButton` (plus/edit), "Save workout", "Start Workout" |
| `exerciseEdit.name`, `exerciseEdit.breakMinutes`, `exerciseEdit.breakSeconds` | `ExerciseEditModal` name input and the two `SwipeSelector`s (needs a `testID` prop) |
| `profile.settings`, `profile.logout` | `ProfileScreen` icon buttons |
| `settings.darkTheme` | `SettingsScreen` "Dark Theme" switch. `SettingsItem` passes it to `MySwitch`, and `MySwitch` must expose `accessibilityRole="switch"` and `accessibilityState={{ checked: value }}` so Maestro's `checked:` works |
| `playing.screen` | `PlayingScreen` root view |
| `playing.timer` | the timer `TouchableOpacity` |
| `playing.play` / `playing.pause` | the centre footer `IconButton`: `testID={isPlaying ? 'playing.pause' : 'playing.play'}` |
| `playing.previous`, `playing.next`, `playing.reload`, `playing.review` | the other footer buttons (not used yet, reserved) |
| `playing.saveResult` | "Save Result" button |

---

## 4. Manual test plan

Run the full pass on **one real Android device** (Android 13+; ideally also one older device on Android 10–12) and **one iOS device or simulator** (iOS 17+). Use a `preview` EAS build for the final sign-off; a development build is fine while fixing.

### 4.0 Before you start

- [ ] Build under test recorded (EAS build id or git sha, profile, platform, device model, OS version).
- [ ] `.env` points to the Firebase project you mean to test (test project, or production with a test account).
- [ ] Two test accounts ready: an email/password account and a Google account. Account B (any type) for publications.
- [ ] Device volume up, not in silent mode (iOS ring/silent switch off), Do Not Disturb off.
- [ ] For §4.9 (upgrade in place): the **old** Play Store / pre-migration build installed on a second device, with data, before installing the new one.

Mark each line pass / fail / n/a. On failure, note what you saw and attach a screenshot or screen recording.

### 4.1 App start

- [ ] Cold start shows the splash, then the login screen (signed out) or the tabs (signed in). No red box, no white screen.
- [ ] App name "Training Plan" and the icon look right on the home screen.
- [ ] Rotate the device (if allowed) and back: no crash.
- [ ] Background the app for 1 minute, return: same screen, no reload.
- [ ] System dark mode on: status bar and system UI stay readable.

### 4.2 Auth

- [ ] Login screen: E-mail and Password fields, "Log in" button, "Sign up" link. Google button shown in release builds.
- [ ] Wrong password → error message under the header, button usable again.
- [ ] Empty fields → error, no crash.
- [ ] Correct email/password → tabs appear, Profile shows the name/email.
- [ ] "Sign up" → registration; create a new account → signed in. (Use a throwaway email.)
- [ ] Google sign-in: account picker appears, choose account → signed in. Cancel the picker → back on login, no error toast loop.
- [ ] Google sign-in on Android without Play Services up to date → update dialog (if testable).
- [ ] Kill and relaunch the app → **still signed in** (auth persistence on AsyncStorage).
- [ ] Profile → log out icon → "Are you sure?" → Yes → login screen. Relaunch → still signed out. Google account is signed out too (next Google login shows the picker).
- [ ] Airplane mode on login screen → "Log in" disabled.

### 4.3 Plans (My Plans tab)

- [ ] List loads the account's plans. Pull to refresh works.
- [ ] Empty account shows the no-data illustration.
- [ ] "+" → "Create new Plan?" → change name, add labels, pick a colour → Create → appears in the list.
- [ ] Open the plan → its workouts; add a workout to the plan; edit its name; "Save Plan" persists after relaunch.
- [ ] Long-press a plan → selection mode; edit, copy, share and delete icons behave; delete asks for confirmation.
- [ ] Leaving a plan with unsaved changes shows the "aren't saved" confirmation.

### 4.4 Workouts (My Workouts tab)

- [ ] **Create**: "+" → name/labels/colour → Create → appears in the list.
- [ ] **Open** an empty workout → opens in edit mode. Add exercise ("+"): name, break (min/sec wheels), laps, repeats, colour, image → Save. Save is disabled while break is 0:00.
- [ ] Add a second exercise; "Save workout" → view mode lists both and shows the total duration.
- [ ] **Edit**: pencil → change name, change an exercise, hide an exercise (eye icon) → save. Hidden exercise is not shown in view mode and is skipped when playing.
- [ ] **Reorder exercises**: in edit mode long-press and drag an exercise → order kept after save and after relaunch.
- [ ] **Reorder workouts**: in the list, long-press to select, then long-press-drag → order kept after relaunch.
- [ ] **Copy**: select workout(s) → copy icon → choose "My workouts" or a plan → copies appear there.
- [ ] **Delete**: select one / several / "select all" → delete → confirmation text names the workout or count → gone after relaunch.
- [ ] Back button with unsaved changes → "Changes in '…' workout aren't saved!" modal; Confirm discards, Cancel stays.
- [ ] Exercise image picker opens and shows images (from Firebase storage); choosing one shows it on the card.

### 4.5 Publications

- [ ] **Browse**: Publications tab loads a list; pull to refresh.
- [ ] **Search by labels**: type a label → results filtered; clear → full list.
- [ ] **Paginate**: scroll to the bottom with more than 10 publications → next page loads once, no duplicates, spinner disappears.
- [ ] **Publish**: in My Workouts select one workout → share icon → confirm → it shows in Publications and under Profile ("your publications").
- [ ] **Open** a publication (plan and workout types) → detail screen renders exercises.
- [ ] **Copy/save** someone else's publication (account B's) → appears in My Workouts / My Plans.
- [ ] **Delete** your own publication from Profile → confirmation → gone.
- [ ] Offline: Publications tab shows the no-signal state, no endless spinner.

### 4.6 Playing a workout

Use a workout with at least 3 exercises: one with repeats/weight, one time-only, short breaks (10–20 s), 2 laps on one exercise.

**Foreground**
- [ ] "Start Workout" → playing screen with exercise name, countdown circle, next exercise preview.
- [ ] Play/pause via the centre button and by tapping the timer.
- [ ] Countdown reaches 0 → cue sound plays (the type chosen in Settings), then the next exercise name is spoken (TTS), vibration if enabled.
- [ ] Laps: an exercise with 2 laps repeats before moving on.
- [ ] Repeats/weight steppers change values; the weight step matches Settings → Weight step.
- [ ] Previous / next / restart buttons; previous disabled at the very start.
- [ ] List icon → review shows progress through the workout.
- [ ] Last exercise done → "Save Result" → results saved; the workout shows updated results afterwards.
- [ ] Screen stays awake during play (wait longer than the device's auto-lock time without touching it). After leaving the playing screen, auto-lock works again.
- [ ] Leave the playing screen mid-workout → confirmation; confirm → back on the workout, sound/speech stop.

**Locked screen / background** (timestamp timer + notifications)
- [ ] Start, then lock the phone for 2 minutes. Cues still arrive at the right times (notification and/or sound), and after unlocking the timer shows the correct remaining time, not where it was when locked.
- [ ] Same with the app in the background (home button) instead of locked.
- [ ] An ongoing notification (Android) shows the workout title/progress; tapping it opens the playing screen. It disappears when the workout ends or you leave the screen.
- [ ] First workout after install asks for notification permission (Android 13+, iOS). Deny it → workout still plays in the foreground and the app doesn't crash or nag on every start.
- [ ] Force-kill the app during a workout → no stuck notification afterwards, scheduled cues are cancelled.

**Interruptions**
- [ ] Incoming phone call during a break → audio stops/ducks for the call; after the call the workout continues (or is paused) with correct time.
- [ ] Music playing (Spotify/YouTube Music) before starting: with "Lowering other apps output level" on, music ducks for speech and comes back; with it off, music keeps playing at full volume and speech plays over it.
- [ ] Bluetooth headphones: cues and speech come through the headphones; disconnecting them mid-workout doesn't crash.
- [ ] Another app's alarm/timer fires → workout continues afterwards.
- [ ] iOS silent switch on: note whether cues play (expected: they do, because the audio session is "playback").

**Battery saver**
- [ ] Settings → "Safe battery mode" on → theme switches to dark, workout still plays correctly.
- [ ] Android system battery saver on (and, on Samsung/Xiaomi, the vendor's aggressive mode if available) → lock the screen for 2 minutes during a workout → cues still arrive (note any delay in seconds).

### 4.7 Settings (Profile → gear icon)

- [ ] **Dark Theme** switch → whole app switches; persists after relaunch.
- [ ] **Safe battery mode** → turns on dark theme; persists.
- [ ] **Weight step** slider (1–10 kg) → used by the weight stepper while playing.
- [ ] **Vibration** off → no vibration on cues or button long-press.
- [ ] **Press for test speech** → says "Test speech" with the current volume/pitch/speed.
- [ ] **Lowering other apps output level** → see 4.6 interruptions.
- [ ] **Volume / Pitch / Speed** sliders → audible difference with test speech; values persist.
- [ ] **Press for test sound** → plays the selected cue at the selected sound volume.
- [ ] **Sound Volume** slider → test sound and in-workout cues follow it (0 = silent).
- [ ] **Sound type** → picker lists bell, digital clock, double ding, hop bell; tapping one previews it; the choice is used during play and persists.
- [ ] **Clear local storage** → settings back to defaults, results cleared; account stays signed in.

### 4.8 Offline (NetInfo / no-signal state)

- [ ] Start the app in airplane mode while signed in → tabs show cached data, an offline toast appears after ~1 s, no crash.
- [ ] Profile and Publications show the no-signal illustration; logout icon hidden.
- [ ] Login "Log in" and Google buttons disabled when offline.
- [ ] Turn the network back on → toast disappears, data refreshes (workouts, plans, images) without restarting.
- [ ] Toggle airplane mode on/off quickly several times → no duplicate fetches visible as flicker loops, no crash.
- [ ] Edit a workout offline and save → behaviour is clear (error toast or saved locally); note which. Back online → state is consistent with Firebase.
- [ ] Play a workout offline → works fully (sounds are bundled).

### 4.9 Upgrade in place from the old build

The new build must install **over** the old one (same Android package `com.trainingplantogether_cli`, same signing key; see [build.md §4](build.md)) and keep users' data.

- [ ] On a device with the old build and data (signed in, custom settings: dark theme, sound type, TTS values, a workout mid-way through results), install the new build over it (`adb install -r` or Play internal testing track). Install succeeds without "App not installed" (signature mismatch means the keystore is wrong — stop).
- [ ] First launch: no crash. Settings (theme, sound type, volumes, TTS, vibration, weight step) are the same as before.
- [ ] Workouts, plans and results are the same as before.
- [ ] Sign-in state: note whether the user is still signed in. Expected: the old Firebase v8 auth session may not carry over (different persistence); if they are asked to sign in once, that is acceptable, but after signing in all their data must be there.
- [ ] Old sound type values map to the new bundled sounds (cue plays, no silence).
- [ ] No duplicate notifications left over from react-native-background-actions.
- [ ] iOS: only applicable if an old iOS build was distributed (bundle id changed from the template placeholder, so it installs as a new app; note this).

### 4.10 Release sanity (preview/production builds only)

- [ ] Android permissions listed in system settings match what the app needs (no SYSTEM_ALERT_WINDOW or storage permissions).
- [ ] No dev menu, no yellow box, no `[stub]` logs (`adb logcat | grep stub` shows nothing).
- [ ] App size is reasonable compared with the old APK (note both numbers).
- [ ] Crash-free for the whole manual pass.
