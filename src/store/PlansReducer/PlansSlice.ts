import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {plansActionCreators} from "./PlansActionCreators";
import {PlanType} from "../../Utils/types";

interface PlansSlice {
  plans: PlanType[]
  isLoading: boolean
  error: string
}

const initialState: PlansSlice = {
  plans: [],
  isLoading: false,
  error: '',
}

const onError = (state: PlansSlice, {payload}: PayloadAction<string>) => {
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
    }
  },
  extraReducers: {
    [plansActionCreators.getPlans.fulfilled.type]: (state, {payload}: PayloadAction<PlanType[]>) => {
      state.plans = payload
      state.isLoading = false
      state.error = ''
    },
    [plansActionCreators.getPlans.pending.type]: onLoading,
    [plansActionCreators.addPlan.pending.type]: onLoading,
    [plansActionCreators.deletePlan.pending.type]: onLoading,
    [plansActionCreators.updatePlan.pending.type]: onLoading,

    [plansActionCreators.getPlans.rejected.type]: onError,
    [plansActionCreators.addPlan.rejected.type]: onError,
    [plansActionCreators.deletePlan.rejected.type]: onError,
    [plansActionCreators.updatePlan.rejected.type]: onError,
  }
})
export const {errorPlansClear} = plansSlice.actions
export default plansSlice.reducer;