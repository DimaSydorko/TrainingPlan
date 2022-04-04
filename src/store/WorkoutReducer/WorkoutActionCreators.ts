import {createAsyncThunk} from "@reduxjs/toolkit";
import {FB_Collection_Workouts} from "../../Utils/firebase";
import {plansActionCreators} from "../PlansReducer/PlansActionCreators";
import {selectWorkout} from "./WorkoutSlice";
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
    async (props: WorkoutPlanType & PlanType & { userUid: string }, thunkAPI) => {
      const {ownerUid, planUid, name, labels, exercises, uid, workoutsCount, userUid} = props
      try {
        await FB_Collection_Workouts.add({ownerUid, planUid, name, labels, exercises})
        await Promise.all([
          thunkAPI.dispatch(plansActionCreators.updatePlan({
            uid,
            name,
            labels,
            ownerUid,
            workoutsCount: workoutsCount + 1,
            userUid
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
    async (props: WorkoutPlanType & { workoutUid: string, userUid: string }, thunkAPI) => {
      const {workoutUid, userUid, ...plan} = props;
      try {
        await FB_Collection_Workouts.doc(workoutUid).update(plan)
        await thunkAPI.dispatch(workoutActionCreators.getWorkouts(workoutUid))
        thunkAPI.dispatch(selectWorkout(workoutUid))
      } catch (e) {
        return thunkAPI.rejectWithValue(e.message)
      }
    }
  ),
  deleteWorkout: createAsyncThunk(
    'workout/deleteWorkout',
    async (props: PlanType & { workoutUid: string, userUid: string }, thunkAPI) => {
      const {workoutUid, userUid, ...plan} = props;
      try {
        await FB_Collection_Workouts.doc(workoutUid).delete()
        await Promise.all([
          thunkAPI.dispatch(plansActionCreators.updatePlan({
            ...plan,
            workoutsCount: plan.workoutsCount - 1,
            userUid,
          })),
          thunkAPI.dispatch(workoutActionCreators.getWorkouts(props.uid))
        ])
      } catch (e) {
        return thunkAPI.rejectWithValue(e.message)
      }
    }
  ),
}
