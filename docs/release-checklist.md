# Release checklist

What's left before the first store release of the Expo app: device checks and open decisions. Work top to bottom: **P0** blocks a release, **P1** should pass before testers get a build, **P2** can follow. Delete this file once released.

The full per-screen plan is [testing.md §4](testing.md#4-manual-test-plan); this list is the prioritized cut.

---

## 1. Setup

1. Answer the questions in §3 that block a build: **Q1 (iOS bundle ID)**, **Q2 (Android signing)** and **Q3 (versionCode)**.
2. `git checkout main && npm ci`
3. `cp .env.example .env` and fill in the `EXPO_PUBLIC_FIREBASE_*` values, `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, and `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` for the dev bundle ID. Keep `APP_VARIANT=development`.
4. Firebase / Google Cloud console ([build.md §5](build.md)): register the Android apps (`com.trainingplantogether_cli`, `.dev`, `.preview`) with SHA-1 and SHA-256 of every signing key you'll use, register the iOS apps, and make sure the OAuth consent screen is published.
5. EAS ([build.md §3](build.md)): `npm i -g eas-cli`, `eas login`, `eas init`, then paste the project ID into `app.config.ts` (or export `EAS_PROJECT_ID`). Create the EAS environment variables for development, preview and production.
6. Dev build: `eas build --profile development -p android` (or `npx expo run:android` with the Android SDK installed) and `eas build --profile development-simulator -p ios` (or `npx expo run:ios`). The app no longer runs in Expo Go.
7. Run `npx expo-doctor`. Config schema and React Native Directory checks should pass; draggable-flatlist and countdown-circle-timer may be flagged as unmaintained.
8. Optional, after the manual pass: Maestro with a Firebase **test** account, `E2E_EMAIL=... E2E_PASSWORD=... npm run e2e:android` ([testing.md §3](testing.md)). All the testIDs are in place.

Test on Android 14+ **and** an older Android if you can, plus an iPhone or simulator.

---

## 2. Checklist

### P0: release blockers

- [ ] **App boots** in the dev build on Android and iOS: login screen when signed out, tabs when signed in. No red box or white screen.
- [ ] **Upgrade in place keeps data.** Install the last Play/Gradle build, sign in, change theme, sound and TTS settings, create a workout. Then install a build of the new app **over it** (same package, same signing key). Settings and workouts are still there. Note whether you're still signed in: if not, you get one clean login screen and cached data is kept (Q4).
- [ ] **Email auth.** Register a new account (`usersData/{uid}` created with `friendsUIDs: []`), log out, log in, kill and reopen: still signed in. Reopen in airplane mode: still signed in.
- [ ] **Google sign-in** with real env vars and SHA-1 registered: picker, then into the app with the **same Firebase UID** as before the migration. Kill and reopen: still signed in. Log out, then Google again shows the picker. **Cancel the picker: no error message.**
- [ ] **Data round trip.** Create, edit, reorder and delete a workout and a plan online; check `workouts/` and `plans/` in the Firebase console (field names as in older docs, no `uid` field inside a doc). Delete a workout **offline**, go online, pull to refresh: it's gone from Firestore.
- [ ] **Locked-phone accuracy.** A ~10 min workout of timed exercises: start, lock for 3 min, unlock. Exercise, lap and remaining seconds match a stopwatch within 1 s. Same with the app backgrounded. With a strength exercise (repeats), the player is **paused** at that lap after unlock.
- [ ] **Cue notifications while locked.** First open of the player shows the explanation, then the system prompt. Locked: one notification per segment boundary, with the selected cue sound and vibration if on. Pause/resume or skip, lock again: no duplicates or stale cues. App open: no banners, only in-app sound and TTS. Android: the "Workout in progress" notification updates in place.
- [ ] **Cleanup.** Finish a workout, and leave one midway with Back → confirm: no workout notifications left, nothing fires later.
- [ ] **Results saved.** Change weight/repeats during a workout and save; the values match what the old app saved. A workout that finished while locked shows the review with "Save Result" on unlock, and saving works.
- [ ] **Preview build** from a clean clone: `npm ci`, then `eas build --profile preview -p android` and `-p ios`.

### P1: before testers

- [ ] **Foreground cues.** Cue sound at each segment end, then the next exercise name spoken right after the sound (no overlap, no long gap), the spoken "10, 3, 2, 1", vibration patterns, and "Workout complete" at the end. Skip, previous, pause and reload work; the circle stays in step with the time after unlocking.
- [ ] **Sounds.** Settings → "Press for test sound" plays the selected sound; each "Sound type" entry plays and cuts off the previous one; "Sound Volume" 0.2 is quieter.
- [ ] **Voice.** "Press for test speech"; Speed, Pitch and Volume apply immediately; Speed 0.5 sounds like normal speech; a decent English voice; on iOS, Volume now works too.
- [ ] **Settings sliders save.** Move each slider, leave Settings, come back and restart the app: the values stuck (now saved on slide end).
- [ ] **Ducking.** Music playing: with "Lowering other apps output level" on, music dips during each cue and phrase and comes back within ~0.5 s; off, cues play over full music. Music never stops or stays ducked, also when locking mid-phrase. Most device-dependent part on Android.
- [ ] **iOS silent switch** on silent: sounds and speech still audible.
- [ ] **Keep awake.** Playing screen with "Safe battery mode" off: screen stays on; on: sleeps normally; after leaving the player, sleeps normally.
- [ ] **Navigation.** Login ↔ Sign up several times (Registration's "Log in" returns to the same Login; hardware back from Login leaves the app). Every tab's stack down to Playing and back. Switching tabs keeps each stack.
- [ ] **Unsaved-changes guard.** Edit a workout, then header back, Android back and iOS swipe back: one alert each; "YES" leaves after one alert. Same for editing a plan.
- [ ] **Drag to reorder** on My Plans, My Workouts, a plan's workouts and a workout's exercises: order persists after reopening and restarting. If dragging fails, swap the implementation in `app/common/draggable-list/draggable-list.tsx`.
- [ ] **Edge-to-edge** (Android 15+ with gesture and 3-button navigation, iPhone with notch/Dynamic Island): headers below the status bar, tab bar above the nav bar, "Save workout"/"Start Workout" footer and + button clear the nav bar, the offline toast is below the status bar, the edit toolbars line up with the header. **Playing screen:** header below the status bar, controls above the nav bar / home indicator, the review list fits between them. Modals sized from screen height (image selector, colour picker, copy) aren't too tall.
- [ ] **Copy workouts** into My Workouts (no target plan): no crash, copies get new ids (a frozen-state crash was fixed here).
- [ ] **Dev and production side by side:** the dev build installs next to the store app as "Training Plan (Dev)" and opens the dev launcher.

### P2: polish

- [ ] **Icons** render on the first frame everywhere (tab bar, toolbars, counters, exercise eye/timer, Playing controls, toasts, profile).
- [ ] **Keyboard** on Login/Registration: the focused field scrolls above the keyboard; buttons work with it open.
- [ ] **Swipe picker** in the exercise edit modal: wheels scroll, snap, highlight and save; reopening shows the saved value.
- [ ] **Themes:** light/dark and battery saver: every screen, header, tab bar, modal and push/pop background follow the palette; status bar icons readable; no white flash in dark mode. Check the Android 3-button nav bar scrim over the tab bar (Q11).
- [ ] **No player leaks:** enter/leave the Playing screen 10 times, then `require('./app/platform/audio').getLivePlayerCount()` in the debugger is 0 (or 1 right after a preview). No `[audio]` warnings.
- [ ] **Toasts** close cleanly (LayoutAnimation is only partly supported on the New Architecture; worst case no animation).
- [ ] **Firestore long polling:** if lists spin forever on some network, switch to `experimentalForceLongPolling: true` in `app/utils/firebase.ts` and note the device/network.

---

## 3. Open questions

| # | Question | Default if you don't decide | Affects |
|---|---|---|---|
| Q1 | **iOS bundle ID.** `com.trainingplantogether_cli` is invalid on Apple (no `_`), so iOS uses `com.trainingplantogether-cli` (+ `.dev` / `.preview`). Keep it or pick another? The app was never on the App Store, so changing it later only means re-registering in Firebase/Google/EAS | `com.trainingplantogether-cli` | `app.config.ts` (`IOS_BUNDLE_ID`), `e2e:ios` script, Firebase iOS apps |
| Q2 | **Android signing.** Old release builds were signed with the **public React Native debug keystore**. Is the app on Google Play with Play App Signing? Then import the old key or reset the upload key ([build.md §4](build.md)). **Don't let EAS generate a new production keystore before deciding** | none: blocks the production build | EAS credentials, Firebase SHA fingerprints |
| Q3 | **versionCode.** The last Play upload's `versionCode` (the old Gradle config multiplied by 1000 + ABI index). Set it with `eas build:version:set -p android` before the first production build | none: blocks the production upload | EAS remote versions |
| Q4 | **Session on upgrade.** If the upgrade-in-place test shows users get logged out, is one clean re-login acceptable (cached data is kept), or do we need a migration? | accept one re-login | release notes |
| Q5 | **Background cues.** Background cues come from notifications only; in-app sound and TTS don't play while locked. OK, or do you want in-app audio in the background? (Brings back iOS `UIBackgroundModes: audio`, which App Review may question) | notifications only | `app.config.ts`, `app/platform` |
| Q6 | **Exact alarms.** Without `SCHEDULE_EXACT_ALARM`, Android 12+ may deliver locked-phone cues late in deep doze (the on-screen timer is unaffected). Add it? On Android 14+ users must allow it in system settings; `USE_EXACT_ALARM` is likely not Play-eligible | not added | `app.config.ts` permissions, Play policy declaration |
| Q7 | **Notification icon.** Provide a monochrome white-on-transparent PNG (~96×96) for the Android notification small icon. Until then Android shows a plain square | no icon | `app.config.ts` expo-notifications `icon` |
| Q8 | **Voice picker.** Add a Settings entry to choose the TTS voice? The speech service already supports it | no picker (best English voice is chosen automatically) | Settings slice, SettingsScreen |
| Q9 | **Notification permission timing.** The prompt appears the first time the player opens, after a short explanation. Keep that, or ask earlier (e.g. after login)? | first player open | `use-background-cues.ts` / `background-session.ts` |
| Q10 | **iOS Live Activity.** iOS has no ongoing "workout in progress" notification (Android has). A Live Activity would need a native widget target: separate project? | not planned | iOS only |
| Q11 | **Android nav bar scrim.** If the system contrast scrim over the tab bar looks wrong in 3-button mode, add `expo-navigation-bar` (`enforceContrast: false`, style per theme)? | OS default scrim | `app/app.tsx`, `app.config.ts` |
| Q12 | **strictNullChecks.** Turning it on (114 errors today, across every area) would remove the Navigation 7 workarounds (explicit navigator `id`s, hand-typed `beforeRemove`). Schedule it after the release? | after release | `tsconfig.json`, all of `app/` |
| Q13 | **Firebase test account.** Which Firebase project and accounts should testing and Maestro use? Flow 02 writes and 05 deletes workouts, so not a personal account. Ideally an email/password account plus a Google account | none: needed for P0 auth/data tests and Maestro | `.env`, `E2E_EMAIL` / `E2E_PASSWORD` |
