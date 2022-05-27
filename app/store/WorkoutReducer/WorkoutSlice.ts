import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DeleteWorkoutReducerType, GetWorkoutsReducerType, workoutActionCreators } from './WorkoutActionCreators'
import { SelectedWorkoutType, StoredExerciseImage, WorkoutType } from '../../Utils/types'

export interface WorkoutSliceType {
  workouts: WorkoutType[]
  workoutsInPlan: WorkoutType[]
  selectedWorkout: SelectedWorkoutType | null
  exerciseImages: StoredExerciseImage[]
  deletedWorkoutUids: string[]
  isLoading: boolean
  error: string
}

const initialState: WorkoutSliceType = {
  workouts: [],
  workoutsInPlan: [],
  exerciseImages: [],
  deletedWorkoutUids: [],
  selectedWorkout: null,
  isLoading: false,
  error: ''
}

const onError = (state: WorkoutSliceType, { payload }: PayloadAction<string>) => {
  state.isLoading = false
  state.error = `Workout ${payload}`
}

const onLoading = (state: WorkoutSliceType) => {
  state.isLoading = true
}

export const workoutSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {
    errorWorkoutClear(state) {
      state.error = ''
    },
    updateSelectedWorkout(state, { payload }: PayloadAction<SelectedWorkoutType>) {
      state.selectedWorkout = payload
    },
    clearWorkoutResults(state) {
      state.error = ''
      state.isLoading = false
      state.selectedWorkout = initialState.selectedWorkout
      state.workouts = initialState.workouts
      state.workoutsInPlan = initialState.workoutsInPlan
      state.deletedWorkoutUids = initialState.deletedWorkoutUids
    }
  },
  extraReducers: {
    [workoutActionCreators.getWorkouts.fulfilled.type]: (state, { payload }: PayloadAction<GetWorkoutsReducerType>) => {
      const isForPlan = payload.findBy === 'planUid'
      if (isForPlan) state.workoutsInPlan = payload.workouts
      else state.workouts = payload.workouts
      if (!payload.isInternet) state.deletedWorkoutUids = []
      state.isLoading = false
      state.error = ''
    },
    [workoutActionCreators.updateWorkout.fulfilled.type]: (state, { payload }: PayloadAction<WorkoutType>) => {
      state.workouts = state.workouts.map(workout => (workout.uid === payload.uid ? payload : workout))
      state.workoutsInPlan = state.workoutsInPlan.map(workout => (workout.uid === payload.uid ? payload : workout))
      if (state.selectedWorkout.uid === payload.uid) {
        state.selectedWorkout = { ...state.selectedWorkout, ...payload }
      }
      state.isLoading = false
      state.error = ''
    },
    [workoutActionCreators.deleteWorkout.fulfilled.type]: (
      state,
      { payload }: PayloadAction<DeleteWorkoutReducerType>
    ) => {
      state.workouts = state.workouts.filter(workout => workout.uid !== payload.workoutUid)
      state.workoutsInPlan = state.workoutsInPlan.filter(workout => workout.uid !== payload.workoutUid)
      if (!payload.isInternet) state.deletedWorkoutUids.push(payload.workoutUid)
      state.isLoading = false
      state.error = ''
    },
    [workoutActionCreators.addWorkout.fulfilled.type]: (state, { payload }: PayloadAction<WorkoutType>) => {
      state.workouts.push(payload)
      if (payload.plansUid[0]) state.workoutsInPlan.push(payload)
      state.isLoading = false
      state.error = ''
    },
    [workoutActionCreators.getExerciseImages.fulfilled.type]: (state, action: PayloadAction<StoredExerciseImage[]>) => {
      state.exerciseImages = action.payload
      state.error = ''
    },
    [workoutActionCreators.getWorkouts.pending.type]: onLoading,
    [workoutActionCreators.addWorkout.pending.type]: onLoading,

    [workoutActionCreators.getWorkouts.rejected.type]: onError,
    [workoutActionCreators.addWorkout.rejected.type]: onError,
    [workoutActionCreators.updateWorkout.rejected.type]: onError,
    [workoutActionCreators.deleteWorkout.rejected.type]: onError,
    [workoutActionCreators.getExerciseImages.rejected.type]: onError
  }
})
export const { errorWorkoutClear, clearWorkoutResults, updateSelectedWorkout } = workoutSlice.actions
export default workoutSlice.reducer
