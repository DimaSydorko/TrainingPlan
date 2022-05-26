import { createAsyncThunk } from '@reduxjs/toolkit'
import NetInfo from '@react-native-community/netinfo'
import { FB_Collection_Plans, FB_FieldValue } from '../../Utils/firebase'
import { QUERY_LIMIT } from '../../Utils/constants'
import { PlanType } from '../../Utils/types'
import { getCurrentTime, nanoid } from '../../Utils'
import { RootState } from '../index'

export interface ChangeWorkoutsCountType {
  planUid: string
  workoutUid: string
  type: 'add' | 'delete'
}

export type GetPlanReducerType = {
  plans?: PlanType[]
  isInternet: boolean
}

export type DeletePlanReducerType = {
  planUid: string
  isInternet: boolean
}

export const plansActionCreators = {
  getPlans: createAsyncThunk('plans/getPlans', async (userUid: string, thunkAPI) => {
    const plans: PlanType[] = []
    const { plansReducer }: RootState = thunkAPI.getState()
    try {
      const net = await NetInfo.fetch()
      const isInternet = net.isConnected
      if (isInternet) {
        const snapshot = await FB_Collection_Plans.where('ownerUid', '==', userUid).limit(QUERY_LIMIT).get()
        snapshot.docs.forEach(doc => plans.push({ ...doc.data(), uid: doc.id } as PlanType))

        //Synchronize data local Storage & Database
        const newPlans: PlanType[] =
          plans
            ?.filter(st => !plansReducer.deletedPlanUids?.includes(st.uid))
            ?.map(bd => {
              const stored = plansReducer?.plans?.find(st => st.uid === bd.uid)
              if (!stored) return bd

              const { uid, ...storedPlan } = stored
              const isStoredUpdated = (stored?.lastUpdated || 0) > (bd?.lastUpdated || 0)

              if (isStoredUpdated) FB_Collection_Plans.doc(uid).set(storedPlan)
              return isStoredUpdated ? stored : bd
            }) || []

        //delete workouts in Database if it was deleted in Storage
        plansReducer.deletedPlanUids?.forEach(deletedUid => FB_Collection_Plans.doc(deletedUid).delete())

        //if plan Stored but didn't exist in Database
        plansReducer.plans.forEach(plan => {
          if (!newPlans.find(st => st.uid === plan.uid)) {
            newPlans.push(plan)
            const { uid, ...storedPlan } = plan
            FB_Collection_Plans.doc(uid).set(storedPlan)
          }
        })
        return { plans: newPlans, isInternet } as GetPlanReducerType
      }
      return { plans, isInternet } as GetPlanReducerType
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  }),

  addPlan: createAsyncThunk('plans/addPlans', async (props: PlanType, thunkAPI) => {
    props.uid = props?.uid || nanoid()
    props.lastUpdated = getCurrentTime()
    const { uid, ...plan } = props
    try {
      const net = await NetInfo.fetch()
      if (net.isConnected) {
        await FB_Collection_Plans.doc(uid).set(plan)
      }
      return props
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  }),

  updatePlan: createAsyncThunk('plans/updatePlan', async (props: PlanType, thunkAPI) => {
    props.lastUpdated = getCurrentTime()
    const { uid, ...plan } = props
    try {
      const net = await NetInfo.fetch()
      if (net.isConnected) {
        await FB_Collection_Plans.doc(uid).set(plan)
      }
      return props
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  }),

  changeWorkoutsCount: createAsyncThunk(
    'plans/changeWorkoutsCount',
    async (props: ChangeWorkoutsCountType, thunkAPI) => {
      try {
        const net = await NetInfo.fetch()
        if (net.isConnected) {
          await FB_Collection_Plans.doc(props.planUid).update({
            workoutUids:
              props.type === 'add'
                ? FB_FieldValue.arrayUnion(props.workoutUid)
                : FB_FieldValue.arrayRemove(props.workoutUid),
            lastUpdated: getCurrentTime()
          })
        }
        return props
      } catch (e) {
        return thunkAPI.rejectWithValue(e.message)
      }
    }
  ),

  deletePlan: createAsyncThunk('plans/deletePlan', async (planUid: string, thunkAPI) => {
    try {
      const net = await NetInfo.fetch()
      const isInternet = net.isConnected
      if (isInternet) {
        await FB_Collection_Plans.doc(planUid).delete()
      }
      return { planUid, isInternet } as DeletePlanReducerType
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  })
}
