import {combineReducers,  configureStore} from "@reduxjs/toolkit";
import userReducer from './reducers/UserReducer/UserSlice';
import plansReducer from './reducers/PlansReducer/PlansSlice';
import workoutReducer from './reducers/WorkoutReducer/WorkoutSlice';

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