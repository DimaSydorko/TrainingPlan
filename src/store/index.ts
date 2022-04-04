import {combineReducers,  configureStore} from "@reduxjs/toolkit";
import userReducer from './UserReducer/UserSlice';
import plansReducer from './PlansReducer/PlansSlice';
import workoutReducer from './WorkoutReducer/WorkoutSlice';

const rootReducer = combineReducers({
  userReducer,
  plansReducer,
  workoutReducer,
})

export const setupStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  })
}

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']