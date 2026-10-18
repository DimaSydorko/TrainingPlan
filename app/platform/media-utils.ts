// Pure helpers for the media seams (audio.ts, speech.ts).
// No Expo or React Native imports here, so the logic is unit-testable without native mocks.

export function clamp(value: number, min: number, max: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

/** Player / speech volume: 0..1, defaulting to full volume when unset. */
export function normalizeVolume(volume?: number): number {
  if (volume === undefined || volume === null) return 1
  return clamp(volume, 0, 1)
}

/**
 * Settings stored a react-native-tts rate (slider 0.1..0.9, default 0.5).
 *
 * - iOS, react-native-tts: AVSpeechUtterance.rate = r (AVSpeechUtteranceDefaultSpeechRate is 0.5).
 *   expo-speech: AVSpeechUtterance.rate = rate * AVSpeechUtteranceDefaultSpeechRate = rate * 0.5.
 * - Android, react-native-tts: setDefaultRate(r) called TextToSpeech.setSpeechRate(r * 2).
 *   expo-speech: TextToSpeech.setSpeechRate(rate).
 *
 * Both platforms therefore give: expoRate = 2 * r. 0.5 (old default) becomes 1.0 (normal speed).
 */
export const LEGACY_RATE_MIN = 0.1
export const LEGACY_RATE_MAX = 0.9
export function legacyRateToExpo(rate?: number): number {
  if (rate === undefined || rate === null || Number.isNaN(rate)) return 1
  return clamp(rate, 0.05, 1) * 2
}

/**
 * Pitch was passed straight through by react-native-tts (iOS pitchMultiplier, Android setPitch),
 * and expo-speech does the same, so the value is kept. Clamped to the iOS pitchMultiplier range
 * 0.5..2.0, which is also the Settings slider range.
 */
export function legacyPitchToExpo(pitch?: number): number {
  if (pitch === undefined || pitch === null || Number.isNaN(pitch)) return 1
  return clamp(pitch, 0.5, 2)
}

export type AudioModeInput = { duckOthers: boolean }
export type AudioModeOutput = {
  playsInSilentMode: boolean
  interruptionMode: 'mixWithOthers' | 'duckOthers'
  shouldPlayInBackground: boolean
  allowsRecording: boolean
  shouldRouteThroughEarpiece: boolean
}

/**
 * The audio session used by cue sounds and speech.
 * - playsInSilentMode: cues must be heard with the iOS silent switch on (old 'Playback' category).
 * - interruptionMode: mix with music, or duck it while a cue plays when the user enabled ducking.
 * - shouldPlayInBackground: false. The workout keeps running from timestamps and cues while
 *   the app is in the background come from expo-notifications, not from in-app audio.
 */
export function buildAudioMode({ duckOthers }: AudioModeInput): AudioModeOutput {
  return {
    playsInSilentMode: true,
    interruptionMode: duckOthers ? 'duckOthers' : 'mixWithOthers',
    shouldPlayInBackground: false,
    allowsRecording: false,
    shouldRouteThroughEarpiece: false,
  }
}

/** Seconds (expo-audio) to milliseconds, or undefined while the source is not loaded yet. */
export function durationToMs(isLoaded: boolean | undefined, durationSec: number | undefined): number | undefined {
  if (!isLoaded) return undefined
  if (typeof durationSec !== 'number' || !Number.isFinite(durationSec) || durationSec <= 0) return undefined
  return Math.round(durationSec * 1000)
}

export type VoiceLike = { identifier: string; name?: string; language: string; quality?: string }

/**
 * Picks the best English voice, replacing the old hard-coded iOS 'Moira' voice.
 * Returns undefined when there is no English voice, meaning: use the system default.
 *
 * Preference: enhanced quality, offline (not '-network'), en-US / en-GB, then any English.
 * iOS novelty voices (Bells, Bad News, Zarvox, ...) and Eloquence voices are excluded.
 */
export function pickBestVoice(voices: VoiceLike[] | undefined | null): string | undefined {
  if (!voices || voices.length === 0) return undefined
  const candidates = voices.filter(v => {
    if (!v || !v.identifier || !v.language) return false
    if (!/^en([-_]|$)/i.test(v.language)) return false
    const id = v.identifier.toLowerCase()
    if (id.includes('speech.synthesis.voice')) return false // iOS novelty voices
    if (id.includes('eloquence')) return false
    return true
  })
  if (candidates.length === 0) return undefined

  const score = (v: VoiceLike): number => {
    const id = v.identifier.toLowerCase()
    const lang = v.language.toLowerCase().replace('_', '-')
    let s = 0
    if (v.quality === 'Enhanced') s += 100
    if (id.includes('network')) s -= 50 // needs internet on Android
    if (lang === 'en-us') s += 20
    else if (lang === 'en-gb') s += 15
    else if (lang === 'en-ie' || lang === 'en-au') s += 10
    if (id.includes('premium') || id.includes('siri')) s += 5
    return s
  }

  let best = candidates[0]
  let bestScore = score(best)
  for (const v of candidates.slice(1)) {
    const s = score(v)
    if (s > bestScore) {
      best = v
      bestScore = s
    }
  }
  return best.identifier
}
