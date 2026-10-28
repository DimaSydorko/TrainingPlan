import { combineReducers, configureStore } from '@reduxjs/toolkit'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist'
import userReducer from './user-reducer/user-slice'
import plansReducer from './plans-reducer/plans-slice'
import workoutReducer from './workout-reducer/workout-slice'
import { listenToAuthChanges } from './user-reducer/auth-listener'
import { legacySettingsReducer } from './legacy-settings-reducer'

const rootReducer = combineReducers({
  userReducer,
  plansReducer,
  workoutReducer,
  settingsReducer: legacySettingsReducer,
})

// Must stay identical to the pre-migration config (key 'root', no version = -1, no whitelist:
// the whole state is persisted) so state stored by the old app rehydrates. If the stored shape
// ever has to change, add `version` + `migrate: createMigrate(...)` instead of changing the key.
export const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const setupStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: persistedReducer,
    preloadedState: preloadedState as ReturnType<typeof persistedReducer>,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        // redux-persist actions carry functions (register, rehydrate callbacks).
        serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
        // The exercise image catalogue is large; don't let the dev-only check slow every action.
        immutableCheck: { ignoredPaths: ['workoutReducer.exerciseImages'] },
      }),
  })
}

export const store = setupStore()
// Start syncing with Firebase Auth only after rehydration, so the persisted user is known.
export const persistedStore = persistStore(store, null, () => {
  listenToAuthChanges(store)
})

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
