import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DeleteWorkoutReducerType, GetWorkoutsReducerType, workoutAC } from './workout-ac'
import { SelectedWorkoutType, StoredExerciseImage, WorkoutType } from '@utils/types'

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
  extraReducers: builder => {
    builder
      .addCase(workoutAC.getWorkouts.fulfilled.type, (state, { payload }: PayloadAction<GetWorkoutsReducerType>) => {
        state.workouts = payload.workouts || []
        // Pending offline deletes were pushed to Firestore by the thunk (was `!isInternet`, which
        // dropped them when the list loaded offline).
        if (payload.isInternet) state.deletedWorkoutUids = []
        state.isLoading = false
        state.error = ''
      })
      .addCase(
        workoutAC.deleteWorkouts.fulfilled.type,
        (state, { payload }: PayloadAction<DeleteWorkoutReducerType>) => {
          state.workouts = state.workouts.filter(workout => !payload.workoutUids.includes(workout.uid))
          if (!payload.isInternet) state.deletedWorkoutUids = [...state.deletedWorkoutUids, ...payload.workoutUids]
          state.isLoading = false
          state.error = ''
        }
      )
      .addCase(workoutAC.addWorkout.fulfilled.type, (state, { payload }: PayloadAction<WorkoutType>) => {
        state.workouts.push(payload)
        state.isLoading = false
        state.error = ''
      })
      .addCase(workoutAC.getExerciseImages.fulfilled.type, (state, action: PayloadAction<StoredExerciseImage[]>) => {
        state.exerciseImages = action.payload
        state.isLoading = false
        state.error = ''
      })
      .addCase(workoutAC.updateWorkout.fulfilled.type, (state, { payload }: PayloadAction<WorkoutType>) => {
        state.workouts = state.workouts.map(workout => (workout.uid === payload.uid ? payload : workout))
        if (state.selectedWorkout?.uid === payload.uid) {
          state.selectedWorkout = { ...state.selectedWorkout, ...payload }
        }
        state.isLoading = false
        state.error = ''
      })
      .addCase(workoutAC.getWorkouts.pending.type, onLoading)
      .addCase(workoutAC.addWorkout.pending.type, onLoading)
      .addCase(workoutAC.deleteWorkouts.pending.type, onLoading)
      .addCase(workoutAC.getWorkouts.rejected.type, onError)
      .addCase(workoutAC.addWorkout.rejected.type, onError)
      .addCase(workoutAC.updateWorkout.rejected.type, onError)
      .addCase(workoutAC.deleteWorkouts.rejected.type, onError)
      .addCase(workoutAC.getExerciseImages.rejected.type, onError)
  },
})
export const { errorWorkoutClear, clearWorkoutResults, updateSelectedWorkout, changeWorkoutsPosition } =
  workoutSlice.actions
export default workoutSlice.reducer
