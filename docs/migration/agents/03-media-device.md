# A3: Media and device APIs

## Mission
Implement the audio, speech, and keep-awake seams with Expo modules, and make sure the workout sound and voice cues behave the same as before: they play over music, duck it, and respect the user's volume and rate settings.

## Branch
`migration/a3-media` (worktree `../tp-a3-media`)

## Owns
`app/services/audio.ts`, `app/services/speech.ts`, `app/services/keepAwake.ts`, `app/Hooks/useTTS.tsx`, `app/Hooks/AppHelperProvider.tsx`, `app/Components/AppSoundPicker/**`, `app/Screens/SettingsScreen/**`, `app/Assets/sounds/**`

## Context
- Sounds: `bell.mp3`, `digital_clock.mp3`, `double_ding.mp3`, `hop_bell.mp3` (A0 moved them to `app/Assets/sounds/`). The old code loaded them by name from `Sound.MAIN_BUNDLE` using `SoundType` values. Find the enum in `app/Utils/constants.ts` or `types.ts`.
- The old code called `Sound.setCategory('Playback', true)`, meaning iOS playback mixed with other audio.
- The old TTS used `iosVoiceId: 'com.apple.ttsbundle.Moira-compact'` and, on Android, `KEY_PARAM_VOLUME` with `STREAM_MUSIC`, `setDefaultRate`, `setDefaultPitch`, and `setDucking`.

## Tasks
1. **`audio.ts`** with `expo-audio`
   - A static map `SoundType → require('../Assets/sounds/x.mp3')`.
   - `createSoundPlayer(type)` returns `play/stop/release`. Use `createAudioPlayer` (the imperative API), because the seam is used outside components. Release players on unmount; no leaks.
   - `previewSound(type)` for the settings picker. A new preview stops the previous one.
   - `configureAudioSession({ duckOthers })` calls `setAudioModeAsync({ playsInSilentMode: true, interruptionMode: duckOthers ? 'duckOthers' : 'mixWithOthers', shouldPlayInBackground: <coordinate with A4> })`. Check the option names against the installed `expo-audio` version.
2. **`speech.ts`** with `expo-speech`
   - `speak(text, { rate, pitch, volume })`: stop the previous utterance first, as the old code did. Map the old rate and pitch ranges to expo-speech's ranges so existing saved settings sound the same.
   - Voice: replace the hard-coded Moira voice with this logic: if the user picked a voice, use it; otherwise use the best available English voice from `getAvailableVoicesAsync()`; otherwise use the system default. Optionally add a voice picker in Settings if it's simple.
   - Ducking: expo-speech has no ducking switch of its own, so use `configureAudioSession({ duckOthers })` from `audio.ts`.
3. **`keepAwake.ts`** with `expo-keep-awake` (`activateKeepAwakeAsync(tag)` / `deactivateKeepAwake(tag)`).
4. Update `useTTS.tsx`, `AppHelperProvider.tsx`, `AppSoundPicker.tsx`, and `SettingsScreen.tsx` to use the services, and remove the A0 stubs' warnings.
5. Tell A2 in your handoff if iOS needs `UIBackgroundModes: ['audio']`. Agree with A4 first on whether cues should play while the app is in the background.

## Acceptance criteria
- [ ] On both platforms: each of the 4 sounds previews in Settings, and the selected sound plays at every interval change during a workout.
- [ ] Voice cues speak the exercise names at the configured rate, pitch, and volume. Changing the settings applies immediately.
- [ ] With Spotify or YouTube Music playing, cues duck the music when ducking is on and mix with it when it's off. Music resumes afterwards.
- [ ] Sounds play with the iOS silent switch on.
- [ ] The screen stays awake on the playing screen unless battery-saver mode is on (`isSaveBatteryMode`).
- [ ] No players are left running after leaving the playing screen 10 times (check memory and logs).

## Handoff
Fill in `handoff/A3.md`: the rate/pitch mapping formula, the audio session settings you chose, and any requests to A2 or A4.
