/**
 * Test store helpers. `createTestStore` builds a store from the real slice reducers but without
 * redux-persist, so tests are synchronous and isolated. Pass `preloadedState` to start from a
 * specific state (e.g. a logged-in user or a dark theme).
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import userReducer from '@store/user-reducer/user-slice'
import plansReducer from '@store/plans-reducer/plans-slice'
import workoutReducer from '@store/workout-reducer/workout-slice'
import settingsReducer from '@store/settings-reducer/settings-slice'
import publicationsReducer from '@store/publications-reducer/publications-slice'
import type { Persistor } from 'redux-persist'
import type { RootState } from '@store'

export const testRootReducer = combineReducers({
  userReducer,
  plansReducer,
  workoutReducer,
  settingsReducer,
  publicationsReducer,
})

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] }

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function deepMerge<T>(base: T, patch: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(patch)) return (patch === undefined ? base : patch) as T
  const out: Record<string, unknown> = { ...base }
  Object.entries(patch).forEach(([key, value]) => {
    out[key] = deepMerge((base as Record<string, unknown>)[key], value)
  })
  return out as T
}

/** Initial state of every slice, as the reducers define it. */
export function getInitialState(): RootState {
  return testRootReducer(undefined, { type: '@@test/INIT' }) as RootState
}

/** `preloadedState` is deep-merged over each slice's initial state, so partial slices are fine. */
export function createTestStore(preloadedState?: DeepPartial<RootState>) {
  return configureStore({
    reducer: testRootReducer,
    preloadedState: deepMerge(getInitialState(), preloadedState),
    middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false }),
  })
}

export type TestStore = ReturnType<typeof createTestStore>

/**
 * A persistor that reports itself as already rehydrated, for rendering `<PersistGate>` with a
 * store that has no persisted reducer.
 */
export function createBootstrappedPersistor(): Persistor {
  const state = { bootstrapped: true, registry: [] as string[] }
  return {
    subscribe: () => () => {},
    getState: () => state,
    dispatch: action => action,
    persist: () => {},
    purge: async (): Promise<unknown> => undefined,
    flush: async (): Promise<unknown> => undefined,
    pause: () => {},
  }
}
