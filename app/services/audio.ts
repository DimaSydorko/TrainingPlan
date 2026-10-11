// Seam owned by A3 (docs/migration/README.md §6). Phase 0 stub.
// TODO(A3): implement with expo-audio (createAudioPlayer + setAudioModeAsync).
import { SoundType } from '../Utils/constants'

export type SoundPlayer = { play(): void; stop(): void; release(): void }

export function createSoundPlayer(type: SoundType): SoundPlayer {
  return {
    play() {
      console.warn(`[stub] audio.play(${type})`)
    },
    stop() {
      console.warn(`[stub] audio.stop(${type})`)
    },
    release() {},
  }
}

export function previewSound(type: SoundType): void {
  console.warn(`[stub] audio.previewSound(${type})`)
}

export async function configureAudioSession(opts: { duckOthers: boolean }): Promise<void> {
  console.warn(`[stub] audio.configureAudioSession(duckOthers=${opts.duckOthers})`)
}
