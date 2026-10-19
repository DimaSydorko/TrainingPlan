import { THEME_MODE } from '@theme/themes.constants'
import { SoundType } from '@utils/constants'
import type { Settings } from './settings.types'

export const SETTINGS_STORAGE_KEY = 'settings-v1'

export const SETTINGS_STORE_VERSION = 1

export const LEGACY_PERSIST_KEY = 'persist:root'

export const LEGACY_SETTINGS_SLICE_KEY = 'settingsReducer'

export const DEFAULT_SETTINGS: Settings = {
  themeMode: THEME_MODE.SYSTEM,
  isVibration: true,
  isSaveBatteryMode: false,
  tts: {
    isDucking: false,
    pitch: 1.5,
    rate: 0.5,
    volume: 1,
  },
  workout: {
    weightStep: 1,
  },
  sound: {
    type: SoundType.Bell,
    volume: 1,
  },
}
