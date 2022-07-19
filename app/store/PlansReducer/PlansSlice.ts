import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  ChangeWorkoutsCountType,
  DeletePlanReducerType,
  GetPlanReducerType,
  plansActionCreators,
} from './PlansActionCreators'
import { PlanType } from '../../Utils/types'
import { getCurrentTime } from '../../Utils'

export interface PlansSliceType {
  plans: PlanType[]
  selectedPlan: PlanType | null
  deletedPlanUids: string[]
  sortedPlanUids: string[]
  isLoading: boolean
  error: string
}

const initialState: PlansSliceType = {
  plans: [],
  selectedPlan: null,
  deletedPlanUids: [],
  sortedPlanUids: [],
  isLoading: false,
  error: '',
}

const onError = (state: PlansSliceType, { payload }: PayloadAction<string>) => {
  state.isLoading = false
  state.error = `Plan ${payload}`
}

const onLoading = (state: PlansSliceType) => {
  state.isLoading = true
}

const updatePlan = (state, { payload }: PayloadAction<PlanType>) => {
  state.plans = state.plans.map(plan => (plan.uid === payload.uid ? payload : plan))
  if (state.selectedPlan.uid === payload.uid) state.selectedPlan = payload
  state.isLoading = false
  state.error = ''
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
    changePlansPosition(state, { payload }: PayloadAction<string[]>) {
      state.sortedPlanUids = payload
    },
    clearPlaneResults(state) {
      state.error = ''
      state.isLoading = false
      state.plans = initialState.plans
      state.selectedPlan = initialState.selectedPlan
      state.deletedPlanUids = initialState.deletedPlanUids
      state.sortedPlanUids = initialState.sortedPlanUids
    },
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
      state.isLoading = false
      state.error = ''
    },
    [plansActionCreators.updatePlan.fulfilled.type]: updatePlan,
    [plansActionCreators.changeWorkoutsCount.fulfilled.type]: updatePlan,

    [plansActionCreators.changeWorkoutsCount.pending.type]: onLoading,
    [plansActionCreators.getPlans.pending.type]: onLoading,
    [plansActionCreators.addPlan.pending.type]: onLoading,

    [plansActionCreators.getPlans.rejected.type]: onError,
    [plansActionCreators.addPlan.rejected.type]: onError,
    [plansActionCreators.deletePlan.rejected.type]: onError,
    [plansActionCreators.updatePlan.rejected.type]: onError,
    [plansActionCreators.changeWorkoutsCount.rejected.type]: onError,
  },
})
export const { errorPlansClear, selectPlan, clearPlaneResults, changePlansPosition } = plansSlice.actions
export default plansSlice.reducer
