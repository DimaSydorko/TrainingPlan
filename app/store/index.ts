import { combineReducers, configureStore } from '@reduxjs/toolkit'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { persistReducer } from 'redux-persist'
import userReducer from './UserReducer/UserSlice'
import plansReducer from './PlansReducer/PlansSlice'
import workoutReducer from './WorkoutReducer/WorkoutSlice'

const rootReducer = combineReducers({
  userReducer,
  plansReducer,
  workoutReducer
})

const persistConfig = {
  key: 'root',
  storage: AsyncStorage
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const setupStore = () => {
  return configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false })
  })
}

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
