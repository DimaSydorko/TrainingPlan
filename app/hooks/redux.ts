import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@store'
import { PlansSliceType } from '@store/plans-reducer/plans-slice'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

export const usePlans = (): PlansSliceType => useAppSelector(state => state.plansReducer)
export const useExerciseImages = () => useAppSelector(state => state.workoutReducer.exerciseImages)
