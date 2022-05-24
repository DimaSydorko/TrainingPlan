import { createAsyncThunk } from '@reduxjs/toolkit'
import NetInfo from '@react-native-community/netinfo'
import { plansActionCreators } from '../PlansReducer/PlansActionCreators'
import { FB_Collection_Workouts, FB_Database } from '../../Utils/firebase'
import { FirebaseDatabase, QUERY_LIMIT } from '../../Utils/constants'
import { StoredExerciseImage, WorkoutType } from '../../Utils/types'
import { nanoid } from '../../Utils'

export type GetWorkoutsActionType = {
  uid: string
  findBy: 'ownerUid' | 'planUid'
}

const lastUpdated = new Date().getTime()

export const workoutActionCreators = {
  getWorkouts: createAsyncThunk('workout/getWorkouts', async (props: GetWorkoutsActionType, thunkAPI) => {
    const { uid, findBy } = props
    try {
      const net = await NetInfo.fetch()
      if (net.isConnected) {
        const workouts: WorkoutType[] = []
        const snapshot =
          findBy === 'ownerUid'
            ? await FB_Collection_Workouts.where('ownerUid', '==', uid).limit(QUERY_LIMIT).get()
            : await FB_Collection_Workouts.where('plansUid', 'array-contains', uid).limit(QUERY_LIMIT).get()
        snapshot.docs.forEach(doc => workouts.push({ ...doc.data(), uid: doc.id } as WorkoutType))
        return {
          ...props,
          workoutsInPlan: findBy === 'planUid' ? workouts : undefined,
          workouts: findBy === 'ownerUid' ? workouts : undefined
        }
      }
      return props
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  }),

  addWorkout: createAsyncThunk('workout/addWorkout', async (props: WorkoutType, thunkAPI) => {
    props.lastUpdated = lastUpdated
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
    const { uid, plansUid, ownerUid, labels, name, exercises } = props
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
      if (net.isConnected) {
        await FB_Collection_Workouts.doc(workout.uid).delete()
      }
      return workout.uid
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
