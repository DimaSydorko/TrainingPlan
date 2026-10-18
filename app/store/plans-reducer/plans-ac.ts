import { createAsyncThunk } from '@reduxjs/toolkit'
import NetInfo from '@react-native-community/netinfo'
import { deleteDoc, doc, getDocs, limit, query, setDoc, where } from 'firebase/firestore'
import { plansCollection } from '../../utils/firebase'
import { updateSelectedWorkout } from '../workout-reducer/workout-slice'
import { QUERY_LIMIT } from '../../utils/constants'
import { PlanType, WorkoutType } from '../../utils/types'
import { getCurrentTime, nanoid } from '../../utils'
import type { RootState } from '../index'
import { errorMessage, ownedBy, splitUid, syncWithRemote } from '../sync'
import { pushSync } from '../firestore'

export type GetPlanReducerType = {
  plans?: PlanType[]
  isInternet: boolean
}

export type DeletePlanReducerType = {
  planUid: string
  isInternet: boolean
}

export const plansAC = {
  getPlans: createAsyncThunk('plans/getPlans', async (_, thunkAPI) => {
    const { plansReducer, userReducer } = thunkAPI.getState() as RootState
    const userUid: string = userReducer.user.uid
    try {
      const net = await NetInfo.fetch()
      const isInternet = net.isConnected
      if (isInternet) {
        const snapshot = await getDocs(query(plansCollection, where('ownerUid', '==', userUid), limit(QUERY_LIMIT)))
        const plans = snapshot.docs.map(d => ({ ...d.data(), uid: d.id } as PlanType))

        // Synchronize local storage and the database
        const { merged, toUpload, toDelete } = syncWithRemote(
          plans,
          ownedBy(plansReducer.plans, userUid),
          plansReducer.deletedPlanUids
        )
        pushSync(plansCollection, toUpload, toDelete)
        return { plans: merged, isInternet } as GetPlanReducerType
      }
      return { plans: [], isInternet } as GetPlanReducerType
    } catch (e) {
      return thunkAPI.rejectWithValue(errorMessage(e))
    }
  }),

  addPlan: createAsyncThunk('plans/addPlans', async (props: PlanType, thunkAPI) => {
    const { userReducer } = thunkAPI.getState() as RootState
    const newPlan: PlanType = {
      ...props,
      uid: props?.uid || nanoid(),
      ownerUid: props?.ownerUid || userReducer.user.uid,
      lastUpdated: getCurrentTime(),
    }
    const { uid, data } = splitUid(newPlan)
    try {
      const net = await NetInfo.fetch()
      if (net.isConnected) {
        await setDoc(doc(plansCollection, uid), data)
      }
      return newPlan
    } catch (e) {
      return thunkAPI.rejectWithValue(errorMessage(e))
    }
  }),

  updatePlan: createAsyncThunk('plans/updatePlan', async (props: PlanType, thunkAPI) => {
    const updated: PlanType = { ...props, lastUpdated: getCurrentTime() }
    const { uid, data } = splitUid(updated)
    try {
      const net = await NetInfo.fetch()
      if (net.isConnected) {
        await setDoc(doc(plansCollection, uid), data)
      }
      return updated
    } catch (e) {
      return thunkAPI.rejectWithValue(errorMessage(e))
    }
  }),

  updateSelectedPlanWorkout: createAsyncThunk(
    'plans/updateSelectedPlanWorkout',
    async (workout: WorkoutType, thunkAPI) => {
      const { plansReducer } = thunkAPI.getState() as RootState
      const { uid, data: current } = splitUid(plansReducer.selectedPlan)
      const selectedPlan: Omit<PlanType, 'uid'> = {
        ...current,
        lastUpdated: getCurrentTime(),
        workouts: current.workouts.map(w => (w.uid === workout.uid ? workout : w)),
      }
      try {
        const net = await NetInfo.fetch()
        if (net.isConnected) {
          await setDoc(doc(plansCollection, uid), selectedPlan)
        }
        thunkAPI.dispatch(updateSelectedWorkout(workout))
        return { uid, ...selectedPlan } as PlanType
      } catch (e) {
        return thunkAPI.rejectWithValue(errorMessage(e))
      }
    }
  ),

  deletePlan: createAsyncThunk('plans/deletePlan', async (planUid: string, thunkAPI) => {
    try {
      const net = await NetInfo.fetch()
      const isInternet = net.isConnected
      if (isInternet) {
        await deleteDoc(doc(plansCollection, planUid))
      }
      return { planUid, isInternet } as DeletePlanReducerType
    } catch (e) {
      return thunkAPI.rejectWithValue(errorMessage(e))
    }
  }),
}
