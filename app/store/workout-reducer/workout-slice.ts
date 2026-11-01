import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { workoutAC } from './workout-ac'
import { StoredExerciseImage } from '@utils/types'

export type WorkoutSliceType = {
  exerciseImages: StoredExerciseImage[]
}

const initialState: WorkoutSliceType = {
  exerciseImages: [],
}

export const workoutSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(
      workoutAC.getExerciseImages.fulfilled.type,
      (state, action: PayloadAction<StoredExerciseImage[]>) => {
        state.exerciseImages = action.payload
      }
    )
  },
})
export default workoutSlice.reducer
