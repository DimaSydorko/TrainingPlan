import { createAsyncThunk } from '@reduxjs/toolkit'
import NetInfo from '@react-native-community/netinfo'
import { RootState } from '../index'
import { FB_Collection_Workouts, FB_Database } from '../../Utils/firebase'
import { FirebaseDatabase, QUERY_LIMIT } from '../../Utils/constants'
import { StoredExerciseImage, WorkoutType } from '../../Utils/types'
import { getCurrentTime, nanoid } from '../../Utils'

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
    const uid: string = userReducer.user.uid
    let workouts: WorkoutType[] = []
    try {
      const net = await NetInfo.fetch()
      const isInternet = net.isConnected
      if (isInternet) {
        const snapshot = await FB_Collection_Workouts.where('ownerUid', '==', uid).limit(QUERY_LIMIT).get()
        snapshot.docs.forEach(doc => workouts.push({ ...doc.data(), uid: doc.id } as WorkoutType))

        //Synchronize data local Storage & Database
        const newWorkouts: WorkoutType[] = workouts
          ?.filter(st => !workoutReducer.deletedWorkoutUids?.includes(st.uid))
          ?.map(bd => {
            const stored = workoutReducer.workouts?.find(st => st.uid === bd.uid)
            if (!stored) return bd

            const { uid, ...storedWorkout } = stored
            const isStoredUpdated = (stored?.lastUpdated || 0) > (bd?.lastUpdated || 0)
            if (isStoredUpdated) FB_Collection_Workouts.doc(uid).set(storedWorkout)
            return isStoredUpdated ? stored : bd
          })

        //delete workouts in Database if it was deleted in Storage
        workoutReducer.deletedWorkoutUids?.forEach(deletedUid => FB_Collection_Workouts.doc(deletedUid).delete())

        //if workout Stored but didn't exist in Database
        workoutReducer.workouts?.forEach(workout => {
          if (!newWorkouts.find(st => st.uid === workout.uid)) {
            newWorkouts.push(workout)
            const { uid, ...storedWorkout } = workout
            FB_Collection_Workouts.doc(uid).set(storedWorkout)
          }
        })
        return { workouts: newWorkouts, isInternet } as GetWorkoutsReducerType
      }

      workouts = workoutReducer?.workouts
      return { workouts, isInternet } as GetWorkoutsReducerType
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  }),

  addWorkout: createAsyncThunk('workout/addWorkout', async (workout: WorkoutType, thunkAPI) => {
    const { userReducer } = thunkAPI.getState() as RootState
    const ownerUid: string = userReducer.user.uid

    workout.lastUpdated = getCurrentTime()
    workout.uid = workout?.uid || nanoid()
    workout.ownerUid = ownerUid
    const { uid, ...newWorkout } = workout
    try {
      const net = await NetInfo.fetch()
      if (net.isConnected) {
        await FB_Collection_Workouts.doc(uid).set(newWorkout)
      }

      return workout
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  }),

  updateWorkout: createAsyncThunk('workout/updateWorkout', async (props: WorkoutType, thunkAPI) => {
    props.lastUpdated = getCurrentTime()
    const { uid, ...workout } = props
    try {
      const net = await NetInfo.fetch()
      if (net.isConnected) {
        await FB_Collection_Workouts.doc(uid).update(workout)
      }
      return props
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  }),

  deleteWorkouts: createAsyncThunk('workout/deleteWorkouts', async (workoutUids: string[], thunkAPI) => {
    try {
      const net = await NetInfo.fetch()
      const isInternet = net.isConnected
      if (isInternet) {
        await workoutUids.forEach(uid => {
          FB_Collection_Workouts.doc(uid).delete()
        })
      }
      return { workoutUids, isInternet } as DeleteWorkoutReducerType
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  }),

  getExerciseImages: createAsyncThunk('workout/getExerciseImages', async (_, thunkAPI) => {
    try {
      let exerciseImages: StoredExerciseImage[] = []
      const net = await NetInfo.fetch()
      if (net.isConnected) {
        const snapshot = await FB_Database.ref(FirebaseDatabase.ExerciseImages).get()
        exerciseImages = Array.isArray(snapshot.val()) ? snapshot.val() : ([] as StoredExerciseImage[])
      }
      return exerciseImages
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  }),
}
