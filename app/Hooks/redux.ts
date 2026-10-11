import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../store'
import { PlansSliceType } from '../store/PlansReducer/PlansSlice'
import { SettingsSliceType } from '../store/SettingsReducer/SettingsSlice'
import { WorkoutSliceType } from '../store/WorkoutReducer/WorkoutSlice'
import { UserSliceType } from '../store/UserReducer/UserSlice'
import { PublicationsSliceType } from '../store/PublicationsReducer/PublicationsSlice'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

export const useUser = (): UserSliceType => useAppSelector(state => state.userReducer)
export const usePlans = (): PlansSliceType => useAppSelector(state => state.plansReducer)
export const useWorkout = (): WorkoutSliceType => useAppSelector(state => state.workoutReducer)
export const useSettings = (): SettingsSliceType => useAppSelector(state => state.settingsReducer)
export const usePublications = (): PublicationsSliceType => useAppSelector(state => state.publicationsReducer)
