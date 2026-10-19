import { colorsDark } from '@theme/colors'
import { THEME_MODE } from '@theme/themes.constants'
import { DEFAULT_SETTINGS, LEGACY_SETTINGS_SLICE_KEY } from './settings.constants'
import type { LegacySettings, Settings } from './settings.types'

export const mapLegacySettings = (legacy: LegacySettings): Settings => ({
  themeMode: legacy.colors?.primary === colorsDark.primary ? THEME_MODE.DARK : THEME_MODE.LIGHT,
  isVibration: legacy.isVibration ?? DEFAULT_SETTINGS.isVibration,
  isSaveBatteryMode: legacy.isSaveBatteryMode ?? DEFAULT_SETTINGS.isSaveBatteryMode,
  tts: { ...DEFAULT_SETTINGS.tts, ...legacy.tts },
  workout: { ...DEFAULT_SETTINGS.workout, ...legacy.workout },
  sound: { ...DEFAULT_SETTINGS.sound, ...legacy.sound },
})

export const parseLegacySettings = (rawLegacyRoot: string | null): Settings | null => {
  if (!rawLegacyRoot) return null

  try {
    const legacyRoot = JSON.parse(rawLegacyRoot) as Record<string, string | undefined>
    const rawLegacySettings = legacyRoot?.[LEGACY_SETTINGS_SLICE_KEY]

    if (!rawLegacySettings) return null

    const legacySettings = JSON.parse(rawLegacySettings) as LegacySettings | null

    return legacySettings && typeof legacySettings === 'object' ? mapLegacySettings(legacySettings) : null
  } catch {
    return null
  }
}
