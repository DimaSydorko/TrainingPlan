import { combineReducers, configureStore } from '@reduxjs/toolkit'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { persistReducer, persistStore } from 'redux-persist'
import { LogBox } from 'react-native'
import userReducer from './UserReducer/UserSlice'
import plansReducer from './PlansReducer/PlansSlice'
import workoutReducer from './WorkoutReducer/WorkoutSlice'
import settingsReducer from './SettingsReducer/SettingsSlice'
import publicationsReducer from './PublicationsReducer/PublicationsSlice'

const rootReducer = combineReducers({
  userReducer,
  plansReducer,
  workoutReducer,
  settingsReducer,
  publicationsReducer,
})

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const setupStore = () => {
  return configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false }),
  })
}

export const store = setupStore()
export const persistedStore = persistStore(store)

LogBox.ignoreLogs([
  "AsyncStorage has been extracted from react-native core and will be removed in a future release. It can now be installed and imported from '@react-native-async-storage/async-storage' instead of 'react-native'. See https://github.com/react-native-async-storage/async-storage",
])

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
