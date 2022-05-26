import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  ChangeWorkoutsCountType,
  DeletePlanReducerType,
  GetPlanReducerType,
  plansActionCreators
} from './PlansActionCreators'
import { PlanType } from '../../Utils/types'
import { getCurrentTime } from '../../Utils'

export interface PlansSlice {
  plans: PlanType[]
  selectedPlan: PlanType | null
  deletedPlanUids: string[]
  isLoading: boolean
  error: string
}

const initialState: PlansSlice = {
  plans: [],
  selectedPlan: null,
  deletedPlanUids: [],
  isLoading: false,
  error: ''
}

const onError = (state: PlansSlice, { payload }: PayloadAction<string>) => {
  state.isLoading = false
  state.error = `Plan ${payload}`
}

const onLoading = (state: PlansSlice) => {
  state.isLoading = true
}

export const plansSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {
    errorPlansClear(state) {
      state.error = ''
    },
    selectPlan(state, action: PayloadAction<PlanType>) {
      state.selectedPlan = action.payload
    },
    clearPlaneResults(state) {
      state.error = ''
      state.isLoading = false
      state.plans = initialState.plans
      state.selectedPlan = initialState.selectedPlan
      state.deletedPlanUids = initialState.deletedPlanUids
    }
  },
  extraReducers: {
    [plansActionCreators.getPlans.fulfilled.type]: (state, { payload }: PayloadAction<GetPlanReducerType>) => {
      if (payload.isInternet) {
        state.plans = payload.plans
        state.deletedPlanUids = []
      }
      state.isLoading = false
      state.error = ''
    },
    [plansActionCreators.deletePlan.fulfilled.type]: (state, { payload }: PayloadAction<DeletePlanReducerType>) => {
      state.plans = state.plans.filter(plan => plan.uid !== payload.planUid)
      if (!payload.isInternet) state.deletedPlanUids.push(payload.planUid)
      state.isLoading = false
      state.error = ''
    },
    [plansActionCreators.addPlan.fulfilled.type]: (state, { payload }: PayloadAction<PlanType>) => {
      state.plans.push(payload)
    },
    [plansActionCreators.updatePlan.fulfilled.type]: (state, { payload }: PayloadAction<PlanType>) => {
      state.plans = state.plans.map(plan => (plan.uid === payload.uid ? payload : plan))
      if (state.selectedPlan.uid === payload.uid) state.selectedPlan = payload
      state.error = ''
      state.isLoading = false
    },
    [plansActionCreators.changeWorkoutsCount.fulfilled.type]: (
      state,
      { payload }: PayloadAction<ChangeWorkoutsCountType>
    ) => {
      const changeWorkoutUids = (plan: PlanType) => {
        return payload.type === 'add'
          ? [...plan.workoutUids, payload.workoutUid]
          : plan.workoutUids.filter(uid => uid !== payload.workoutUid)
      }
      state.plans = state.plans.map(plan =>
        plan.uid === payload.planUid
          ? {
              ...plan,
              workoutUids: changeWorkoutUids(plan),
              lastUpdated: getCurrentTime()
            }
          : plan
      )
      if (state?.selectedPlan?.uid === payload.planUid) {
        state.selectedPlan.workoutUids = changeWorkoutUids(state.selectedPlan)
        state.selectedPlan.lastUpdated = getCurrentTime()
      }
      state.error = ''
    },
    [plansActionCreators.getPlans.pending.type]: onLoading,
    [plansActionCreators.addPlan.pending.type]: onLoading,

    [plansActionCreators.getPlans.rejected.type]: onError,
    [plansActionCreators.addPlan.rejected.type]: onError,
    [plansActionCreators.deletePlan.rejected.type]: onError,
    [plansActionCreators.updatePlan.rejected.type]: onError,
    [plansActionCreators.changeWorkoutsCount.rejected.type]: onError
  }
})
export const { errorPlansClear, selectPlan, clearPlaneResults } = plansSlice.actions
export default plansSlice.reducer
