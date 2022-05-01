import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { workoutActionCreators } from './WorkoutActionCreators'
import { WorkoutType } from '../../Utils/types'

interface WorkoutSlice {
  workouts: WorkoutType[]
  workoutsInPlan: WorkoutType[]
  selectedWorkout: WorkoutType | null
  isLoading: boolean
  error: string
}

const initialState: WorkoutSlice = {
  workouts: [],
  workoutsInPlan: [],
  selectedWorkout: null,
  isLoading: false,
  error: ''
}

const onError = (state: WorkoutSlice, { payload }: PayloadAction<string>) => {
  state.isLoading = false
  state.error = `Workout ${payload}`
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
    selectWorkout(state, action: PayloadAction<WorkoutType>) {
      state.selectedWorkout = action.payload
    },
    clearWorkoutResults(state) {
      state.error = ''
      state.isLoading = false
      state.selectedWorkout = initialState.selectedWorkout
      state.workouts = initialState.workouts
      state.workoutsInPlan = initialState.workoutsInPlan
    }
  },
  extraReducers: {
    [workoutActionCreators.getWorkouts.fulfilled.type]: (
      state,
      { payload }: PayloadAction<{ workoutsInPlan?: WorkoutType[]; workouts?: WorkoutType[] }>
    ) => {
      if (payload.workoutsInPlan) state.workoutsInPlan = payload.workoutsInPlan
      if (payload.workouts) state.workouts = payload.workouts
      state.isLoading = false
      state.error = ''
    },
    [workoutActionCreators.updateWorkout.fulfilled.type]: (state, { payload }: PayloadAction<WorkoutType>) => {
      state.workouts = state.workouts.map(workout => (workout.uid === payload.uid ? payload : workout))
      state.workoutsInPlan = state.workoutsInPlan.map(workout => (workout.uid === payload.uid ? payload : workout))
      if (state.selectedWorkout.uid === payload.uid) {
        state.selectedWorkout = payload
      }
      state.isLoading = false
      state.error = ''
    },
    [workoutActionCreators.deleteWorkout.fulfilled.type]: (state, { payload }: PayloadAction<string>) => {
      state.workouts = state.workouts.filter(workout => workout.uid !== payload)
      state.workoutsInPlan = state.workoutsInPlan.filter(workout => workout.uid !== payload)
      state.isLoading = false
      state.error = ''
    },
    [workoutActionCreators.addWorkout.fulfilled.type]: (state, { payload }: PayloadAction<WorkoutType>) => {
      state.workouts.push(payload)
      if (payload.plansUid[0]) state.workoutsInPlan.push(payload)
      state.isLoading = false
      state.error = ''
    },
    [workoutActionCreators.getWorkouts.pending.type]: onLoading,
    [workoutActionCreators.addWorkout.pending.type]: onLoading,

    [workoutActionCreators.getWorkouts.rejected.type]: onError,
    [workoutActionCreators.addWorkout.rejected.type]: onError,
    [workoutActionCreators.updateWorkout.rejected.type]: onError,
    [workoutActionCreators.deleteWorkout.rejected.type]: onError
  }
})
export const { errorWorkoutClear, selectWorkout, clearWorkoutResults } = workoutSlice.actions
export default workoutSlice.reducer
