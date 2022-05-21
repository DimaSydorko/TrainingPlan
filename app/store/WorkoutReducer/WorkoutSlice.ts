import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { workoutActionCreators } from './WorkoutActionCreators'
import { SelectedWorkoutType, StoredExerciseImage, WorkoutType } from '../../Utils/types'

interface WorkoutSlice {
  workouts: WorkoutType[]
  workoutsInPlan: WorkoutType[]
  selectedWorkout: SelectedWorkoutType | null
  exerciseImages: StoredExerciseImage[]
  isLoading: boolean
  error: string
}

const initialState: WorkoutSlice = {
  workouts: [],
  workoutsInPlan: [],
  exerciseImages: [],
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
    updateSelectedWorkout(state, { payload }: PayloadAction<SelectedWorkoutType>) {
      state.selectedWorkout = payload
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
      if (payload.workoutsInPlan) {
        state.workoutsInPlan = payload.workoutsInPlan.map(bd => {
          const stored = state.workoutsInPlan.find(st => st.uid === bd.uid)
          return stored.lastUpdated > bd.lastUpdated ? stored : bd
        })
      }
      if (payload.workouts) {
        state.workouts = payload.workouts.map(bd => {
          const stored = state.workouts.find(st => st.uid === bd.uid)
          return stored.lastUpdated > bd.lastUpdated ? stored : bd
        })
      }
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
    [workoutActionCreators.getExerciseImages.fulfilled.type]: (
      state,
      { payload }: PayloadAction<StoredExerciseImage[]>
    ) => {
      state.exerciseImages = payload
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
