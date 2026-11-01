import { createAsyncThunk } from '@reduxjs/toolkit'
import NetInfo from '@react-native-community/netinfo'
import { get, ref } from 'firebase/database'
import { rtdb } from '@utils/firebase'
import { FirebaseDatabase } from '@utils/constants'
import { StoredExerciseImage } from '@utils/types'

export const workoutAC = {
  getExerciseImages: createAsyncThunk('workout/getExerciseImages', async (_, thunkAPI) => {
    try {
      let exerciseImages: StoredExerciseImage[] = []
      const net = await NetInfo.fetch()
      if (net.isConnected) {
        const snapshot = await get(ref(rtdb, FirebaseDatabase.ExerciseImages))
        const value = snapshot.val()
        exerciseImages = Array.isArray(value) ? value : []
      }
      return exerciseImages
    } catch (e) {
      return thunkAPI.rejectWithValue(e instanceof Error ? e.message : String(e))
    }
  }),
}
