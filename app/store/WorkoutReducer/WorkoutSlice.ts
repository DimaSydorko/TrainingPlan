import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DeleteWorkoutReducerType, GetWorkoutsReducerType, workoutAC } from './WorkoutAC'
import { SelectedWorkoutType, StoredExerciseImage, WorkoutType } from '../../Utils/types'

export interface WorkoutSliceType {
  workouts: WorkoutType[]
  selectedWorkout: SelectedWorkoutType | null
  exerciseImages: StoredExerciseImage[]
  deletedWorkoutUids: string[]
  sortedWorkoutUids: string[]
  isLoading: boolean
  error: string
}

const initialState: WorkoutSliceType = {
  workouts: [],
  exerciseImages: [],
  deletedWorkoutUids: [],
  selectedWorkout: null,
  sortedWorkoutUids: [],
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
    changeWorkoutsPosition(state, { payload }: PayloadAction<string[]>) {
      state.sortedWorkoutUids = payload
    },
    clearWorkoutResults(state) {
      state.error = ''
      state.isLoading = false
      state.selectedWorkout = initialState.selectedWorkout
      state.workouts = initialState.workouts
      state.deletedWorkoutUids = initialState.deletedWorkoutUids
      state.sortedWorkoutUids = initialState.sortedWorkoutUids
    },
  },
  extraReducers: {
    [workoutAC.getWorkouts.fulfilled.type]: (state, { payload }: PayloadAction<GetWorkoutsReducerType>) => {
      state.workouts = payload.workouts
      if (!payload.isInternet) state.deletedWorkoutUids = []
      state.isLoading = false
      state.error = ''
    },
    [workoutAC.deleteWorkouts.fulfilled.type]: (state, { payload }: PayloadAction<DeleteWorkoutReducerType>) => {
      state.workouts = state.workouts.filter(workout => !payload.workoutUids.includes(workout.uid))
      if (!payload.isInternet) state.deletedWorkoutUids = [...state.deletedWorkoutUids, ...payload.workoutUids]
      state.isLoading = false
      state.error = ''
    },
    [workoutAC.addWorkout.fulfilled.type]: (state, { payload }: PayloadAction<WorkoutType>) => {
      state.workouts.push(payload)
      state.isLoading = false
      state.error = ''
    },
    [workoutAC.getExerciseImages.fulfilled.type]: (state, action: PayloadAction<StoredExerciseImage[]>) => {
      state.exerciseImages = action.payload
      state.isLoading = false
      state.error = ''
    },
    [workoutAC.updateWorkout.fulfilled.type]: updateWorkout,

    [workoutAC.getWorkouts.pending.type]: onLoading,
    [workoutAC.addWorkout.pending.type]: onLoading,
    [workoutAC.deleteWorkouts.pending.type]: onLoading,

    [workoutAC.getWorkouts.rejected.type]: onError,
    [workoutAC.addWorkout.rejected.type]: onError,
    [workoutAC.updateWorkout.rejected.type]: onError,
    [workoutAC.deleteWorkouts.rejected.type]: onError,
    [workoutAC.getExerciseImages.rejected.type]: onError,
  },
})
export const { errorWorkoutClear, clearWorkoutResults, updateSelectedWorkout, changeWorkoutsPosition } =
  workoutSlice.actions
export default workoutSlice.reducer
