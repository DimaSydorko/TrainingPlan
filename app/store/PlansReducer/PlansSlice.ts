import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { plansActionCreators } from './PlansActionCreators'
import { PlanType } from '../../Utils/types'

interface PlansSlice {
  plans: PlanType[]
  selectedPlan: PlanType | null
  isLoading: boolean
  error: string
}

const initialState: PlansSlice = {
  plans: [],
  selectedPlan: null,
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
    }
  },
  extraReducers: {
    [plansActionCreators.getPlans.fulfilled.type]: (state, { payload }: PayloadAction<PlanType[]>) => {
      state.plans = payload
      state.isLoading = false
      state.error = ''
    },
    [plansActionCreators.deletePlan.fulfilled.type]: (state, { payload }: PayloadAction<string>) => {
      state.plans = state.plans.filter(plan => plan.uid !== payload)
      state.isLoading = false
      state.error = ''
    },
    [plansActionCreators.updatePlan.fulfilled.type]: (state, { payload }: PayloadAction<PlanType>) => {
      state.plans = state.plans.map(plan => (plan.uid === payload.uid ? payload : plan))
      if (state.selectedPlan.uid === payload.uid) state.selectedPlan = payload
      state.error = ''
      state.isLoading = false
    },
    [plansActionCreators.incrementPlanWorkoutsCount.fulfilled.type]: (
      state,
      { payload }: PayloadAction<{ planUid: string; value: number }>
    ) => {
      state.plans = state.plans.map(plan =>
        plan.uid === payload.planUid ? { ...plan, workoutsCount: plan.workoutsCount + payload.value } : plan
      )
      if (state?.selectedPlan?.uid === payload.planUid) {
        state.selectedPlan.workoutsCount = state.selectedPlan.workoutsCount + payload.value
      }
      state.error = ''
    },
    [plansActionCreators.getPlans.pending.type]: onLoading,
    [plansActionCreators.addPlan.pending.type]: onLoading,

    [plansActionCreators.getPlans.rejected.type]: onError,
    [plansActionCreators.addPlan.rejected.type]: onError,
    [plansActionCreators.deletePlan.rejected.type]: onError,
    [plansActionCreators.updatePlan.rejected.type]: onError,
    [plansActionCreators.incrementPlanWorkoutsCount.rejected.type]: onError
  }
})
export const { errorPlansClear, selectPlan, clearPlaneResults } = plansSlice.actions
export default plansSlice.reducer
