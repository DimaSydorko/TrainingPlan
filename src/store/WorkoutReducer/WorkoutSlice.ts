import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {workoutActionCreators} from "./WorkoutActionCreators";
import {WorkoutPlanType} from "../../Utils/types";

interface WorkoutSlice {
  workouts: WorkoutPlanType[]
  selectedWorkout: WorkoutPlanType | null
  isLoading: boolean
  error: string
}

const initialState: WorkoutSlice = {
  workouts: [],
  selectedWorkout: null,
  isLoading: false,
  error: '',
}

const onError = (state: WorkoutSlice, {payload}: PayloadAction<string>) => {
  state.isLoading = false
  state.error = payload
}

const onLoading = (state: WorkoutSlice) => {
  state.isLoading = true
}

export const workoutSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {
    errorWorkoutClear(state) {
      state.error = ''
    },
    selectWorkout(state, action: PayloadAction<string>) {
      state.selectedWorkout = state.workouts.find(workout => workout.uid === action.payload) || null
    }
  },
  extraReducers: {
    [workoutActionCreators.getWorkouts.fulfilled.type]: (state, {payload}: PayloadAction<WorkoutPlanType[]>) => {
      state.workouts = payload
      state.isLoading = false
      state.error = ''
    },
    [workoutActionCreators.updateWorkout.fulfilled.type]: (state, {payload}: PayloadAction<WorkoutPlanType>) => {
      state.workouts = state.workouts.map(workout => {
        if (workout.uid === payload.uid) return payload
        return workout
      })
      state.isLoading = false
      state.error = ''
    },
    [workoutActionCreators.deleteWorkout.fulfilled.type]: (state, {payload}: PayloadAction<string>) => {
      state.workouts = state.workouts.filter(workout => workout.uid !== payload)
      state.isLoading = false
      state.error = ''
    },
    [workoutActionCreators.getWorkouts.pending.type]: onLoading,
    [workoutActionCreators.addWorkout.pending.type]: onLoading,
    [workoutActionCreators.deleteWorkout.pending.type]: onLoading,

    [workoutActionCreators.getWorkouts.rejected.type]: onError,
    [workoutActionCreators.addWorkout.rejected.type]: onError,
    [workoutActionCreators.deleteWorkout.rejected.type]: onError,
  }
})
export const {errorWorkoutClear, selectWorkout} = workoutSlice.actions
export default workoutSlice.reducer;