import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { plansActionCreators } from './PlansActionCreators'
import { PlanType } from '../../Utils/types'

interface PlansSlice {
  plans: PlanType[]
  selectedPlan: PlanType | null,
  isLoading: boolean
  error: string
}

const initialState: PlansSlice = {
  plans: [],
  selectedPlan: null,
  isLoading: false,
  error: '',
}

const onError = (state: PlansSlice, { payload }: PayloadAction<string>) => {
  state.isLoading = false
  state.error = payload
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
      state.plans = state.plans.map(plan => {
        if (plan.uid === payload.uid) return payload
        else return plan
      })
      state.isLoading = false
      state.error = ''
    },
    [plansActionCreators.incrementPlanWorkoutsCount.fulfilled.type]:
      (state, { payload }: PayloadAction<{ planUid: string, value: number }>) => {
        state.plans = state.plans.map(plan => {
          if (plan.uid === payload.planUid) return { ...plan, workoutsCount: plan.workoutsCount + payload.value }
          else return plan
        })
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
    [plansActionCreators.incrementPlanWorkoutsCount.rejected.type]: onError,
  },
})
export const { errorPlansClear, selectPlan } = plansSlice.actions
export default plansSlice.reducer