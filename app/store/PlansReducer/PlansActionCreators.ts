import { createAsyncThunk } from '@reduxjs/toolkit'
import { FB_Collection_Plans, FB_FieldValue } from '../../Utils/firebase'
import { QUERY_LIMIT } from '../../Utils/constants'
import { PlanType } from '../../Utils/types'

export interface ChangeWorkoutsCountType {
  planUid: string
  workoutUid: string
  type: 'add' | 'delete'
}

export const plansActionCreators = {
  getPlans: createAsyncThunk('plans/getPlans', async (userUid: string, thunkAPI) => {
    try {
      const snapshot = await FB_Collection_Plans.where('ownerUid', '==', userUid).limit(QUERY_LIMIT).get()
      const plans: PlanType[] = []
      snapshot.docs.forEach(doc => plans.push({ ...doc.data(), uid: doc.id } as PlanType))
      return plans
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  }),
  addPlan: createAsyncThunk('plans/addPlans', async (props: PlanType, thunkAPI) => {
    const { ownerUid, uid, ...plan } = props
    try {
      await FB_Collection_Plans.add({ ...plan, ownerUid })
      thunkAPI.dispatch(plansActionCreators.getPlans(ownerUid))
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  }),
  updatePlan: createAsyncThunk('plans/updatePlan', async (props: PlanType, thunkAPI) => {
    const { uid, ...plan } = props
    try {
      await FB_Collection_Plans.doc(uid).set(plan)
      return props
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  }),
  changeWorkoutsCount: createAsyncThunk(
    'plans/changeWorkoutsCount',
    async (props: ChangeWorkoutsCountType, thunkAPI) => {
      try {
        await FB_Collection_Plans.doc(props.planUid).update({
          workoutUids:
            props.type === 'add'
              ? FB_FieldValue.arrayUnion(props.workoutUid)
              : FB_FieldValue.arrayRemove(props.workoutUid)
        })
        return props
      } catch (e) {
        return thunkAPI.rejectWithValue(e.message)
      }
    }
  ),
  deletePlan: createAsyncThunk('plans/deletePlan', async (planUid: string, thunkAPI) => {
    try {
      await FB_Collection_Plans.doc(planUid).delete()
      return planUid
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message)
    }
  })
}
