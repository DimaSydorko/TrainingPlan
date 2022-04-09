import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const useUser = () => useAppSelector(state => state.userReducer)
export const usePlans = () => useAppSelector(state => state.plansReducer)
export const useWorkout = () => useAppSelector(state => state.workoutReducer)