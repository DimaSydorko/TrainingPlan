import {createAsyncThunk} from "@reduxjs/toolkit";
import {FB_Collection_Workouts} from "../../Utils/firebase";
import {plansActionCreators} from "../PlansReducer/PlansActionCreators";
import {QUERY_LIMIT} from "../../Utils/constants";
import {PlanType, WorkoutPlanType} from "../../Utils/types";

export const workoutActionCreators = {
  getWorkouts: createAsyncThunk(
    'workout/getWorkouts',
    async (planUid: string, thunkAPI) => {
      try {
        const snapshot = await FB_Collection_Workouts.where('planUid', '==', planUid).limit(QUERY_LIMIT).get()
        const workoutPlans: WorkoutPlanType[] = []
        snapshot.docs.forEach(doc => workoutPlans.push({...doc.data(), uid: doc.id} as WorkoutPlanType))
        return workoutPlans
      } catch (e) {
        return thunkAPI.rejectWithValue(e.message)
      }
    }
  ),
  addWorkout: createAsyncThunk(
    'workout/addWorkout',
    async (props: WorkoutPlanType & PlanType, thunkAPI) => {
      const {ownerUid, planUid, name, labels, exercises, workoutsCount} = props
      try {
        await FB_Collection_Workouts.add({ownerUid, planUid, name, labels, exercises})
        await Promise.all([
          thunkAPI.dispatch(plansActionCreators.updatePlan({
            uid: planUid,
            name,
            labels,
            ownerUid,
            workoutsCount: workoutsCount + 1,
          })),
          thunkAPI.dispatch(workoutActionCreators.getWorkouts(planUid))
        ])
      } catch (e) {
        return thunkAPI.rejectWithValue(e.message)
      }
    }
  ),
  updateWorkout: createAsyncThunk(
    'workout/updateWorkout',
    async (props: WorkoutPlanType, thunkAPI) => {
      const {uid, ...workout} = props
      try {
        await FB_Collection_Workouts.doc(uid).update(workout)
        return props
      } catch (e) {
        return thunkAPI.rejectWithValue(e.message)
      }
    }
  ),
  deleteWorkout: createAsyncThunk(
    'workout/deleteWorkout',
    async (props: PlanType & { workoutUid: string }, thunkAPI) => {
      const {workoutUid, ...plan} = props;
      try {
        await FB_Collection_Workouts.doc(workoutUid).delete()
        await thunkAPI.dispatch(plansActionCreators.updatePlan({
            ...plan,
            workoutsCount: plan.workoutsCount - 1,
          }))
        return workoutUid
      } catch (e) {
        return thunkAPI.rejectWithValue(e.message)
      }
    }
  ),
}
