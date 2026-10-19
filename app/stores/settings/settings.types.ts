import type { ThemeMode } from '@theme/themes.constants'
import { SoundType } from '@utils/constants'

export type TtsSettings = {
  isDucking: boolean
  volume: number
  rate: number
  pitch: number
}

export type WorkoutSettings = {
  weightStep: number
}

export type SoundSettings = {
  type: SoundType
  volume: number
}

export type Settings = {
  themeMode: ThemeMode
  isVibration: boolean
  isSaveBatteryMode: boolean
  tts: TtsSettings
  workout: WorkoutSettings
  sound: SoundSettings
}

export type LegacySettings = Partial<{
  colors: { primary?: string }
  isVibration: boolean
  isSaveBatteryMode: boolean
  tts: Partial<TtsSettings>
  workout: Partial<WorkoutSettings>
  sound: Partial<SoundSettings>
}>
