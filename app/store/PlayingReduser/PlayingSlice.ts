import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { WorkoutType } from '../../Utils/types'

interface PlayingSlice {
  workout: WorkoutType | null
}

const initialState: PlayingSlice = {
  workout: null
}

export const playingSlice = createSlice({
  name: 'playing',
  initialState,
  reducers: {
    startPlaying(state, { payload }: PayloadAction<WorkoutType>) {
      state.workout = payload
    },
    stopPlaying(state) {
      state.workout = null
    },
    clearPlayingResults(state) {
      state.workout = null
    }
  },
  extraReducers: {}
})
export const { startPlaying, clearPlayingResults, stopPlaying } = playingSlice.actions
export default playingSlice.reducer
