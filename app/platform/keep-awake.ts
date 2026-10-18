// Device seam implemented with expo-keep-awake. Keep the exported signatures stable.
// Battery-saver mode is decided by the caller (PlayingScreen skips activation when
// isSaveBatteryMode is on).
import * as KeepAwake from 'expo-keep-awake'

const DEFAULT_TAG = 'TrainingPlan'

export function activateKeepAwake(tag?: string): void {
  KeepAwake.activateKeepAwakeAsync(tag ?? DEFAULT_TAG).catch(e => {
    // Android rejects when there is no current activity (e.g. called while backgrounded).
    console.warn('[keepAwake] activate failed', e)
  })
}

export function deactivateKeepAwake(tag?: string): void {
  KeepAwake.deactivateKeepAwake(tag ?? DEFAULT_TAG).catch(() => {})
}
