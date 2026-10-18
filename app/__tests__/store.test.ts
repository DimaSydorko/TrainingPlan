/**
 * The real store (app/store) persists to AsyncStorage under the `persist:root` key. This guards the
 * upgrade-in-place path: state saved by the old build must still rehydrate after the migration.
 */
import AsyncStorage from '@react-native-async-storage/async-storage'

const PERSIST_KEY = 'persist:root'

// redux-persist stores each top-level reducer as its own JSON string inside one JSON object.
function serialize(state: Record<string, unknown>) {
  const out: Record<string, string> = {}
  Object.entries(state).forEach(([k, v]) => (out[k] = JSON.stringify(v)))
  return JSON.stringify(out)
}

async function loadStore() {
  let mod: typeof import('@store')
  jest.isolateModules(() => {
    mod = require('@store')
  })
  const { store, persistedStore } = mod!
  await new Promise<void>(resolve => {
    if (persistedStore.getState().bootstrapped) return resolve()
    const unsubscribe = persistedStore.subscribe(() => {
      if (persistedStore.getState().bootstrapped) {
        unsubscribe()
        resolve()
      }
    })
  })
  return { store, persistedStore }
}

describe('store persistence', () => {
  // redux-persist arms a 5 s rehydrate timeout and a write interval; fake timers keep them from
  // holding the Jest process open. AsyncStorage's mock is promise-based, so it is unaffected.
  beforeEach(async () => {
    jest.useFakeTimers()
    await AsyncStorage.clear()
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('starts from the initial state when nothing is persisted', async () => {
    const { store } = await loadStore()
    const state = store.getState()
    expect(state.userReducer?.user).toBeNull()
    expect(state.settingsReducer?.sound.type).toBeDefined()
    expect(state.plansReducer).toBeDefined()
    expect(state.workoutReducer).toBeDefined()
    expect(state.publicationsReducer).toBeDefined()
  })

  it('rehydrates state persisted by a previous app version', async () => {
    await AsyncStorage.setItem(
      PERSIST_KEY,
      serialize({
        userReducer: { user: { uid: 'old-user' }, data: null, isLoading: false, error: '' },
        settingsReducer: { isVibration: false },
        _persist: { version: -1, rehydrated: true },
      })
    )

    const { store } = await loadStore()
    const state = store.getState()
    expect(state.userReducer?.user).toEqual({ uid: 'old-user' })
    expect(state.settingsReducer?.isVibration).toBe(false)
  })

  it('writes state changes back to AsyncStorage', async () => {
    const { store, persistedStore } = await loadStore()
    store.dispatch({ type: 'settings/onVibrationToggle' })
    await persistedStore.flush()

    const raw = await AsyncStorage.getItem(PERSIST_KEY)
    expect(raw).not.toBeNull()
    const settings = JSON.parse(JSON.parse(raw!).settingsReducer)
    expect(settings.isVibration).toBe(false)
  })
})
