// @ts-nocheck -- jest globals are untyped until A7 adds the Jest tooling (@types/jest); remove then.
// Guards the redux-persist config: changing it would drop the state stored by the pre-migration app.
jest.mock('../../Utils/firebase', () => ({ auth: {}, db: {}, rtdb: {} }))
jest.mock('firebase/auth', () => ({ onAuthStateChanged: jest.fn(() => () => {}) }))
jest.mock('firebase/firestore', () => ({}))
jest.mock('firebase/database', () => ({}))
jest.mock('@react-native-community/netinfo', () => ({ fetch: jest.fn() }))
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

// redux-persist v6 starts a 5 s rehydrate timeout it never clears; fake timers let Jest exit.
jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] })

// State as the pre-migration app wrote it (redux-persist v6 stores each slice as a JSON string).
const oldSettings = {
  colors: { theme: 'dark' },
  isVibration: false,
  isSaveBatteryMode: false,
  internet: { isOnline: true, lastBeOline: 1 },
  tts: { isDucking: true, volume: 0.4, rate: 0.7, pitch: 1.2 },
  workout: { weightStep: 2.5 },
  sound: { type: 'hop_bell', volume: 0.6 },
}
const oldWorkouts = { workouts: [{ uid: 'w1', name: 'Legs' }], deletedWorkoutUids: [], sortedWorkoutUids: ['w1'] }
const AsyncStorage = require('@react-native-async-storage/async-storage')
AsyncStorage.setItem(
  'persist:root',
  JSON.stringify({
    settingsReducer: JSON.stringify(oldSettings),
    workoutReducer: JSON.stringify(oldWorkouts),
    userReducer: JSON.stringify({ user: { uid: 'u1' }, data: null, isLoading: false, error: '' }),
    _persist: JSON.stringify({ version: -1, rehydrated: true }),
  })
)

const { persistConfig, persistedStore, store } = require('../index')

describe('redux-persist config', () => {
  it('keeps the pre-migration key, version and (absent) whitelist', () => {
    expect(persistConfig.key).toBe('root')
    expect(persistConfig).not.toHaveProperty('version')
    expect(persistConfig).not.toHaveProperty('whitelist')
    expect(persistConfig).not.toHaveProperty('blacklist')
  })

  it('keeps the same top-level state keys', () => {
    expect(Object.keys(store.getState()).filter(k => k !== '_persist').sort()).toEqual(
      ['plansReducer', 'publicationsReducer', 'settingsReducer', 'userReducer', 'workoutReducer'].sort()
    )
  })

  it('rehydrates state stored by the old app', async () => {
    for (let i = 0; i < 50 && !persistedStore.getState().bootstrapped; i++) {
      await new Promise(resolve => setImmediate(resolve))
    }
    const state = store.getState()
    expect(persistedStore.getState().bootstrapped).toBe(true)
    expect(state.settingsReducer).toEqual(oldSettings)
    expect(state.workoutReducer.workouts).toEqual(oldWorkouts.workouts)
    expect(state.workoutReducer.sortedWorkoutUids).toEqual(['w1'])
    expect(state.userReducer.user).toEqual({ uid: 'u1' })
  })
})
