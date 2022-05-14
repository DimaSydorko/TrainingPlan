import { createAsyncThunk } from '@reduxjs/toolkit'
import { plansActionCreators } from '../PlansReducer/PlansActionCreators'
import { FB_Collection_Workouts, FB_Database } from '../../Utils/firebase'
import { FirebaseDatabase, QUERY_LIMIT } from '../../Utils/constants'
import { StoredExerciseImage, WorkoutType } from '../../Utils/types'

export const workoutActionCreators = {
  getWorkouts: createAsyncThunk(
    'workout/getWorkouts',
    async ({ uid, findBy }: { uid: string; findBy: 'ownerUid' | 'planUid' }, thunkAPI) => {
      try {
        const snapshot =
          findBy === 'ownerUid'
            ? await FB_Collection_Workouts.where('ownerUid', '==', uid).limit(QUERY_LIMIT).get()
            : await FB_Collection_Workouts.where('plansUid', 'array-contains', uid).limit(QUERY_LIMIT).get()
        const workouts: WorkoutType[] = []
        snapshot.docs.forEach(doc => workouts.push({ ...doc.data(), uid: doc.id } as WorkoutType))
        return findBy === 'planUid' ? { workoutsInPlan: workouts } : { workouts: workouts }
      } catch (e) {
        return thunkAPI.rejectWithValue(e.message)
      }
    }
  ),
  addWorkout: createAsyncThunk('workout/addWorkout', async (props: WorkoutType, thunkAPI) => {
    const { uid, ...newWorkout } = props
    try {
      const doc = await FB_Collection_Workouts.add(newWorkout)
      props.uid = doc.id
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
      exercises
    }
    try {
      await FB_Collection_Workouts.doc(uid).update(workout)
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
      await FB_Collection_Workouts.doc(workout.uid).delete()
      return workout.uid
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  }),
  getExerciseImages: createAsyncThunk('workout/getExerciseImages', async (_, thunkAPI) => {
    try {
      const snapshot = await FB_Database.ref(FirebaseDatabase.ExerciseImages).get()
      return Array.isArray(snapshot.val()) ? snapshot.val() : ([] as StoredExerciseImage[])
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  })
}
