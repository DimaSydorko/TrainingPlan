import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { THEME_MODE, ThemeMode } from '@theme/themes.constants'
import { SoundType } from '@utils/constants'
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY, SETTINGS_STORE_VERSION } from './settings.constants'
import { settingsStorage } from './settings-storage'
import type { Settings } from './settings.types'

type SettingsState = Settings & {
  setThemeMode: (themeMode: ThemeMode) => void
  toggleVibration: () => void
  toggleSaveBatteryMode: () => void
  toggleTtsDucking: () => void
  setTtsVolume: (volume: number) => void
  setTtsPitch: (pitch: number) => void
  setTtsRate: (rate: number) => void
  setWeightStep: (weightStep: number) => void
  setSoundType: (type: SoundType) => void
  setSoundVolume: (volume: number) => void
  reset: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      ...DEFAULT_SETTINGS,
      setThemeMode: themeMode => set({ themeMode }),
      toggleVibration: () => set(state => ({ isVibration: !state.isVibration })),
      toggleSaveBatteryMode: () =>
        set(state => ({
          isSaveBatteryMode: !state.isSaveBatteryMode,
          themeMode: state.isSaveBatteryMode ? state.themeMode : THEME_MODE.DARK,
        })),
      toggleTtsDucking: () => set(state => ({ tts: { ...state.tts, isDucking: !state.tts.isDucking } })),
      setTtsVolume: volume => set(state => ({ tts: { ...state.tts, volume } })),
      setTtsPitch: pitch => set(state => ({ tts: { ...state.tts, pitch } })),
      setTtsRate: rate => set(state => ({ tts: { ...state.tts, rate } })),
      setWeightStep: weightStep => set(state => ({ workout: { ...state.workout, weightStep } })),
      setSoundType: type => set(state => ({ sound: { ...state.sound, type } })),
      setSoundVolume: volume => set(state => ({ sound: { ...state.sound, volume } })),
      reset: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      version: SETTINGS_STORE_VERSION,
      storage: createJSONStorage(() => settingsStorage),
      partialize: ({ themeMode, isVibration, isSaveBatteryMode, tts, workout, sound }): Settings => ({
        themeMode,
        isVibration,
        isSaveBatteryMode,
        tts,
        workout,
        sound,
      }),
    }
  )
)
