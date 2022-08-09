import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DeleteWorkoutReducerType, GetWorkoutsReducerType, workoutAC } from './WorkoutActionCreators'
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
  error: '',
}

const onError = (state: WorkoutSliceType, { payload }: PayloadAction<string>) => {
  state.isLoading = false
  state.error = `Workout ${payload}`
}

const onLoading = (state: WorkoutSliceType) => {
  state.isLoading = true
}

const updateWorkout = (state, { payload }: PayloadAction<WorkoutType>) => {
  state.workouts = state.workouts.map(workout => (workout.uid === payload.uid ? payload : workout))
  state.workoutsInPlan = state.workoutsInPlan.map(workout => (workout.uid === payload.uid ? payload : workout))
  if (state.selectedWorkout.uid === payload.uid) {
    state.selectedWorkout = { ...state.selectedWorkout, ...payload }
  }
  state.isLoading = false
  state.error = ''
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
    },
  },
  extraReducers: {
    [workoutAC.getWorkouts.fulfilled.type]: (state, { payload }: PayloadAction<GetWorkoutsReducerType>) => {
      const isForPlan = payload.findBy === 'planUid'
      if (isForPlan) state.workoutsInPlan = payload.workouts
      else state.workouts = payload.workouts
      if (!payload.isInternet) state.deletedWorkoutUids = []
      state.isLoading = false
      state.error = ''
    },
    [workoutAC.deleteWorkout.fulfilled.type]: (state, { payload }: PayloadAction<DeleteWorkoutReducerType>) => {
      state.workouts = state.workouts.filter(workout => workout.uid !== payload.workoutUid)
      state.workoutsInPlan = state.workoutsInPlan.filter(workout => workout.uid !== payload.workoutUid)
      if (!payload.isInternet) state.deletedWorkoutUids.push(payload.workoutUid)
      state.isLoading = false
      state.error = ''
    },
    [workoutAC.addWorkout.fulfilled.type]: (state, { payload }: PayloadAction<WorkoutType>) => {
      state.workouts.push(payload)
      if (payload.plansUid[0]) state.workoutsInPlan.push(payload)
      state.isLoading = false
      state.error = ''
    },
    [workoutAC.getExerciseImages.fulfilled.type]: (state, action: PayloadAction<StoredExerciseImage[]>) => {
      state.exerciseImages = action.payload
      state.isLoading = false
      state.error = ''
    },
    [workoutAC.updateWorkout.fulfilled.type]: updateWorkout,
    [workoutAC.removeFromPlan.fulfilled.type]: updateWorkout,

    [workoutAC.getWorkouts.pending.type]: onLoading,
    [workoutAC.addWorkout.pending.type]: onLoading,
    [workoutAC.deleteWorkout.pending.type]: onLoading,
    [workoutAC.removeFromPlan.pending.type]: onLoading,

    [workoutAC.getWorkouts.rejected.type]: onError,
    [workoutAC.addWorkout.rejected.type]: onError,
    [workoutAC.updateWorkout.rejected.type]: onError,
    [workoutAC.deleteWorkout.rejected.type]: onError,
    [workoutAC.getExerciseImages.rejected.type]: onError,
  },
})
export const { errorWorkoutClear, clearWorkoutResults, updateSelectedWorkout } = workoutSlice.actions
export default workoutSlice.reducer
