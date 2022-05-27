import { createAsyncThunk } from '@reduxjs/toolkit'
import NetInfo from '@react-native-community/netinfo'
import { RootState } from '../index'
import { plansActionCreators } from '../PlansReducer/PlansActionCreators'
import { FB_Collection_Workouts, FB_Database } from '../../Utils/firebase'
import { FirebaseDatabase, QUERY_LIMIT } from '../../Utils/constants'
import { StoredExerciseImage, WorkoutType } from '../../Utils/types'
import { getCurrentTime, nanoid } from '../../Utils'

export type GetWorkoutsActionType = {
  uid: string
  findBy: 'ownerUid' | 'planUid'
}

export type GetWorkoutsReducerType = Omit<GetWorkoutsActionType, 'uid'> & {
  isInternet: boolean
  workouts?: WorkoutType[]
}

export type DeleteWorkoutReducerType = {
  workoutUid: string
  isInternet: boolean
}

export const workoutActionCreators = {
  getWorkouts: createAsyncThunk('workout/getWorkouts', async (props: GetWorkoutsActionType, thunkAPI) => {
    const { uid, findBy } = props
    const { workoutReducer } = thunkAPI.getState() as RootState
    let workouts: WorkoutType[] = []
    try {
      const net = await NetInfo.fetch()
      const isInternet = net.isConnected
      if (isInternet) {
        let snapshot
        let objectKey: 'workouts' | 'workoutsInPlan' = 'workouts'

        switch (findBy) {
          case 'ownerUid':
            snapshot = await FB_Collection_Workouts.where('ownerUid', '==', uid).limit(QUERY_LIMIT).get()
            objectKey = 'workouts'
            break
          case 'planUid':
            snapshot = await FB_Collection_Workouts.where('plansUid', 'array-contains', uid).limit(QUERY_LIMIT).get()
            objectKey = 'workoutsInPlan'
            break
          default:
            break
        }
        snapshot.docs.forEach(doc => workouts.push({ ...doc.data(), uid: doc.id } as WorkoutType))

        //Synchronize data local Storage & Database
        const newWorkouts: WorkoutType[] = workouts
          ?.filter(st => !workoutReducer.deletedWorkoutUids?.includes(st.uid))
          ?.map(bd => {
            const stored = workoutReducer[objectKey]?.find(st => st.uid === bd.uid)
            if (!stored) return bd

            const { uid, ...storedWorkout } = stored
            const isStoredUpdated = (stored?.lastUpdated || 0) > (bd?.lastUpdated || 0)
            if (isStoredUpdated) FB_Collection_Workouts.doc(uid).set(storedWorkout)
            return isStoredUpdated ? stored : bd
          })

        //delete workouts in Database if it was deleted in Storage
        workoutReducer.deletedWorkoutUids?.forEach(deletedUid => FB_Collection_Workouts.doc(deletedUid).delete())

        //if workout Stored but didn't exist in Database
        workoutReducer[objectKey]
          ?.filter(st => (findBy === 'planUid' ? st.plansUid.includes(uid) : st))
          ?.forEach(workout => {
            if (!newWorkouts.find(st => st.uid === workout.uid)) {
              newWorkouts.push(workout)
              const { uid, ...storedWorkout } = workout
              FB_Collection_Workouts.doc(uid).set(storedWorkout)
            }
          })
        return { findBy, workouts: newWorkouts, isInternet } as GetWorkoutsReducerType
      }

      if (findBy === 'planUid') {
        workouts = workoutReducer?.workouts?.filter(workout => workout.plansUid.includes(uid)) || []
      } else {
        workouts = workoutReducer?.workouts
      }
      return { findBy, workouts, isInternet } as GetWorkoutsReducerType
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  }),

  addWorkout: createAsyncThunk('workout/addWorkout', async (props: WorkoutType, thunkAPI) => {
    props.lastUpdated = getCurrentTime()
    props.uid = props?.uid || nanoid()
    const { uid, ...newWorkout } = props
    try {
      const net = await NetInfo.fetch()
      if (net.isConnected) {
        await FB_Collection_Workouts.doc(uid).set(newWorkout)
      }
      const planUid = props.plansUid[0]
      if (planUid)
        thunkAPI.dispatch(
          plansActionCreators.changeWorkoutsCount({
            planUid,
            workoutUid: props.uid,
            type: 'add'
          })
        )
      return props
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  }),

  updateWorkout: createAsyncThunk('workout/updateWorkout', async (props: WorkoutType, thunkAPI) => {
    props.lastUpdated = getCurrentTime()
    const { uid, plansUid, ownerUid, labels, name, exercises, lastUpdated } = props
    const workout: Omit<WorkoutType, 'uid'> = {
      plansUid,
      ownerUid,
      labels,
      name,
      exercises,
      lastUpdated
    }
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

  deleteWorkout: createAsyncThunk('workout/deleteWorkout', async (workout: WorkoutType, thunkAPI) => {
    try {
      workout.plansUid.forEach(planUid => {
        thunkAPI.dispatch(plansActionCreators.changeWorkoutsCount({ planUid, workoutUid: workout.uid, type: 'delete' }))
      })
      const net = await NetInfo.fetch()
      const isInternet = net.isConnected
      if (isInternet) {
        await FB_Collection_Workouts.doc(workout.uid).delete()
      }
      return { workoutUid: workout.uid, isInternet } as DeleteWorkoutReducerType
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
  })
}
