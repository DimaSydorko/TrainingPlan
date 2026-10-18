// Seam owned by A3 (docs/migration/README.md §6), implemented with expo-audio.
// Uses the imperative createAudioPlayer API because callers live outside components
// (usePlaying keeps one player per playing screen). Every created player must be released.
import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio'
import { SoundType } from '../Utils/constants'
import { buildAudioMode, durationToMs, normalizeVolume } from './mediaUtils'

export type SoundPlayer = {
  play(): void
  stop(): void
  release(): void
  /** Length of the sound in ms. undefined until the source has loaded (or after release). */
  readonly durationMs?: number
}

// SoundType values are the mp3 file names (app/Utils/constants.ts). Metro needs static requires.
const SOUND_SOURCES: Record<SoundType, number> = {
  [SoundType.Bell]: require('../Assets/sounds/bell.mp3'),
  [SoundType.DigitalClock]: require('../Assets/sounds/digital_clock.mp3'),
  [SoundType.DoubleDing]: require('../Assets/sounds/double_ding.mp3'),
  [SoundType.HopBell]: require('../Assets/sounds/hop_bell.mp3'),
}
// 20 s of digital silence. Played (inaudibly) while speech is spoken with ducking on, so that
// expo-audio takes audio focus (Android) / activates the duckOthers session (iOS). expo-speech
// has no ducking of its own. See beginDucking().
const SILENCE_SOURCE: number = require('../Assets/sounds/silence.mp3')

function sourceFor(type: SoundType | undefined): number {
  return (type && SOUND_SOURCES[type]) || SOUND_SOURCES[SoundType.Bell]
}

let livePlayers = 0
/** Number of players created and not yet released. For leak checks in development. */
export function getLivePlayerCount(): number {
  return livePlayers
}

function newPlayer(source: number, volume?: number): AudioPlayer {
  const player = createAudioPlayer(source, { keepAudioSessionActive: false })
  player.volume = normalizeVolume(volume)
  livePlayers++
  return player
}

function removePlayer(player: AudioPlayer) {
  livePlayers = Math.max(0, livePlayers - 1)
  try {
    player.pause()
  } catch {}
  try {
    player.remove()
  } catch {}
}

/** Starts from the beginning. A finished expo-audio player stays at its end until seeked. */
function playFromStart(player: AudioPlayer, isReleased: () => boolean) {
  let atStart = false
  try {
    atStart = !player.playing && player.currentTime === 0
  } catch {}
  if (atStart) {
    player.play()
    return
  }
  player
    .seekTo(0)
    .catch(() => {})
    .then(() => {
      if (!isReleased()) player.play()
    })
}

export function createSoundPlayer(type: SoundType, opts?: { volume?: number }): SoundPlayer {
  const player = newPlayer(sourceFor(type), opts?.volume)
  let released = false
  const isReleased = () => released

  return {
    play() {
      if (released) return
      try {
        playFromStart(player, isReleased)
      } catch (e) {
        console.warn('[audio] play failed', e)
      }
    },
    stop() {
      if (released) return
      try {
        player.pause()
        player.seekTo(0).catch(() => {})
      } catch {}
    },
    release() {
      if (released) return
      released = true
      removePlayer(player)
    },
    get durationMs() {
      if (released) return undefined
      try {
        return durationToMs(player.isLoaded, player.duration)
      } catch {
        return undefined
      }
    },
  }
}

let previewPlayer: AudioPlayer | null = null

function releasePreview() {
  if (!previewPlayer) return
  const p = previewPlayer
  previewPlayer = null
  removePlayer(p)
}

/** Plays a sound once (Settings, sound picker). A new preview stops the previous one. */
export function previewSound(type: SoundType, opts?: { volume?: number }): void {
  releasePreview()
  try {
    const player = newPlayer(sourceFor(type), opts?.volume)
    previewPlayer = player
    player.addListener('playbackStatusUpdate', status => {
      if (status.didJustFinish && previewPlayer === player) releasePreview()
    })
    player.play()
  } catch (e) {
    console.warn('[audio] preview failed', e)
    releasePreview()
  }
}

let duckOthers = false

/**
 * Sets the app audio session for cue sounds and speech (see buildAudioMode in mediaUtils.ts):
 * plays with the iOS silent switch on, and mixes with or ducks other apps' audio.
 * Never rejects; failures are logged.
 */
export async function configureAudioSession(opts: { duckOthers: boolean }): Promise<void> {
  duckOthers = !!opts.duckOthers
  try {
    await setAudioModeAsync(buildAudioMode({ duckOthers }))
  } catch (e) {
    console.warn('[audio] setAudioModeAsync failed', e)
  }
}

/**
 * Ducks other apps' audio until the returned function is called (used around speech).
 * No-op when the session is not in duckOthers mode. The returned function is idempotent.
 * Implemented by playing a silent clip: expo-audio requests transient "may duck" audio focus on
 * Android and activates the duckOthers session on iOS while a player plays, and gives focus back
 * / deactivates with notifyOthersOnDeactivation once nothing plays, so music comes back up.
 * The player is removed (not just paused) at the end so it can never be auto-resumed.
 */
export function beginDucking(): () => void {
  if (!duckOthers) return () => {}
  let player: AudioPlayer | null = null
  try {
    player = newPlayer(SILENCE_SOURCE, 1)
    const p = player
    p.addListener('playbackStatusUpdate', status => {
      // Safety net for very long utterances: the clip is finite, focus is returned when it ends.
      if (status.didJustFinish) end()
    })
    p.play()
  } catch (e) {
    console.warn('[audio] beginDucking failed', e)
  }
  function end() {
    if (!player) return
    const p = player
    player = null
    removePlayer(p)
  }
  return end
}
