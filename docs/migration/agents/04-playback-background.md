# A4: Workout playback and background

## Mission
Make the workout player (the timer, laps, rest periods, and cues) **accurate while the screen is locked or the app is in the background** without relying on the old Android foreground-service hack. This is the highest-risk part of the migration.

## Branch
`migration/a4-playback` (worktree `../tp-a4-playback`)

## Owns
`app/services/backgroundSession.ts`, `app/Hooks/usePlaying.tsx`, `app/Screens/PlayingScreen/**`

## Depends on
- A3's services. Build against the stubs, then rebase on A3 for full testing.
- D3 (rewrite vs. keep the foreground service).

## Context
- `BackgroundAction.tsx` starts `react-native-background-actions`, an Android foreground service that runs an endless 1-second loop just to keep the JS thread alive. It updates the notification title, description, colour, and a progress bar (`playTimer` / `duration`).
- The timer lives in `PlayTimerProvider.tsx` and `TimeObserver.tsx`. Playing state is in `usePlaying.tsx`: `idx`, `lap`, `updated: Date.now()`, vibration, sound, and TTS.
- The `linkingURI: 'yourSchemeHere://chat/jane'` value is template junk. Replace it with the real scheme and route, or drop it.

## Tasks (D3 = rewrite, the recommended option)
1. **Timer based on timestamps**
   - Store `startedAt`, `pausedAccumulatedMs`, and the planned segment schedule (exercise/rest durations from the workout). Derive the remaining time from `Date.now()` on every tick instead of counting ticks, so the timer stays correct after the app was suspended.
   - Re-sync on `AppState` changes back to `active`: work out which segment should be current, update `idx`/`lap`, and don't replay cues you missed.
   - Keep the tick UI (countdown circle, progress) driven by a 250–1000 ms interval while the app is in the foreground only.
2. **Background cues with `expo-notifications`**
   - When a segment starts, or the app goes to the background, schedule local notifications for upcoming segment boundaries ("Rest – 30s", "Next: Squats"), using the selected sound as the notification sound where the platform allows. Cancel and reschedule on pause, skip, edit, or finish.
   - Android: create a dedicated high-importance channel. Ask for `POST_NOTIFICATIONS` (Android 13+) the first time a workout starts, with a short explanation first. Ask A2 to add the permission.
   - iOS: ask for notification permission at the same point.
3. **`backgroundSession.ts`**: implement `startSession` / `updateSession` / `stopSession` as an **ongoing notification** showing the current exercise and progress (on Android, a sticky notification that is updated, not re-posted). If ongoing notifications aren't feasible on a platform, make the seam do nothing there and say so in your handoff.
4. **Delete** `BackgroundAction.tsx` and its usages. Move what it did into the service.
5. **Optional**: background audio for cues while in the background, which requires iOS `UIBackgroundModes: audio`. Only do this if notification sounds aren't enough, and agree it with A3 and A2 first.
6. **Tests**: unit-test the schedule calculation (a pure function: the workout plus elapsed ms gives the current segment and the time left), including pause/resume and skip.

## Tasks (if D3 = keep the foreground service)
Write a local config plugin (`plugins/withForegroundService.js`) that declares the `RNBackgroundActionsTask` service with `android:foregroundServiceType="specialUse"` or `"mediaPlayback"`, plus the matching `FOREGROUND_SERVICE_*` permissions, and verify Play policy compliance. Still do task 1, because iOS gets no background execution either way.

## Acceptance criteria
- [ ] Start a 10-minute workout, lock the phone for 3 minutes, and unlock: the current segment and remaining time are correct to within 1 second on both platforms.
- [ ] Notifications fire at segment boundaries while locked, with no duplicates after pause/resume or skip.
- [ ] Finishing or leaving the workout clears every scheduled notification and the ongoing notification.
- [ ] The results screen (`Results.tsx`, `PlayingReview`) records the same data as before.
- [ ] Vibration, sound, and TTS cues in the foreground behave the same as before (with A3's services).

## Handoff
Fill in `handoff/A4.md`: the approach taken, platform limits you found, permissions and plist entries you asked A2 for, and any changes to the playing-state shape.
