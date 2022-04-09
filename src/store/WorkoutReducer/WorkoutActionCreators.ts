import { createAsyncThunk } from '@reduxjs/toolkit'
import { FB_Collection_Workouts } from '../../Utils/firebase'
import { QUERY_LIMIT } from '../../Utils/constants'
import { WorkoutType } from '../../Utils/types'

export const workoutActionCreators = {
  getWorkouts: createAsyncThunk(
    'workout/getWorkouts',
    async ({ uid, findBy }: { uid: string, findBy: 'ownerUid' | 'planUid' }, thunkAPI) => {
      try {
        const snapshot = await FB_Collection_Workouts.where(findBy, '==', uid).limit(QUERY_LIMIT).get()
        const workouts: WorkoutType[] = []
        snapshot.docs.forEach(doc => workouts.push({ ...doc.data(), uid: doc.id } as WorkoutType))
        return findBy === 'planUid' ? { workoutsInPlan: workouts } : { workouts: workouts }
      } catch (e) {
        return thunkAPI.rejectWithValue(e.message)
      }
    },
  ),
  addWorkout: createAsyncThunk(
    'workout/addWorkout',
    async (props: WorkoutType, thunkAPI) => {
      let { ownerUid, planUid, name, labels, exercises } = props
      if (!planUid) planUid = ''
      try {
        await FB_Collection_Workouts.add({ ownerUid, planUid, name, labels, exercises })
        if (planUid) {
          thunkAPI.dispatch(workoutActionCreators.getWorkouts({ uid: planUid, findBy: 'planUid' }))
        }
      } catch (e) {
        return thunkAPI.rejectWithValue(e.message)
      }
    },
  ),
  updateWorkout: createAsyncThunk(
    'workout/updateWorkout',
    async (props: WorkoutType, thunkAPI) => {
      const { uid, ...workout } = props
      try {
        await FB_Collection_Workouts.doc(uid).update(workout)
        return props
      } catch (e) {
        return thunkAPI.rejectWithValue(e.message)
      }
    },
  ),
  deleteWorkout: createAsyncThunk(
    'workout/deleteWorkout',
    async (workoutUid: string, thunkAPI) => {
      try {
        await FB_Collection_Workouts.doc(workoutUid).delete()
        return workoutUid
      } catch (e) {
        return thunkAPI.rejectWithValue(e.message)
      }
    },
  ),
}
