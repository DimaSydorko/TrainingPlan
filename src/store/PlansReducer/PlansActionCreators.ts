import {createAsyncThunk} from "@reduxjs/toolkit";
import {FB_Collection_Plans} from "../../Utils/firebase";
import {PlanType} from "../../Utils/types";
import {QUERY_LIMIT} from "../../Utils/constants";

export const plansActionCreators = {
  getPlans: createAsyncThunk(
    'plans/getPlans',
    async (userUid: string, thunkAPI) => {
      try {
        const snapshot = await FB_Collection_Plans.where('ownerUid', '==', userUid).limit(QUERY_LIMIT).get()
        const plans:PlanType[] = []
        snapshot.docs.forEach(doc => plans.push({...doc.data(), uid: doc.id} as PlanType))
        return plans
      } catch (e) {
        return thunkAPI.rejectWithValue(e.message)
      }
    },
  ),
  addPlan: createAsyncThunk(
    'plans/addPlans',
    async (props: { userUid: string } & PlanType, thunkAPI) => {
      try {
        await FB_Collection_Plans.add({
          ownerUid: props.ownerUid,
          name: props.name,
          labels: props.labels,
          workoutsCount: props.workoutsCount,
        })
        thunkAPI.dispatch(plansActionCreators.getPlans(props.userUid))
      } catch (e) {
        return thunkAPI.rejectWithValue(e.message)
      }
    }
  ),
  updatePlan: createAsyncThunk(
    'plans/updatePlan',
    async (props: { userUid: string } & PlanType, thunkAPI) => {
      try {
        await FB_Collection_Plans.doc(props.uid).set({
          ownerUid: props.ownerUid,
          name: props.name,
          labels: props.labels,
          workoutsCount: props.workoutsCount,
        })
        thunkAPI.dispatch(plansActionCreators.getPlans(props.userUid))
      } catch (e) {
        return thunkAPI.rejectWithValue(e.message)
      }
    }
  ),
  deletePlan: createAsyncThunk(
    'plans/deletePlan',
    async (props: { userUid: string } & PlanType, thunkAPI) => {
      try {
        await FB_Collection_Plans.doc(props.uid).delete()
        thunkAPI.dispatch(plansActionCreators.getPlans(props.userUid))
      } catch (e) {
        return thunkAPI.rejectWithValue(e.message)
      }
    }
  ),
}
