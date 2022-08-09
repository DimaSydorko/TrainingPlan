import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DeletePlanReducerType, GetPlanReducerType, plansAC } from './PlansAC'
import { PlanType } from '../../Utils/types'

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
    [plansAC.getPlans.fulfilled.type]: (state, { payload }: PayloadAction<GetPlanReducerType>) => {
      if (payload.isInternet) {
        state.plans = payload.plans
        state.deletedPlanUids = []
      }
      state.isLoading = false
      state.error = ''
    },
    [plansAC.deletePlan.fulfilled.type]: (state, { payload }: PayloadAction<DeletePlanReducerType>) => {
      state.plans = state.plans.filter(plan => plan.uid !== payload.planUid)
      if (!payload.isInternet) state.deletedPlanUids.push(payload.planUid)
      state.isLoading = false
      state.error = ''
    },
    [plansAC.addPlan.fulfilled.type]: (state, { payload }: PayloadAction<PlanType>) => {
      state.plans.push(payload)
      state.isLoading = false
      state.error = ''
    },
    [plansAC.updatePlan.fulfilled.type]: updatePlan,
    [plansAC.changeWorkoutsCount.fulfilled.type]: updatePlan,

    [plansAC.changeWorkoutsCount.pending.type]: onLoading,
    [plansAC.getPlans.pending.type]: onLoading,
    [plansAC.addPlan.pending.type]: onLoading,

    [plansAC.getPlans.rejected.type]: onError,
    [plansAC.addPlan.rejected.type]: onError,
    [plansAC.deletePlan.rejected.type]: onError,
    [plansAC.updatePlan.rejected.type]: onError,
    [plansAC.changeWorkoutsCount.rejected.type]: onError,
  },
})
export const { errorPlansClear, selectPlan, clearPlaneResults, changePlansPosition } = plansSlice.actions
export default plansSlice.reducer
