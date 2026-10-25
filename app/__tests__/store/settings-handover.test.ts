jest.mock('@utils/firebase', () => ({ auth: {}, db: {}, rtdb: {} }))
jest.mock('firebase/auth', () => ({ onAuthStateChanged: jest.fn(() => () => {}) }))
jest.mock('firebase/firestore', () => ({}))
jest.mock('firebase/database', () => ({}))
jest.mock('@react-native-community/netinfo', () => ({ fetch: jest.fn() }))
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] })

const legacySettings = {
  colors: { primary: '#3c8739' },
  isVibration: false,
  isSaveBatteryMode: false,
  internet: { isOnline: true, lastBeOline: 1 },
  tts: { isDucking: true, volume: 0.4, rate: 0.7, pitch: 1.2 },
  workout: { weightStep: 2.5 },
  sound: { type: 'hop_bell.mp3', volume: 0.6 },
}
const AsyncStorage = require('@react-native-async-storage/async-storage')

AsyncStorage.setItem(
  'persist:root',
  JSON.stringify({
    settingsReducer: JSON.stringify(legacySettings),
    workoutReducer: JSON.stringify({ workouts: [], deletedWorkoutUids: [], sortedWorkoutUids: [] }),
    _persist: JSON.stringify({ version: -1, rehydrated: true }),
  })
)

const { persistedStore, store } = require('@store')
const { useSettingsStore } = require('@stores/settings/use-settings-store')

const waitFor = async (isReady: () => boolean) => {
  for (let attempt = 0; attempt < 50 && !isReady(); attempt++) {
    await new Promise<void>(resolve => setImmediate(resolve))
  }
}

describe('settings hand-over with both stores booted', () => {
  it('keeps the legacy settings in persist:root and writes the migrated settings-v1', async () => {
    await waitFor(() => persistedStore.getState().bootstrapped && useSettingsStore.persist.hasHydrated())

    store.dispatch({ type: 'plans/changeWorkoutsPosition', payload: ['w1'] })
    await persistedStore.flush()

    const legacyRoot = JSON.parse(await AsyncStorage.getItem('persist:root'))
    const settings = JSON.parse(await AsyncStorage.getItem('settings-v1'))

    expect(JSON.parse(legacyRoot.workoutReducer).sortedWorkoutUids).toEqual(['w1'])
    expect(JSON.parse(legacyRoot.settingsReducer)).toEqual(legacySettings)
    expect(settings.state).toEqual({
      themeMode: 'dark',
      isVibration: false,
      isSaveBatteryMode: false,
      tts: legacySettings.tts,
      workout: legacySettings.workout,
      sound: legacySettings.sound,
    })
    expect(useSettingsStore.getState().themeMode).toBe('dark')
  })
})
