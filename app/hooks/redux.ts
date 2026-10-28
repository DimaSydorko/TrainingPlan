import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@store'
import { PlansSliceType } from '@store/plans-reducer/plans-slice'
import { WorkoutSliceType } from '@store/workout-reducer/workout-slice'
import { UserSliceType } from '@store/user-reducer/user-slice'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

export const useUser = (): UserSliceType => useAppSelector(state => state.userReducer)
export const usePlans = (): PlansSliceType => useAppSelector(state => state.plansReducer)
export const useWorkout = (): WorkoutSliceType => useAppSelector(state => state.workoutReducer)
