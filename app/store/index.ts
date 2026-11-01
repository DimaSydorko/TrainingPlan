import { combineReducers, configureStore } from '@reduxjs/toolkit'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist'
import plansReducer from './plans-reducer/plans-slice'
import workoutReducer from './workout-reducer/workout-slice'
import { legacySettingsReducer } from './legacy-settings-reducer'
import { legacyUserReducer } from './legacy-user-reducer'

const rootReducer = combineReducers({
  userReducer: legacyUserReducer,
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
export const persistedStore = persistStore(store)

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
