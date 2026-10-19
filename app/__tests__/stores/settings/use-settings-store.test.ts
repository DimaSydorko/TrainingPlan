import AsyncStorage from '@react-native-async-storage/async-storage'
import { colorsDark, colorsLight } from '@theme/colors'
import { THEME_MODE } from '@theme/themes.constants'
import { SoundType } from '@utils/constants'
import {
  DEFAULT_SETTINGS,
  LEGACY_PERSIST_KEY,
  SETTINGS_STORAGE_KEY,
  SETTINGS_STORE_VERSION,
} from '@stores/settings/settings.constants'
import { useSettingsStore } from '@stores/settings/use-settings-store'
import { resetTestStores } from '../../utils/reset-test-stores'

const legacySettings = {
  colors: colorsDark,
  isVibration: false,
  isSaveBatteryMode: true,
  internet: { isOnline: true, lastBeOline: 1 },
  tts: { isDucking: true, volume: 0.4, rate: 0.7, pitch: 1.2 },
  workout: { weightStep: 2.5 },
  sound: { type: SoundType.HopBell, volume: 0.6 },
}

const serializeLegacyRoot = (settingsReducer: unknown) =>
  JSON.stringify({
    settingsReducer: JSON.stringify(settingsReducer),
    workoutReducer: JSON.stringify({ workouts: [] }),
    _persist: JSON.stringify({ version: -1, rehydrated: true }),
  })

const getPersistedSettings = async () => {
  const raw = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY)

  return raw ? JSON.parse(raw) : null
}

const flushStorageWrites = () => new Promise<void>(resolve => setImmediate(resolve))

const pickSettings = () => {
  const { themeMode, isVibration, isSaveBatteryMode, tts, workout, sound } = useSettingsStore.getState()

  return { themeMode, isVibration, isSaveBatteryMode, tts, workout, sound }
}

describe('useSettingsStore', () => {
  beforeEach(async () => {
    resetTestStores()
    await AsyncStorage.clear()
  })

  it('starts with system theme and default device settings', () => {
    expect(pickSettings()).toEqual(DEFAULT_SETTINGS)
    expect(DEFAULT_SETTINGS.themeMode).toBe(THEME_MODE.SYSTEM)
  })

  it('updates every setting through its action', () => {
    const actions = useSettingsStore.getState()

    actions.setThemeMode(THEME_MODE.DARK)
    actions.toggleVibration()
    actions.toggleTtsDucking()
    actions.setTtsVolume(0.3)
    actions.setTtsPitch(1.1)
    actions.setTtsRate(0.8)
    actions.setWeightStep(5)
    actions.setSoundType(SoundType.DoubleDing)
    actions.setSoundVolume(0.2)

    expect(pickSettings()).toEqual({
      ...DEFAULT_SETTINGS,
      themeMode: THEME_MODE.DARK,
      isVibration: false,
      tts: { isDucking: true, volume: 0.3, pitch: 1.1, rate: 0.8 },
      workout: { weightStep: 5 },
      sound: { type: SoundType.DoubleDing, volume: 0.2 },
    })
  })

  it('switches to the dark theme when the battery saver turns on and keeps the mode when it turns off', () => {
    useSettingsStore.getState().setThemeMode(THEME_MODE.LIGHT)

    useSettingsStore.getState().toggleSaveBatteryMode()

    expect(useSettingsStore.getState().isSaveBatteryMode).toBe(true)
    expect(useSettingsStore.getState().themeMode).toBe(THEME_MODE.DARK)

    useSettingsStore.getState().toggleSaveBatteryMode()

    expect(useSettingsStore.getState().isSaveBatteryMode).toBe(false)
    expect(useSettingsStore.getState().themeMode).toBe(THEME_MODE.DARK)
  })

  it('reset restores the defaults', () => {
    useSettingsStore.getState().setThemeMode(THEME_MODE.LIGHT)
    useSettingsStore.getState().toggleVibration()
    useSettingsStore.getState().setSoundVolume(0)

    useSettingsStore.getState().reset()

    expect(pickSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it('persists only the settings fields, never colors or actions', async () => {
    useSettingsStore.getState().setThemeMode(THEME_MODE.DARK)
    await flushStorageWrites()

    const persisted = await getPersistedSettings()

    expect(persisted.version).toBe(SETTINGS_STORE_VERSION)
    expect(Object.keys(persisted.state).sort()).toEqual(Object.keys(DEFAULT_SETTINGS).sort())
    expect(persisted.state.themeMode).toBe(THEME_MODE.DARK)
    expect(persisted.state).not.toHaveProperty('colors')
  })

  describe('legacy redux-persist hand-over', () => {
    it('keeps the defaults when nothing was persisted', async () => {
      await useSettingsStore.persist.rehydrate()

      expect(pickSettings()).toEqual(DEFAULT_SETTINGS)
    })

    it('imports the legacy dark palette as the dark theme and carries the other fields over', async () => {
      await AsyncStorage.setItem(LEGACY_PERSIST_KEY, serializeLegacyRoot(legacySettings))

      await useSettingsStore.persist.rehydrate()

      expect(pickSettings()).toEqual({
        themeMode: THEME_MODE.DARK,
        isVibration: false,
        isSaveBatteryMode: true,
        tts: legacySettings.tts,
        workout: legacySettings.workout,
        sound: legacySettings.sound,
      })
    })

    it('imports the legacy light palette as the light theme', async () => {
      await AsyncStorage.setItem(LEGACY_PERSIST_KEY, serializeLegacyRoot({ ...legacySettings, colors: colorsLight }))

      await useSettingsStore.persist.rehydrate()

      expect(useSettingsStore.getState().themeMode).toBe(THEME_MODE.LIGHT)
    })

    it('fills fields missing from the legacy settings with the defaults', async () => {
      await AsyncStorage.setItem(LEGACY_PERSIST_KEY, serializeLegacyRoot({ isVibration: false }))

      await useSettingsStore.persist.rehydrate()

      expect(pickSettings()).toEqual({ ...DEFAULT_SETTINGS, themeMode: THEME_MODE.LIGHT, isVibration: false })
    })

    it('writes the imported settings to its own key so the import runs once', async () => {
      await AsyncStorage.setItem(LEGACY_PERSIST_KEY, serializeLegacyRoot(legacySettings))

      await useSettingsStore.persist.rehydrate()
      const persisted = await getPersistedSettings()

      expect(persisted.state.themeMode).toBe(THEME_MODE.DARK)
      expect(await AsyncStorage.getItem(LEGACY_PERSIST_KEY)).not.toBeNull()
    })

    it('keeps the defaults when the legacy state is corrupt', async () => {
      await AsyncStorage.setItem(LEGACY_PERSIST_KEY, '{not json')

      await useSettingsStore.persist.rehydrate()

      expect(pickSettings()).toEqual(DEFAULT_SETTINGS)
    })

    it('keeps the defaults when the legacy state has no settings slice', async () => {
      await AsyncStorage.setItem(LEGACY_PERSIST_KEY, JSON.stringify({ workoutReducer: '{}' }))

      await useSettingsStore.persist.rehydrate()

      expect(pickSettings()).toEqual(DEFAULT_SETTINGS)
    })

    it('ignores the legacy state once its own key exists', async () => {
      await AsyncStorage.setItem(LEGACY_PERSIST_KEY, serializeLegacyRoot(legacySettings))
      await AsyncStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({
          state: { ...DEFAULT_SETTINGS, themeMode: THEME_MODE.LIGHT },
          version: SETTINGS_STORE_VERSION,
        })
      )

      await useSettingsStore.persist.rehydrate()

      expect(pickSettings()).toEqual({ ...DEFAULT_SETTINGS, themeMode: THEME_MODE.LIGHT })
    })
  })
})
