import { createAsyncThunk } from '@reduxjs/toolkit'
import NetInfo from '@react-native-community/netinfo'
import { doc, getDocs, limit, query, setDoc, updateDoc, where } from 'firebase/firestore'
import { get, ref } from 'firebase/database'
import type { RootState } from '../index'
import { rtdb, workoutsCollection } from '../../Utils/firebase'
import { FirebaseDatabase, QUERY_LIMIT } from '../../Utils/constants'
import { StoredExerciseImage, WorkoutType } from '../../Utils/types'
import { getCurrentTime, nanoid } from '../../Utils'
import { errorMessage, ownedBy, splitUid, syncWithRemote } from '../sync'
import { pushSync } from '../firestore'

export type GetWorkoutsReducerType = {
  isInternet: boolean
  workouts?: WorkoutType[]
}

export type DeleteWorkoutReducerType = {
  workoutUids: string[]
  isInternet: boolean
}

export const workoutAC = {
  getWorkouts: createAsyncThunk('workout/getWorkouts', async (_, thunkAPI) => {
    const { workoutReducer, userReducer } = thunkAPI.getState() as RootState
    const userUid: string = userReducer.user.uid
    try {
      const net = await NetInfo.fetch()
      const isInternet = net.isConnected
      if (isInternet) {
        const snapshot = await getDocs(query(workoutsCollection, where('ownerUid', '==', userUid), limit(QUERY_LIMIT)))
        const workouts = snapshot.docs.map(d => ({ ...d.data(), uid: d.id }) as WorkoutType)

        // Synchronize local storage and the database
        const { merged, toUpload, toDelete } = syncWithRemote(
          workouts,
          ownedBy(workoutReducer.workouts, userUid),
          workoutReducer.deletedWorkoutUids
        )
        pushSync(workoutsCollection, toUpload, toDelete)
        return { workouts: merged, isInternet } as GetWorkoutsReducerType
      }

      return { workouts: workoutReducer?.workouts || [], isInternet } as GetWorkoutsReducerType
    } catch (e) {
      return thunkAPI.rejectWithValue(errorMessage(e))
    }
  }),

  addWorkout: createAsyncThunk('workout/addWorkout', async (props: WorkoutType, thunkAPI) => {
    const { userReducer } = thunkAPI.getState() as RootState
    const workout: WorkoutType = {
      ...props,
      lastUpdated: getCurrentTime(),
      uid: props?.uid || nanoid(),
      ownerUid: userReducer.user.uid,
    }
    const { uid, data } = splitUid(workout)
    try {
      const net = await NetInfo.fetch()
      if (net.isConnected) {
        await setDoc(doc(workoutsCollection, uid), data)
      }
      return workout
    } catch (e) {
      return thunkAPI.rejectWithValue(errorMessage(e))
    }
  }),

  updateWorkout: createAsyncThunk('workout/updateWorkout', async (props: WorkoutType, thunkAPI) => {
    const updated: WorkoutType = { ...props, lastUpdated: getCurrentTime() }
    const { uid, data } = splitUid(updated)
    try {
      const net = await NetInfo.fetch()
      if (net.isConnected) {
        await updateDoc(doc(workoutsCollection, uid), data)
      }
      return updated
    } catch (e) {
      return thunkAPI.rejectWithValue(errorMessage(e))
    }
  }),

  deleteWorkouts: createAsyncThunk('workout/deleteWorkouts', async (workoutUids: string[], thunkAPI) => {
    try {
      const net = await NetInfo.fetch()
      const isInternet = net.isConnected
      if (isInternet) {
        // Not awaited, as before: the list updates at once and Firestore finishes the deletes
        // in the background (its promise resolves only on server ack).
        pushSync(workoutsCollection, [], workoutUids)
      }
      return { workoutUids, isInternet } as DeleteWorkoutReducerType
    } catch (e) {
      return thunkAPI.rejectWithValue(errorMessage(e))
    }
  }),

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
      return thunkAPI.rejectWithValue(errorMessage(e))
    }
  }),
}
