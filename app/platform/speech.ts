// Device seam implemented with expo-speech. Keep the exported signatures stable.
// Rate and pitch arrive in the old react-native-tts units stored in Settings and are mapped
// here (mediaUtils.legacyRateToExpo / legacyPitchToExpo), so saved settings sound the same.
import * as Speech from 'expo-speech'
import { beginDucking, configureAudioSession } from './audio'
import { legacyPitchToExpo, legacyRateToExpo, normalizeVolume, pickBestVoice } from './media-utils'

type Defaults = { rate?: number; pitch?: number; duck: boolean; voice?: string }
const defaults: Defaults = { duck: false }

// Voice: the user's choice (setSpeechDefaults({ voice })) wins, then the best English voice on
// the device, then the system default (undefined). Replaces the hard-coded iOS 'Moira' voice.
let autoVoice: string | undefined
let voiceLookup: Promise<void> | null = null
let voiceLookupAttempts = 0

function loadVoices(): void {
  if (voiceLookup || autoVoice || voiceLookupAttempts >= 3) return
  voiceLookupAttempts++
  voiceLookup = Speech.getAvailableVoicesAsync()
    .then(voices => {
      autoVoice = pickBestVoice(voices)
    })
    .catch(() => {})
    .finally(() => {
      // Android can return an empty list before the TTS engine is ready: allow a later retry.
      voiceLookup = null
    })
}

let utteranceId = 0
let endDucking: () => void = () => {}

export function speak(text: string, opts?: { rate?: number; pitch?: number; volume?: number }): void {
  if (!text) return
  loadVoices()
  // Like the old Tts.stop() before Tts.speak(): a new cue replaces the one being spoken.
  stopSpeaking()

  const id = ++utteranceId
  endDucking = defaults.duck ? beginDucking() : () => {}
  const finish = () => {
    if (id !== utteranceId) return // a newer utterance owns the ducking now
    endDucking()
    endDucking = () => {}
  }

  try {
    Speech.speak(text, {
      rate: legacyRateToExpo(opts?.rate ?? defaults.rate),
      pitch: legacyPitchToExpo(opts?.pitch ?? defaults.pitch),
      volume: normalizeVolume(opts?.volume),
      voice: defaults.voice || autoVoice,
      onDone: finish,
      onStopped: finish,
      onError: finish,
    })
  } catch (e) {
    console.warn('[speech] speak failed', e)
    finish()
  }
}

export function stopSpeaking(): void {
  utteranceId++
  endDucking()
  endDucking = () => {}
  Speech.stop().catch(() => {})
}

/**
 * Defaults applied by AppHelperProvider from Settings. `duck` switches the shared audio session
 * (cue sounds and speech) between ducking and mixing with other apps' audio.
 * `voice` is an expo-speech voice identifier; there is no Settings field for it yet.
 */
export function setSpeechDefaults(opts: { rate?: number; pitch?: number; duck?: boolean; voice?: string }): void {
  if (opts.rate !== undefined) defaults.rate = opts.rate
  if (opts.pitch !== undefined) defaults.pitch = opts.pitch
  if ('voice' in opts) defaults.voice = opts.voice || undefined
  if (opts.duck !== undefined) {
    defaults.duck = !!opts.duck
    configureAudioSession({ duckOthers: defaults.duck })
  }
  loadVoices()
}
